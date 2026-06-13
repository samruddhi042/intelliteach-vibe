"""Constants used across the application"""

# User Roles
ROLE_TEACHER = "Teacher"
ROLE_STUDENT = "Student"
ROLE_ADMIN = "Admin"

# Engagement Signal Types
SIGNAL_GOT_IT = "got_it"
SIGNAL_CONFUSED = "confused"
SIGNAL_POLL = "poll"
SIGNAL_MCQ = "mcq"

# Question Types
QUESTION_TYPE_MCQ = "MCQ"
QUESTION_TYPE_SHORT_ANSWER = "Short Answer"
QUESTION_TYPE_CONCEPTUAL = "Conceptual"
QUESTION_TYPE_APPLICATION = "Application"

# Difficulty Levels
DIFFICULTY_EASY = "Easy"
DIFFICULTY_MEDIUM = "Medium"
DIFFICULTY_HARD = "Hard"

# Homework Status
HOMEWORK_STATUS_PENDING = "pending"
HOMEWORK_STATUS_IN_PROGRESS = "in_progress"
HOMEWORK_STATUS_COMPLETED = "completed"

# Project Status
PROJECT_STATUS_NOT_STARTED = "not_started"
PROJECT_STATUS_IN_PROGRESS = "in_progress"
PROJECT_STATUS_COMPLETED = "completed"

# Engagement Thresholds
ENGAGEMENT_HIGH_THRESHOLD = 70
ENGAGEMENT_MEDIUM_THRESHOLD = 50
CONFUSION_HIGH_THRESHOLD = 40
MCQ_ACCURACY_THRESHOLD = 70

# Mastery Score Range
MASTERY_MIN = 0
MASTERY_MAX = 100

# Intervention Actions
INTERVENTION_REEXPLAIN = "Re-explain the concept with examples"
INTERVENTION_SLOW_DOWN = "Slow down the pace and check for understanding"
INTERVENTION_BREAK = "Take a short break and resume"
INTERVENTION_INDIVIDUAL_HELP = "Provide individual assistance to struggling students"
INTERVENTION_EXAMPLE = "Use a worked example to demonstrate the concept"

