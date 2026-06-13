from sqlalchemy.orm import Session
from typing import List, Dict
from models.transcript import Transcript, ConceptMapping
from models.class import Class


class SyllabusMapper:
    """Rule-based syllabus mapping service that extracts concepts from transcripts"""

    # Concept keywords mapping (rule-based, explainable)
    CONCEPT_KEYWORDS = {
        "Newton's First Law": ["newton", "first law", "inertia", "at rest", "constant velocity"],
        "Newton's Second Law": ["newton", "second law", "force", "mass", "acceleration", "f=ma", "f equals m a"],
        "Newton's Third Law": ["newton", "third law", "action", "reaction", "equal", "opposite"],
        "Friction Forces": ["friction", "frictional", "coefficient", "static", "kinetic"],
        "Free Body Diagrams": ["free body", "diagram", "forces", "vector"],
        "Momentum": ["momentum", "p=mv", "conservation"],
        "Impulse": ["impulse", "change in momentum", "j=ft"],
        "Conservation Laws": ["conservation", "energy", "momentum", "closed system"],
    }

    @staticmethod
    def extract_concepts_from_transcript(
        db: Session,
        transcript_id: int,
        class_id: int
    ) -> List[ConceptMapping]:
        """
        Extract concepts from a transcript using keyword matching.
        Returns concept mappings with confidence scores.
        """
        transcript = db.query(Transcript).filter(Transcript.id == transcript_id).first()
        if not transcript:
            return []

        class_obj = db.query(Class).filter(Class.id == class_id).first()
        if not class_obj:
            return []

        text_lower = transcript.text.lower()
        mappings = []

        # Check each concept's keywords
        for concept, keywords in SyllabusMapper.CONCEPT_KEYWORDS.items():
            matches = sum(1 for keyword in keywords if keyword in text_lower)
            
            if matches > 0:
                # Confidence score: number of keyword matches / total keywords
                # Normalized to 0.0-1.0 range, with minimum threshold
                confidence = min(1.0, matches / len(keywords))
                
                # Only create mapping if confidence is above threshold
                if confidence >= 0.3:
                    # Check if mapping already exists
                    existing = db.query(ConceptMapping).filter(
                        ConceptMapping.transcript_id == transcript_id,
                        ConceptMapping.concept == concept
                    ).first()

                    if not existing:
                        mapping = ConceptMapping(
                            transcript_id=transcript_id,
                            concept=concept,
                            confidence_score=confidence,
                            syllabus_topic=class_obj.syllabus_mapping.get(concept, concept)
                        )
                        db.add(mapping)
                        mappings.append(mapping)

        db.commit()
        return mappings

    @staticmethod
    def map_session_to_concepts(
        db: Session,
        session_id: int
    ) -> Dict[str, float]:
        """
        Map all transcripts in a session to concepts.
        Returns a dictionary of concept -> average confidence score.
        """
        transcripts = db.query(Transcript).filter(Transcript.session_id == session_id).all()
        
        concept_scores = {}
        concept_counts = {}

        for transcript in transcripts:
            mappings = db.query(ConceptMapping).filter(
                ConceptMapping.transcript_id == transcript.id
            ).all()

            for mapping in mappings:
                if mapping.concept not in concept_scores:
                    concept_scores[mapping.concept] = 0.0
                    concept_counts[mapping.concept] = 0
                
                concept_scores[mapping.concept] += mapping.confidence_score
                concept_counts[mapping.concept] += 1

        # Calculate averages
        for concept in concept_scores:
            if concept_counts[concept] > 0:
                concept_scores[concept] = concept_scores[concept] / concept_counts[concept]

        return concept_scores

    @staticmethod
    def get_concept_map(
        db: Session,
        recording_id: int
    ) -> List[Dict]:
        """
        Get concept map for a recording.
        Returns list of concepts with confidence scores.
        """
        from models.recording import Recording
        
        recording = db.query(Recording).filter(Recording.id == recording_id).first()
        if not recording:
            return []

        # Get all transcripts for this recording
        transcripts = db.query(Transcript).filter(
            Transcript.recording_id == recording_id
        ).all()

        concept_map = {}
        
        for transcript in transcripts:
            mappings = db.query(ConceptMapping).filter(
                ConceptMapping.transcript_id == transcript.id
            ).all()

            for mapping in mappings:
                if mapping.concept not in concept_map:
                    concept_map[mapping.concept] = {
                        "concept": mapping.concept,
                        "confidence": mapping.confidence_score,
                        "syllabus_topic": mapping.syllabus_topic,
                        "mentions": 1
                    }
                else:
                    # Update confidence (average)
                    current = concept_map[mapping.concept]
                    current["mentions"] += 1
                    current["confidence"] = (
                        (current["confidence"] * (current["mentions"] - 1) + mapping.confidence_score) 
                        / current["mentions"]
                    )

        return list(concept_map.values())

