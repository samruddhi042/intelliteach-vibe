from sqlalchemy.orm import Session
from typing import List, Optional
from models.question import Question, QuestionType, Difficulty
from models.session import ClassSession
from models.transcript import Transcript
from services.mastery_engine import MasteryEngine
from utils.constants import (
    QUESTION_TYPE_MCQ,
    QUESTION_TYPE_SHORT_ANSWER,
    QUESTION_TYPE_CONCEPTUAL,
    QUESTION_TYPE_APPLICATION,
    DIFFICULTY_EASY,
    DIFFICULTY_MEDIUM,
    DIFFICULTY_HARD,
)


class QuestionGenerator:
    """Rule-based question generator that creates questions from transcripts and mastery gaps"""

    @staticmethod
    def generate_questions(
        db: Session,
        concepts: List[str],
        session_id: Optional[int] = None,
        transcript_text: Optional[str] = None,
        number_of_questions: int = 5,
        difficulty: Optional[Difficulty] = None,
        student_id: Optional[int] = None
    ) -> List[Question]:
        """
        Generate questions based on concepts and optionally transcript/mastery data.
        Uses rule-based templates to create explainable questions.
        """
        questions = []

        # If student_id provided, focus on concepts with low mastery
        if student_id:
            low_mastery_concepts = MasteryEngine.get_lowest_mastery_concepts(
                db, student_id, limit=len(concepts)
            )
            # Prioritize low mastery concepts
            concepts = list(set(low_mastery_concepts + concepts))[:len(concepts)]

        # Distribute question types
        question_types = QuestionGenerator._distribute_question_types(number_of_questions)
        
        # If no difficulty specified, use medium
        if not difficulty:
            difficulty = Difficulty.MEDIUM

        for i, concept in enumerate(concepts[:number_of_questions]):
            if i >= len(question_types):
                break

            q_type = question_types[i]
            question = QuestionGenerator._create_question(
                concept=concept,
                question_type=q_type,
                difficulty=difficulty,
                transcript_text=transcript_text
            )
            
            question.session_id = session_id
            db.add(question)
            questions.append(question)

        db.commit()
        
        # Refresh all questions
        for q in questions:
            db.refresh(q)

        return questions

    @staticmethod
    def _distribute_question_types(count: int) -> List[QuestionType]:
        """Distribute question types: 40% MCQ, 30% Conceptual, 20% Short Answer, 10% Application"""
        distribution = []
        
        mcq_count = int(count * 0.4)
        conceptual_count = int(count * 0.3)
        short_answer_count = int(count * 0.2)
        application_count = count - mcq_count - conceptual_count - short_answer_count

        distribution.extend([QuestionType.MCQ] * mcq_count)
        distribution.extend([QuestionType.CONCEPTUAL] * conceptual_count)
        distribution.extend([QuestionType.SHORT_ANSWER] * short_answer_count)
        distribution.extend([QuestionType.APPLICATION] * application_count)

        return distribution[:count]

    @staticmethod
    def _create_question(
        concept: str,
        question_type: QuestionType,
        difficulty: Difficulty,
        transcript_text: Optional[str] = None
    ) -> Question:
        """Create a question using rule-based templates"""
        
        # Question templates based on concept and type
        templates = QuestionGenerator._get_question_templates(concept, question_type, difficulty)
        
        # Select template (in a real system, you might use more sophisticated selection)
        import random
        template = random.choice(templates) if templates else None

        if not template:
            # Fallback template
            if question_type == QuestionType.MCQ:
                text = f"Which of the following best describes {concept}?"
                options = [
                    "Option A (correct)",
                    "Option B (incorrect)",
                    "Option C (incorrect)",
                    "Option D (incorrect)"
                ]
                correct_answer = "Option A (correct)"
            elif question_type == QuestionType.CONCEPTUAL:
                text = f"Explain the concept of {concept} in your own words."
                options = None
                correct_answer = None
            elif question_type == QuestionType.SHORT_ANSWER:
                text = f"What is {concept}?"
                options = None
                correct_answer = None
            else:  # APPLICATION
                text = f"Apply the concept of {concept} to solve a real-world problem."
                options = None
                correct_answer = None
        else:
            text = template["text"]
            options = template.get("options")
            correct_answer = template.get("correct_answer")

        # Estimate time based on type and difficulty
        estimated_time = QuestionGenerator._estimate_time(question_type, difficulty)

        return Question(
            text=text,
            type=question_type,
            difficulty=difficulty,
            concept=concept,
            estimated_time=estimated_time,
            options=options,
            correct_answer=correct_answer
        )

    @staticmethod
    def _get_question_templates(
        concept: str,
        question_type: QuestionType,
        difficulty: Difficulty
    ) -> List[dict]:
        """Get question templates for a concept. Rule-based and explainable."""
        
        # This is a simplified version. In production, you'd have a more comprehensive template system
        templates = []

        if "Newton's Second Law" in concept:
            if question_type == QuestionType.MCQ:
                templates.append({
                    "text": "A 5 kg object is accelerated at 3 m/s². What is the net force acting on the object?",
                    "options": ["15 N", "8 N", "1.67 N", "45 N"],
                    "correct_answer": "15 N"
                })
            elif question_type == QuestionType.CONCEPTUAL:
                templates.append({
                    "text": "Explain why a heavier truck requires more force to accelerate at the same rate as a lighter car.",
                    "correct_answer": None
                })
            elif question_type == QuestionType.APPLICATION:
                templates.append({
                    "text": "A 1000 kg car brakes from 20 m/s to rest in 4 seconds. Calculate the braking force and the work done by friction.",
                    "correct_answer": None
                })

        if "Newton's Third Law" in concept:
            if question_type == QuestionType.CONCEPTUAL:
                templates.append({
                    "text": "A rocket expels gas at high velocity. Using Newton's Third Law, explain how this propels the rocket forward.",
                    "correct_answer": None
                })

        if "Momentum" in concept or "Impulse" in concept:
            if question_type == QuestionType.APPLICATION:
                templates.append({
                    "text": "Two blocks of masses 2 kg and 3 kg are connected by a string over a frictionless pulley. Find the acceleration of the system.",
                    "correct_answer": None
                })

        # If no specific template, return empty (will use fallback)
        return templates

    @staticmethod
    def _estimate_time(question_type: QuestionType, difficulty: Difficulty) -> int:
        """Estimate time in minutes based on question type and difficulty"""
        base_times = {
            QuestionType.MCQ: 2,
            QuestionType.SHORT_ANSWER: 4,
            QuestionType.CONCEPTUAL: 5,
            QuestionType.APPLICATION: 7,
        }

        difficulty_multipliers = {
            Difficulty.EASY: 0.8,
            Difficulty.MEDIUM: 1.0,
            Difficulty.HARD: 1.3,
        }

        base = base_times.get(question_type, 3)
        multiplier = difficulty_multipliers.get(difficulty, 1.0)
        
        return int(base * multiplier)

