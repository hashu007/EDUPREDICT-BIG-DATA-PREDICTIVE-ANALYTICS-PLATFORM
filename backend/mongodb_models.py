"""
EduPredict - MongoDB Document Models & NoSQL Schema Definitions
===============================================================
Database: MongoDB (Document-Oriented NoSQL)
Purpose: Scalable storage for:
  1. RBAC Authentication & User Accounts (bcrypt password hashing, multi-role)
  2. Real-time Threshold Alerts & System Notifications
  3. User Feedback & Academic Support Ticket System
  4. Student Longitudinal Master Records & Predictive Inferences
  5. High-velocity LMS Clickstream Telemetry Logs
"""

from datetime import datetime
from mongoengine import (
    Document, EmbeddedDocument, StringField, FloatField,
    IntField, BooleanField, DateTimeField, ListField,
    EmbeddedDocumentField, DictField
)


# ==============================================================================
# EMBEDDED SUB-DOCUMENTS
# ==============================================================================

class CourseEnrollment(EmbeddedDocument):
    """Sub-document tracking course registrations and real-time attendance."""
    course_code = StringField(required=True, max_length=20)
    course_name = StringField(required=True, max_length=150)
    current_grade_letter = StringField(max_length=5, default="B")
    attendance_pct = FloatField(min_value=0.0, max_value=100.0, default=85.0)


class RiskFactorEmbed(EmbeddedDocument):
    """Decomposition of positive and negative drivers of retention risk."""
    factor_name = StringField(required=True)
    impact = StringField(choices=["positive", "negative"], required=True)
    weight_percentage = FloatField(min_value=0.0, max_value=100.0)
    explanation = StringField()


class PredictiveSnapshot(EmbeddedDocument):
    """ML model inferences stored per student evaluation epoch."""
    evaluated_at = DateTimeField(default=datetime.utcnow)
    model_version = StringField(default="v3.5-XGBoost")
    dropout_probability_percentage = FloatField(min_value=0.0, max_value=100.0)
    risk_level = StringField(choices=["Low", "Medium", "High", "Critical"])
    predicted_gpa = FloatField(min_value=0.0, max_value=4.0)
    predicted_performance = StringField()
    detected_anomalies = ListField(StringField())
    recommended_interventions = ListField(StringField())
    cluster_label = StringField()


# ==============================================================================
# COLLECTION 1: USER ACCOUNTS (AUTHENTICATION & RBAC)
# ==============================================================================

class UserAccount(Document):
    """
    MongoDB User Account document with multi-role RBAC security.
    Roles:
      - 'admin': Deans, Directors, Department Heads
      - 'faculty': Professors, Academic Counselors, Course Instructors
      - 'student': Enrolled students viewing personal metrics
      - 'analyst': Big Data Engineers, Institutional Research Scientists
    """
    meta = {
        'collection': 'user_accounts',
        'indexes': ['email', 'role', 'student_id']
    }

    email = StringField(required=True, unique=True)
    password_hash = StringField(required=True)  # bcrypt hashed string
    name = StringField(required=True)
    role = StringField(choices=["admin", "faculty", "student", "analyst"], required=True)
    department = StringField()
    student_id = StringField(null=True)
    avatar_url = StringField()
    is_active = BooleanField(default=True)
    created_at = DateTimeField(default=datetime.utcnow)
    last_login = DateTimeField()

    def to_safe_dict(self):
        """Returns safe user representation excluding password hash."""
        return {
            "id": str(self.id),
            "email": self.email,
            "name": self.name,
            "role": self.role,
            "department": self.department or "",
            "student_id": self.student_id,
            "avatar": self.avatar_url or "",
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


# ==============================================================================
# COLLECTION 2: ALERTS & REAL-TIME THRESHOLD WARNINGS
# ==============================================================================

class AlertNotification(Document):
    """
    Operational alerts triggered by ML inference or system thresholds:
      - Attendance dropping below critical thresholds
      - Predictive dropout risk surge (>60%)
      - Exam-to-attendance divergence anomalies
    """
    meta = {
        'collection': 'alerts_notifications',
        'indexes': ['student_id', 'severity', 'is_read', 'created_at']
    }

    alert_id = StringField(required=True, unique=True)
    student_id = StringField(required=True)
    student_name = StringField(required=True)
    severity = StringField(choices=["critical", "warning", "info"], required=True)
    title = StringField(required=True)
    message = StringField(required=True)
    metric_triggered = StringField()
    threshold_value = FloatField()
    actual_value = FloatField()
    is_read = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.alert_id,
            "student_id": self.student_id,
            "student_name": self.student_name,
            "severity": self.severity,
            "title": self.title,
            "message": self.message,
            "metric_triggered": self.metric_triggered,
            "threshold_value": self.threshold_value,
            "actual_value": self.actual_value,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


# ==============================================================================
# COLLECTION 3: USER FEEDBACK & SUPPORT TICKET SYSTEM
# ==============================================================================

class FeedbackTicket(Document):
    """
    Support ticket and inquiry log collection:
      - Academic advising requests
      - LMS portal bug reports
      - Financial aid inquiries
      - General institutional feedback
    """
    meta = {
        'collection': 'feedback_tickets',
        'indexes': ['user_email', 'status', 'category', 'created_at']
    }

    ticket_id = StringField(required=True, unique=True)
    user_email = StringField(required=True)
    user_name = StringField(required=True)
    user_role = StringField(required=True)
    category = StringField(choices=["academic", "technical", "financial", "general"], default="general")
    subject = StringField(required=True)
    description = StringField(required=True)
    priority = StringField(choices=["low", "medium", "high", "urgent"], default="medium")
    status = StringField(choices=["open", "in_progress", "resolved", "closed"], default="open")
    assigned_to = StringField()
    admin_notes = StringField()
    created_at = DateTimeField(default=datetime.utcnow)
    resolved_at = DateTimeField()

    def to_dict(self):
        return {
            "id": self.ticket_id,
            "user_email": self.user_email,
            "user_name": self.user_name,
            "user_role": self.user_role,
            "category": self.category,
            "subject": self.subject,
            "description": self.description,
            "priority": self.priority,
            "status": self.status,
            "assigned_to": self.assigned_to or "",
            "admin_notes": self.admin_notes or "",
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None
        }


# ==============================================================================
# COLLECTION 4: STUDENT MASTER RECORDS
# ==============================================================================

class StudentMasterRecord(Document):
    """Primary student document capturing longitudinal performance and real-time predictions."""
    meta = {
        'collection': 'student_master_records',
        'indexes': [
            'student_id',
            'department',
            'cohort_year',
            'latest_prediction.risk_level'
        ]
    }

    student_id = StringField(required=True, unique=True)
    first_name = StringField(required=True)
    last_name = StringField(required=True)
    email = StringField(required=True)
    department = StringField(required=True)
    program = StringField(required=True)
    cohort_year = IntField(required=True)
    current_semester = IntField(default=1)
    
    # Academic & Engagement summary
    cumulative_gpa = FloatField(min_value=0.0, max_value=4.0)
    attendance_rate = FloatField(min_value=0.0, max_value=100.0)
    weekly_lms_hours = FloatField(default=0.0)
    
    # Embedded structures
    current_courses = ListField(EmbeddedDocumentField(CourseEnrollment))
    latest_prediction = EmbeddedDocumentField(PredictiveSnapshot)
    updated_at = DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            "student_id": self.student_id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "name": f"{self.first_name} {self.last_name}",
            "email": self.email,
            "department": self.department,
            "program": self.program,
            "cohort_year": self.cohort_year,
            "current_semester": self.current_semester,
            "cumulative_gpa": self.cumulative_gpa,
            "attendance_rate": self.attendance_rate,
            "weekly_lms_hours": self.weekly_lms_hours,
            "latest_prediction": {
                "risk_level": self.latest_prediction.risk_level,
                "dropout_probability_percentage": self.latest_prediction.dropout_probability_percentage,
                "predicted_performance": self.latest_prediction.predicted_performance,
                "detected_anomalies": self.latest_prediction.detected_anomalies,
                "recommended_interventions": self.latest_prediction.recommended_interventions
            } if self.latest_prediction else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


# ==============================================================================
# COLLECTION 5: LMS CLICKSTREAM & TELEMETRY LOGS
# ==============================================================================

class LmsTelemetryLog(Document):
    """High-velocity NoSQL collection for clickstream events and interactive learning logs."""
    meta = {
        'collection': 'lms_telemetry_logs',
        'indexes': [
            'student_id',
            ('event_timestamp', '-interaction_score'),
            {'fields': ['event_timestamp'], 'expireAfterSeconds': 60 * 60 * 24 * 365}  # 1 year TTL
        ]
    }

    event_id = StringField(required=True, unique=True)
    student_id = StringField(required=True)
    course_code = StringField(required=True)
    event_type = StringField(choices=[
        "lms_video_watch", "quiz_submission", "attendance_checkin",
        "forum_post", "assignment_upload"
    ])
    event_timestamp = DateTimeField(default=datetime.utcnow)
    duration_seconds = IntField(default=0)
    interaction_score = FloatField(default=0.0)
    metadata = DictField()
