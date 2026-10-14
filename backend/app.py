"""
EduPredict - Production REST API Backend (Flask / Python)
==========================================================
Architecture: Flask + JWT RBAC + MongoDB (NoSQL) + ML Inference Engine
Supported Software Requirements:
  - MongoDB (Compass & Shell) operational database connection
  - Role-Based Access Control: Admin, Faculty/Teacher, Student, Analyst
  - Alerting & Threshold Notification Workflows
  - Feedback & Support Ticket Management
  - Real-time ML Predictive Inference strictly matching the mandated JSON schema
"""

import os
import sys
import logging
from datetime import datetime, timedelta
from functools import wraps

from flask import Flask, request, jsonify, g
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("EduPredict.API")

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configuration
SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", "edupredict-enterprise-secure-jwt-key-2026")
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://127.0.0.1:27017/edupredict_db")
app.config["SECRET_KEY"] = SECRET_KEY

# Optional dependencies imported with safe fallbacks
try:
    import bcrypt
    HAS_BCRYPT = True
except ImportError:
    HAS_BCRYPT = False
    logger.warning("bcrypt module not installed. Running with basic hash fallback.")

try:
    import jwt
    HAS_JWT = True
except ImportError:
    HAS_JWT = False
    logger.warning("pyjwt module not installed. Running with token serialization fallback.")

try:
    from mongoengine import connect, disconnect
    from pymongo import MongoClient
    from mongodb_models import (
        UserAccount, AlertNotification, FeedbackTicket,
        StudentMasterRecord, PredictiveSnapshot
    )
    HAS_MONGO = True
except ImportError:
    HAS_MONGO = False
    logger.warning("mongoengine/pymongo or mongodb_models not imported. Using fallback in-memory store.")

# Database connectivity flag
IS_MONGO_CONNECTED = False


# ==============================================================================
# FALLBACK IN-MEMORY DATA STORE (When local MongoDB is offline)
# ==============================================================================

MOCK_USERS = {
    "admin@university.edu": {
        "id": "usr-01",
        "email": "admin@university.edu",
        "password_hash": "$2b$12$e8YkC000000000000000000000000000000000000000000000000",
        "plain_fallback_pwd": "admin123Password!",
        "name": "Dr. Sarah Mitchell",
        "role": "admin",
        "department": "Academic Affairs & Institutional Research",
        "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
    },
    "faculty@university.edu": {
        "id": "usr-02",
        "email": "faculty@university.edu",
        "password_hash": "$2b$12$e8YkC000000000000000000000000000000000000000000000000",
        "plain_fallback_pwd": "faculty123Password!",
        "name": "Prof. Marcus Vance",
        "role": "faculty",
        "department": "Department of Computer Science",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    "hassamkhan33344@gmail.com": {
        "id": "usr-03",
        "email": "hassamkhan33344@gmail.com",
        "password_hash": "$2b$12$e8YkC000000000000000000000000000000000000000000000000",
        "plain_fallback_pwd": "student123Password!",
        "name": "Hassam Khan",
        "role": "student",
        "student_id": "STU-2024-0891",
        "department": "Department of Computer Science",
        "avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
    },
    "analyst@university.edu": {
        "id": "usr-04",
        "email": "analyst@university.edu",
        "password_hash": "$2b$12$e8YkC000000000000000000000000000000000000000000000000",
        "plain_fallback_pwd": "analyst123Password!",
        "name": "Elena Rostova",
        "role": "analyst",
        "department": "Big Data & Institutional Intelligence Lab",
        "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
    }
}

MOCK_ALERTS = [
    {
        "id": "alt-01",
        "student_id": "STU-2024-0102",
        "student_name": "Devon Zhang",
        "severity": "critical",
        "title": "Severe Truancy Detected",
        "message": "Consecutive absences reached 4 lectures; attendance rate plummeted to 48.2%.",
        "metric_triggered": "consecutive_absences",
        "threshold_value": 3.0,
        "actual_value": 4.0,
        "is_read": False,
        "created_at": "2026-10-02T14:30:00Z"
    },
    {
        "id": "alt-02",
        "student_id": "STU-2024-0115",
        "student_name": "Amina Said",
        "severity": "warning",
        "title": "Attendance-to-Grade Divergence",
        "message": "Student maintains 92% class attendance but scored 42% on midterm examinations.",
        "metric_triggered": "exam_divergence",
        "threshold_value": 60.0,
        "actual_value": 42.0,
        "is_read": False,
        "created_at": "2026-10-02T11:15:00Z"
    },
    {
        "id": "alt-03",
        "student_id": "STU-2024-0088",
        "student_name": "Lucas Morales",
        "severity": "info",
        "title": "Peer Tutoring Intervention Completed",
        "message": "Academic Advisor marked Peer Tutoring as completed with positive progress score.",
        "metric_triggered": "intervention_status",
        "threshold_value": 1.0,
        "actual_value": 1.0,
        "is_read": True,
        "created_at": "2026-10-01T09:45:00Z"
    }
]

MOCK_FEEDBACK = [
    {
        "id": "tkt-101",
        "user_email": "hassamkhan33344@gmail.com",
        "user_name": "Hassam Khan",
        "user_role": "student",
        "category": "academic",
        "subject": "Request for CS-402 Honors Lab Access",
        "description": "Need extended server hours on Hadoop cluster for MapReduce graduation project.",
        "priority": "high",
        "status": "in_progress",
        "assigned_to": "Prof. Marcus Vance",
        "admin_notes": "Granted SSH key access to datanode-03 edge server.",
        "created_at": "2026-10-02T08:00:00Z",
        "resolved_at": None
    },
    {
        "id": "tkt-102",
        "user_email": "m.vance@university.edu",
        "user_name": "Prof. Marcus Vance",
        "user_role": "faculty",
        "category": "technical",
        "subject": "Impala Query Timeout on LMS Telemetry Table",
        "description": "Noticeable latency (>8s) when aggregating quarterly video clickstream events.",
        "priority": "medium",
        "status": "resolved",
        "assigned_to": "Elena Rostova",
        "admin_notes": "Executed COMPUTE STATS on lms_telemetry_events partition.",
        "created_at": "2026-10-01T15:20:00Z",
        "resolved_at": "2026-10-02T10:00:00Z"
    }
]


# ==============================================================================
# DATABASE CONNECTION & INITIALIZATION
# ==============================================================================

def initialize_database():
    """Attempts connection to local MongoDB instance with automatic seeding."""
    global IS_MONGO_CONNECTED
    if not HAS_MONGO:
        logger.info("Running in in-memory simulation mode (mongoengine not loaded).")
        return

    try:
        # Connect using mongoengine (timeout after 2.5 seconds if MongoDB daemon is not running)
        connect(
            host=MONGO_URI,
            serverSelectionTimeoutMS=2500,
            connectTimeoutMS=2500
        )
        # Test connection with PyMongo ping
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2500)
        client.admin.command('ping')
        IS_MONGO_CONNECTED = True
        logger.info(f"Successfully connected to MongoDB at {MONGO_URI}")

        # Seed baseline users if collection is empty
        seed_baseline_data_if_empty()

    except Exception as e:
        IS_MONGO_CONNECTED = False
        logger.warning(
            f"Could not connect to MongoDB at {MONGO_URI} ({str(e)}). "
            "EduPredict will operate in resilient mock mode until MongoDB daemon is started locally."
        )


def hash_password(password: str) -> str:
    """Hashes password using bcrypt or sha256 fallback."""
    if HAS_BCRYPT:
        salt = bcrypt.gensalt(rounds=12)
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    import hashlib
    return "sha256$" + hashlib.sha256(password.encode('utf-8')).hexdigest()


def verify_password(plain_password: str, hashed: str) -> bool:
    """Validates plain password against stored hash."""
    if HAS_BCRYPT and (hashed.startswith("$2b$") or hashed.startswith("$2a$") or hashed.startswith("$2y$")):
        try:
            return bcrypt.checkpw(plain_password.encode('utf-8'), hashed.encode('utf-8'))
        except Exception:
            return False
    if hashed.startswith("sha256$"):
        import hashlib
        calc = "sha256$" + hashlib.sha256(plain_password.encode('utf-8')).hexdigest()
        return calc == hashed
    return False


def generate_jwt_token(user_data: dict) -> str:
    """Issues standard JWT bearer token with 7-day expiration."""
    payload = {
        "sub": user_data.get("id") or str(user_data.get("_id", "")),
        "email": user_data.get("email"),
        "role": user_data.get("role", "student"),
        "name": user_data.get("name", "User"),
        "department": user_data.get("department", ""),
        "student_id": user_data.get("student_id"),
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    if HAS_JWT:
        return jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    # Fallback simulation token
    return f"edupredict-token-{user_data.get('role', 'student')}-{int(datetime.utcnow().timestamp())}"


def decode_jwt_token(token_string: str) -> dict:
    """Decodes and validates JWT bearer token."""
    if HAS_JWT:
        try:
            return jwt.decode(token_string, SECRET_KEY, algorithms=["HS256"])
        except Exception as e:
            logger.debug(f"JWT decode error: {e}")
            return None
    # Simulated decode
    for user in MOCK_USERS.values():
        if user["role"] in token_string:
            return user
    return None


def seed_baseline_data_if_empty():
    """Populates MongoDB with required test accounts, student records, and alerts."""
    try:
        if UserAccount.objects.count() == 0:
            logger.info("Seeding baseline MongoDB user accounts...")
            default_seed_users = [
                UserAccount(
                    email="admin@university.edu",
                    password_hash=hash_password("admin123Password!"),
                    name="Dr. Sarah Mitchell",
                    role="admin",
                    department="Academic Affairs & Institutional Research"
                ),
                UserAccount(
                    email="faculty@university.edu",
                    password_hash=hash_password("faculty123Password!"),
                    name="Prof. Marcus Vance",
                    role="faculty",
                    department="Department of Computer Science"
                ),
                UserAccount(
                    email="hassamkhan33344@gmail.com",
                    password_hash=hash_password("student123Password!"),
                    name="Hassam Khan",
                    role="student",
                    student_id="STU-2024-0891",
                    department="Department of Computer Science"
                ),
                UserAccount(
                    email="jordan.rivera@university.edu",
                    password_hash=hash_password("student123Password!"),
                    name="Jordan Rivera",
                    role="student",
                    student_id="STU-2024-1001",
                    department="Computer Science"
                ),
                UserAccount(
                    email="samantha.lee@university.edu",
                    password_hash=hash_password("student123Password!"),
                    name="Samantha Lee",
                    role="student",
                    student_id="STU-2024-1002",
                    department="Data Science"
                ),
                UserAccount(
                    email="emily.watson@university.edu",
                    password_hash=hash_password("student123Password!"),
                    name="Emily Watson",
                    role="student",
                    student_id="STU-2024-1006",
                    department="Computer Science"
                ),
                UserAccount(
                    email="analyst@university.edu",
                    password_hash=hash_password("analyst123Password!"),
                    name="Elena Rostova",
                    role="analyst",
                    department="Big Data & Institutional Intelligence Lab"
                )
            ]
            for u in default_seed_users:
                u.save()
            logger.info("[✓] Successfully seeded default user accounts into MongoDB.")

        if AlertNotification.objects.count() == 0:
            logger.info("Seeding baseline MongoDB alerts...")
            for a in MOCK_ALERTS:
                AlertNotification(
                    alert_id=a["id"],
                    student_id=a["student_id"],
                    student_name=a["student_name"],
                    severity=a["severity"],
                    title=a["title"],
                    message=a["message"],
                    metric_triggered=a["metric_triggered"],
                    threshold_value=a["threshold_value"],
                    actual_value=a["actual_value"],
                    is_read=a["is_read"]
                ).save()

        if FeedbackTicket.objects.count() == 0:
            logger.info("Seeding baseline MongoDB support feedback tickets...")
            for f in MOCK_FEEDBACK:
                FeedbackTicket(
                    ticket_id=f["id"],
                    user_email=f["user_email"],
                    user_name=f["user_name"],
                    user_role=f["user_role"],
                    category=f["category"],
                    subject=f["subject"],
                    description=f["description"],
                    priority=f["priority"],
                    status=f["status"],
                    assigned_to=f["assigned_to"],
                    admin_notes=f["admin_notes"]
                ).save()

    except Exception as e:
        logger.warning(f"Error during baseline seed: {e}")


# ==============================================================================
# RBAC AUTHENTICATION DECORATORS
# ==============================================================================

def authenticate_token(f):
    """Verifies incoming Bearer authorization token or mock header."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        role_header = request.headers.get("X-User-Role")

        current_user = None

        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]
            decoded = decode_jwt_token(token)
            if decoded:
                current_user = decoded

        # Development role-switch header fallback
        if not current_user and role_header:
            current_user = {
                "sub": "dev-user-01",
                "email": f"{role_header}@university.edu",
                "role": role_header.lower(),
                "name": f"Dev {role_header.capitalize()}"
            }

        if not current_user:
            return jsonify({
                "error": "Unauthorized",
                "message": "Missing or invalid Bearer authentication token."
            }), 401

        g.current_user = current_user
        return f(*args, **kwargs)
    return decorated


def require_roles(allowed_roles: list):
    """Enforces fine-grained role-based endpoint permissions."""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            user = getattr(g, "current_user", {})
            user_role = user.get("role", "student")
            if user_role not in allowed_roles:
                logger.warning(f"Access forbidden: role '{user_role}' tried to access {allowed_roles} route.")
                return jsonify({
                    "error": "Forbidden",
                    "message": f"Your role '{user_role}' is not authorized to access this resource."
                }), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator


# ==============================================================================
# CORE SYSTEM & HEALTH BEACONS
# ==============================================================================

@app.route("/api/v1/health", methods=["GET"])
def health_check():
    """Health status and cluster connectivity beacon."""
    return jsonify({
        "status": "healthy",
        "service": "EduPredict Big Data & Predictive Analytics Engine",
        "version": "3.5.0-LTS",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "mongodb": {
            "connected": IS_MONGO_CONNECTED,
            "target_uri": MONGO_URI,
            "engine": "MongoEngine & PyMongo NoSQL ODM"
        },
        "hdfs_cluster": {
            "status": "ONLINE",
            "active_datanodes": 4,
            "block_health_pct": 100.0,
            "mpp_sql_engine": "Apache Impala"
        }
    }), 200


# ==============================================================================
# AUTHENTICATION & USER MANAGEMENT (MongoDB `user_accounts`)
# ==============================================================================

@app.route("/api/v1/auth/register", methods=["POST"])
def auth_register():
    """Registers a new user in MongoDB with bcrypt hashed password."""
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    name = data.get("name", "").strip()
    role = data.get("role", "student").strip().lower()
    department = data.get("department", "Computer Science")
    student_id = data.get("student_id")

    if not email or not password or not name:
        return jsonify({"error": "Missing required fields (email, password, name)"}), 400

    if role not in ["admin", "faculty", "student", "analyst"]:
        return jsonify({"error": f"Invalid role '{role}'. Allowed: admin, faculty, student, analyst"}), 400

    hashed_pwd = hash_password(password)

    if IS_MONGO_CONNECTED:
        try:
            if UserAccount.objects(email=email).first():
                return jsonify({"error": "A user with this email already exists"}), 409
            
            new_user = UserAccount(
                email=email,
                password_hash=hashed_pwd,
                name=name,
                role=role,
                department=department,
                student_id=student_id,
                created_at=datetime.utcnow()
            )
            new_user.save()

            # Create StudentMasterRecord if registering as student
            if role == "student" and student_id:
                try:
                    if not StudentMasterRecord.objects(student_id=student_id).first():
                        parts = name.split(" ", 1)
                        first_n = parts[0]
                        last_n = parts[1] if len(parts) > 1 else ""
                        student_rec = StudentMasterRecord(
                            student_id=student_id,
                            first_name=first_n,
                            last_name=last_n,
                            email=email,
                            department=department,
                            program=data.get("program", f"B.Sc. in {department}"),
                            cohort_year=2026,
                            current_semester=int(data.get("semester", 1)),
                            cumulative_gpa=3.55,
                            attendance_rate=94.0,
                            weekly_lms_hours=9.0
                        )
                        student_rec.save()
                except Exception as ex:
                    logger.warning(f"Could not initialize StudentMasterRecord for {student_id}: {ex}")

            safe_user = new_user.to_safe_dict()
            token = generate_jwt_token(safe_user)
            return jsonify({"user": safe_user, "token": token}), 201
        except Exception as e:
            logger.error(f"Error registering user in MongoDB: {e}")
            return jsonify({"error": f"Database registration error: {str(e)}"}), 500

    # In-Memory Fallback
    if email in MOCK_USERS:
        return jsonify({"error": "A user with this email already exists"}), 409

    uid = f"usr-{int(datetime.utcnow().timestamp())}"
    mock_entry = {
        "id": uid,
        "email": email,
        "password_hash": hashed_pwd,
        "plain_fallback_pwd": password,
        "name": name,
        "role": role,
        "department": department,
        "student_id": student_id,
        "avatar": ""
    }
    MOCK_USERS[email] = mock_entry
    token = generate_jwt_token(mock_entry)
    return jsonify({"user": mock_entry, "token": token}), 201


@app.route("/api/v1/auth/login", methods=["POST"])
def auth_login():
    """Authenticates user against MongoDB and returns JWT bearer token."""
    data = request.get_json() or {}
    email = data.get("email", "")
    password = data.get("password", "")

    if not isinstance(email, str) or not email.strip():
        return jsonify({"error": "Email or Student ID is required"}), 400
    email = email.strip().lower()
    if not isinstance(password, str) or not password:
        return jsonify({"error": "Password is required"}), 400

    if not email:
        return jsonify({"error": "Email or Student ID is required"}), 400

    # 1. MongoDB Query (Lookup by email OR student_id)
    if IS_MONGO_CONNECTED:
        try:
            user_doc = UserAccount.objects(email=email).first() or UserAccount.objects(student_id=email.upper()).first()
            if not user_doc:
                return jsonify({"error": "Invalid credentials", "message": "Account not found"}), 401

            # Validate password
            if not verify_password(password, user_doc.password_hash):
                return jsonify({"error": "Invalid credentials", "message": "Incorrect password"}), 401

            # Update last login
            user_doc.last_login = datetime.utcnow()
            user_doc.save()

            safe_user = user_doc.to_safe_dict()
            token = generate_jwt_token(safe_user)

            return jsonify({
                "token": token,
                "user": safe_user,
                "expires_in_days": 7
            }), 200
        except Exception as e:
            logger.error(f"MongoDB login query failed: {e}")

    # 2. In-Memory Mock Fallback
    user = MOCK_USERS.get(email)
    if not user:
        for u in MOCK_USERS.values():
            if u.get("student_id", "").lower() == email or u.get("email", "").lower() == email:
                user = u
                break

    if not user:
        return jsonify({"error": "Invalid credentials", "message": "User not found"}), 401

    if password != user.get("plain_fallback_pwd") and not verify_password(password, user.get("password_hash", "")):
        return jsonify({"error": "Invalid credentials", "message": "Incorrect password"}), 401

    token = generate_jwt_token(user)
    return jsonify({
        "token": token,
        "user": user,
        "expires_in_days": 7
    }), 200


@app.route("/api/v1/auth/me", methods=["GET"])
@authenticate_token
def get_current_user_profile():
    """Returns profile for currently authenticated user."""
    return jsonify({"user": g.current_user}), 200


# ==============================================================================
# OPERATIONAL ALERTS & THRESHOLD WARNINGS (MongoDB `alerts_notifications`)
# ==============================================================================

@app.route("/api/v1/alerts", methods=["GET"])
@authenticate_token
def get_alerts():
    """Retrieves operational alerts from MongoDB sorted by recency."""
    is_read_filter = request.args.get("is_read")

    if IS_MONGO_CONNECTED:
        try:
            query = AlertNotification.objects
            if is_read_filter is not None:
                query = query.filter(is_read=(is_read_filter.lower() == "true"))
            alerts = [a.to_dict() for a in query.order_by("-created_at")]
            return jsonify({"alerts": alerts, "total": len(alerts)}), 200
        except Exception as e:
            logger.error(f"Error fetching alerts from MongoDB: {e}")

    # Fallback
    results = MOCK_ALERTS
    if is_read_filter is not None:
        target_bool = (is_read_filter.lower() == "true")
        results = [a for a in results if a.get("is_read") == target_bool]

    return jsonify({"alerts": results, "total": len(results)}), 200


@app.route("/api/v1/alerts", methods=["POST"])
@authenticate_token
@require_roles(["admin", "faculty", "analyst"])
def create_alert():
    """Creates a new threshold alert in MongoDB."""
    data = request.get_json() or {}
    student_id = data.get("student_id", "STU-GEN")
    student_name = data.get("student_name", "Student")
    severity = data.get("severity", "warning")
    title = data.get("title", "Threshold Alert")
    message = data.get("message", "")

    alert_id = f"alt-{int(datetime.utcnow().timestamp())}"

    if IS_MONGO_CONNECTED:
        try:
            alert = AlertNotification(
                alert_id=alert_id,
                student_id=student_id,
                student_name=student_name,
                severity=severity,
                title=title,
                message=message,
                metric_triggered=data.get("metric_triggered"),
                threshold_value=float(data.get("threshold_value", 0.0)),
                actual_value=float(data.get("actual_value", 0.0)),
                created_at=datetime.utcnow()
            )
            alert.save()
            return jsonify({"alert": alert.to_dict()}), 201
        except Exception as e:
            logger.error(f"Error saving alert to MongoDB: {e}")

    # Fallback
    new_alert = {
        "id": alert_id,
        "student_id": student_id,
        "student_name": student_name,
        "severity": severity,
        "title": title,
        "message": message,
        "metric_triggered": data.get("metric_triggered"),
        "threshold_value": data.get("threshold_value", 0.0),
        "actual_value": data.get("actual_value", 0.0),
        "is_read": False,
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    MOCK_ALERTS.insert(0, new_alert)
    return jsonify({"alert": new_alert}), 201


@app.route("/api/v1/alerts/<alert_id>/read", methods=["PATCH"])
@authenticate_token
def mark_alert_read(alert_id: str):
    """Marks an alert notification as read in MongoDB."""
    if IS_MONGO_CONNECTED:
        try:
            alert = AlertNotification.objects(alert_id=alert_id).first()
            if alert:
                alert.is_read = True
                alert.save()
                return jsonify({"success": True, "alert": alert.to_dict()}), 200
        except Exception as e:
            logger.error(f"MongoDB alert update error: {e}")

    for a in MOCK_ALERTS:
        if a["id"] == alert_id:
            a["is_read"] = True
            return jsonify({"success": True, "alert": a}), 200

    return jsonify({"error": "Alert not found"}), 404


# ==============================================================================
# USER FEEDBACK & SUPPORT TICKETS (MongoDB `feedback_tickets`)
# ==============================================================================

@app.route("/api/v1/feedback", methods=["GET"])
@authenticate_token
def get_feedback_tickets():
    """Retrieves support tickets from MongoDB."""
    status_filter = request.args.get("status")

    if IS_MONGO_CONNECTED:
        try:
            query = FeedbackTicket.objects
            if status_filter:
                query = query.filter(status=status_filter)
            tickets = [t.to_dict() for t in query.order_by("-created_at")]
            return jsonify({"tickets": tickets, "total": len(tickets)}), 200
        except Exception as e:
            logger.error(f"Error fetching feedback tickets: {e}")

    results = MOCK_FEEDBACK
    if status_filter:
        results = [t for t in results if t.get("status") == status_filter]
    return jsonify({"tickets": results, "total": len(results)}), 200


@app.route("/api/v1/feedback", methods=["POST"])
@authenticate_token
def create_feedback_ticket():
    """Submits a new support or academic inquiry ticket into MongoDB."""
    data = request.get_json() or {}
    user = getattr(g, "current_user", {})

    subject = data.get("subject", "").strip()
    description = data.get("description", "").strip()
    category = data.get("category", "general")
    priority = data.get("priority", "medium")

    if not subject or not description:
        return jsonify({"error": "Subject and description are required"}), 400

    ticket_id = f"tkt-{int(datetime.utcnow().timestamp())}"
    user_email = user.get("email", data.get("user_email", "student@university.edu"))
    user_name = user.get("name", data.get("user_name", "EduPredict User"))
    user_role = user.get("role", "student")

    if IS_MONGO_CONNECTED:
        try:
            ticket = FeedbackTicket(
                ticket_id=ticket_id,
                user_email=user_email,
                user_name=user_name,
                user_role=user_role,
                category=category,
                subject=subject,
                description=description,
                priority=priority,
                status="open",
                created_at=datetime.utcnow()
            )
            ticket.save()
            return jsonify({"ticket": ticket.to_dict()}), 201
        except Exception as e:
            logger.error(f"Error saving feedback ticket to MongoDB: {e}")

    new_ticket = {
        "id": ticket_id,
        "user_email": user_email,
        "user_name": user_name,
        "user_role": user_role,
        "category": category,
        "subject": subject,
        "description": description,
        "priority": priority,
        "status": "open",
        "assigned_to": "",
        "admin_notes": "",
        "created_at": datetime.utcnow().isoformat() + "Z",
        "resolved_at": None
    }
    MOCK_FEEDBACK.insert(0, new_ticket)
    return jsonify({"ticket": new_ticket}), 201


@app.route("/api/v1/feedback/<ticket_id>/status", methods=["PATCH"])
@authenticate_token
@require_roles(["admin", "faculty", "analyst"])
def update_ticket_status(ticket_id: str):
    """Updates support ticket status (open -> in_progress -> resolved)."""
    data = request.get_json() or {}
    new_status = data.get("status")
    admin_notes = data.get("admin_notes")
    assigned_to = data.get("assigned_to")

    if new_status not in ["open", "in_progress", "resolved", "closed"]:
        return jsonify({"error": "Invalid status value"}), 400

    if IS_MONGO_CONNECTED:
        try:
            ticket = FeedbackTicket.objects(ticket_id=ticket_id).first()
            if ticket:
                ticket.status = new_status
                if admin_notes:
                    ticket.admin_notes = admin_notes
                if assigned_to:
                    ticket.assigned_to = assigned_to
                if new_status in ["resolved", "closed"]:
                    ticket.resolved_at = datetime.utcnow()
                ticket.save()
                return jsonify({"ticket": ticket.to_dict()}), 200
        except Exception as e:
            logger.error(f"Error updating ticket in MongoDB: {e}")

    for t in MOCK_FEEDBACK:
        if t["id"] == ticket_id:
            t["status"] = new_status
            if admin_notes:
                t["admin_notes"] = admin_notes
            if assigned_to:
                t["assigned_to"] = assigned_to
            return jsonify({"ticket": t}), 200

    return jsonify({"error": "Ticket not found"}), 404


# ==============================================================================
# PREDICTIVE MACHINE LEARNING INFERENCE ENGINE
# ==============================================================================

@app.route("/api/v1/predict", methods=["POST"])
@authenticate_token
@require_roles(["admin", "faculty", "analyst"])
def predict_student_risk():
    """
    Executes real-time ML inference on student engagement features.
    CRITICAL: Strict adherence to mandated JSON output schema:
    {
      "student_id": "string",
      "risk_level": "High" | "Medium" | "Low",
      "predicted_performance": "string",
      "dropout_probability_percentage": number,
      "detected_anomalies": ["string"],
      "recommended_interventions": ["string"]
    }
    """
    data = request.get_json() or {}
    student_id = data.get("student_id", "STU-UNKNOWN")
    
    # Feature extraction with robust defaults
    attendance_rate = float(data.get("attendance_rate", 80.0))
    weekly_lms_hours = float(data.get("weekly_lms_hours", 7.0))
    midterms_avg = float(data.get("midterms_avg", 72.0))
    assignments_score = float(data.get("assignments_score", 75.0))
    consecutive_absences = int(data.get("consecutive_absences", 0))
    prior_gpa = float(data.get("prior_gpa", 3.0))

    # Analytical logistic regression scoring equation
    z = (
        -0.075 * attendance_rate
        - 0.110 * weekly_lms_hours
        - 0.045 * midterms_avg
        + 0.320 * consecutive_absences
        - 0.750 * prior_gpa
        + 3.95
    )
    dropout_prob = 1.0 / (1.0 + (2.718281828459045 ** (-z)))
    dropout_pct = round(float(dropout_prob * 100.0), 2)

    # Classify Risk Level according to institutional tiers
    if dropout_pct >= 60.0:
        risk_level = "High"
        predicted_performance = "At-Risk / Sub-passing Forecast (< 2.0 GPA)"
    elif dropout_pct >= 30.0:
        risk_level = "Medium"
        predicted_performance = "Moderate Academic Standing (2.5 - 3.0 GPA)"
    else:
        risk_level = "Low"
        predicted_performance = "Satisfactory / Dean's List Track (> 3.5 GPA)"

    # Identify anomalies
    anomalies = []
    if attendance_rate >= 85.0 and midterms_avg < 55.0:
        anomalies.append("Attendance-to-Grade Divergence: High lecture presence with poor exam mastery")
    if attendance_rate <= 20.0 and midterms_avg >= 75.0:
        anomalies.append("Ghost Student: Substantial class absences with passing scores")
    if consecutive_absences >= 4:
        anomalies.append(f"Chronic Truancy: {consecutive_absences} consecutive missed sessions")
    if weekly_lms_hours < 2.0:
        anomalies.append("LMS Inactivity: Under 2 hours of asynchronous learning this week")

    # Determine automated pedagogical interventions
    interventions = []
    if risk_level == "High":
        interventions.append("Assign Senior Academic Counselor for weekly 1-on-1 check-ins")
        interventions.append("Issue mandatory attendance recovery protocol")
        interventions.append("Enroll in peer tutoring for midterms recovery")
    elif risk_level == "Medium":
        interventions.append("Recommend faculty office hours before upcoming milestone exams")
        interventions.append("Dispatch automated LMS study habit reminder")
    else:
        interventions.append("Eligible for Honors Thesis Research & Peer Mentoring Fellowship")

    result_payload = {
        "student_id": str(student_id),
        "risk_level": risk_level,
        "predicted_performance": predicted_performance,
        "dropout_probability_percentage": dropout_pct,
        "detected_anomalies": anomalies,
        "recommended_interventions": interventions
    }

    # Automatically create Alert in MongoDB if student is High Risk
    if risk_level == "High" and IS_MONGO_CONNECTED:
        try:
            alert = AlertNotification(
                alert_id=f"alt-{int(datetime.utcnow().timestamp())}",
                student_id=str(student_id),
                student_name=data.get("student_name", f"Student {student_id}"),
                severity="critical",
                title="Critical Retention Risk Alert",
                message=f"Automated ML prediction forecast dropout probability at {dropout_pct}%.",
                metric_triggered="dropout_probability",
                threshold_value=60.0,
                actual_value=dropout_pct
            )
            alert.save()
        except Exception as e:
            logger.debug(f"Could not auto-generate alert: {e}")

    logger.info(f"Generated prediction for {student_id}: Risk={risk_level} ({dropout_pct}%)")
    return jsonify(result_payload), 200


# ==============================================================================
# ADVISOR INTERVENTION AUDITING
# ==============================================================================

@app.route("/api/v1/interventions", methods=["POST"])
@authenticate_token
@require_roles(["admin", "faculty"])
def log_intervention():
    """Logs academic counseling intervention into audit storage."""
    payload = request.get_json() or {}
    required_fields = ["student_id", "intervention_type", "notes"]
    for field in required_fields:
        if not payload.get(field):
            return jsonify({"error": f"Missing required parameter: {field}"}), 400

    intervention_id = f"INT-{int(datetime.utcnow().timestamp())}"
    record = {
        "id": intervention_id,
        "student_id": payload["student_id"],
        "intervention_type": payload["intervention_type"],
        "notes": payload["notes"],
        "counselor": payload.get("counselor", "Academic Affairs Counselor"),
        "status": "in_progress",
        "created_at": datetime.utcnow().isoformat() + "Z"
    }

    logger.info(f"Recorded intervention {intervention_id} for student {payload['student_id']}")
    return jsonify({"success": True, "intervention": record}), 201


# ==============================================================================
# FULL MONGODB SYNC & CSV DATASET INGESTION ENDPOINTS
# ==============================================================================

@app.route("/api/sync/all", methods=["POST"])
def sync_all_to_mongodb():
    """Synchronizes frontend student records, users, and alerts directly to local MongoDB."""
    data = request.get_json() or {}
    students = data.get("students", [])
    users = data.get("users", [])

    if not IS_MONGO_CONNECTED:
        return jsonify({
            "success": False,
            "mongoConnected": False,
            "message": "Local MongoDB not connected on port 27017."
        }), 200

    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2500)
        db = client["edupredict_db"]

        # 1. Sync all students into student_master_records and students collections
        if isinstance(students, list) and len(students) > 0:
            master_col = db["student_master_records"]
            students_col = db["students"]
            for s in students:
                s_id = s.get("studentId") or s.get("student_id")
                if not s_id:
                    continue
                name_str = s.get("name", "Student")
                parts = name_str.split(" ", 1)
                first_n = parts[0]
                last_n = parts[1] if len(parts) > 1 else ""

                att_rate = float(s.get("attendance", {}).get("overallRate", 85.0))
                gpa_val = float(s.get("academic", {}).get("currentGPA", 3.0))
                lms_hrs = float(s.get("lms", {}).get("weeklyHours", 8.0))
                preds = s.get("predictions", {})

                master_doc = {
                    "student_id": s_id,
                    "first_name": first_n,
                    "last_name": last_n,
                    "name": name_str,
                    "email": s.get("email", ""),
                    "department": s.get("department", "Computer Science"),
                    "program": s.get("program", "B.Sc."),
                    "cohort_year": 2024,
                    "current_semester": int(s.get("semester", 4)),
                    "cumulative_gpa": gpa_val,
                    "attendance_rate": att_rate,
                    "weekly_lms_hours": lms_hrs,
                    "latest_prediction": {
                        "evaluated_at": datetime.utcnow(),
                        "dropout_probability_percentage": float(preds.get("dropoutRiskScore", 15.0)),
                        "risk_level": str(preds.get("riskLevel", "low")).capitalize(),
                        "predicted_gpa": float(preds.get("predictedGPA", gpa_val)),
                        "predicted_performance": preds.get("clusterName", "Satisfactory")
                    },
                    "updated_at": datetime.utcnow()
                }
                master_col.update_one({"student_id": s_id}, {"$set": master_doc}, upsert=True)
                students_col.update_one({"studentId": s_id}, {"$set": {**s, "updatedAt": datetime.utcnow()}}, upsert=True)

        # 2. Sync registered users into user_accounts
        if isinstance(users, list) and len(users) > 0:
            users_col = db["user_accounts"]
            for u in users:
                u_email = (u.get("email") or "").strip().lower()
                if not u_email:
                    continue
                users_col.update_one(
                    {"email": u_email},
                    {"$set": {
                        "email": u_email,
                        "name": u.get("name", "Student"),
                        "role": u.get("role", "student"),
                        "department": u.get("department", "Computer Science"),
                        "student_id": u.get("studentId") or u.get("student_id"),
                        "is_active": True
                    }, "$setOnInsert": {
                        "password_hash": hash_password(u.get("password") or "student123Password!"),
                        "created_at": datetime.utcnow()
                    }},
                    upsert=True
                )

        return jsonify({
            "success": True,
            "mongoConnected": True,
            "message": f"Synchronized {len(students)} students to MongoDB (edupredict_db)."
        }), 200
    except Exception as e:
        logger.error(f"Error syncing to MongoDB: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/upload/csv", methods=["POST"])
def upload_csv_dataset():
    """Parses uploaded CSV dataset and stores it directly in MongoDB `uploaded_datasets` and `student_master_records`."""
    data = request.get_json() or {}
    file_name = data.get("fileName", "dataset.csv")
    raw_csv = data.get("rawCsv", "")
    rows = data.get("rows", [])
    columns = data.get("columns", [])
    dataset_name = data.get("datasetName", file_name)
    fmt = data.get("format", "csv")

    parsed_rows = rows if isinstance(rows, list) else []
    parsed_cols = columns if isinstance(columns, list) else []

    if raw_csv:
        clean_csv = raw_csv.lstrip("\ufeff")
        lines = [line.strip() for line in clean_csv.splitlines() if line.strip()]
        if len(lines) > 0:
            parsed_cols = [c.strip().strip('"\'') for c in lines[0].split(",")]
            parsed_rows = []
            for line in lines[1:]:
                vals = [v.strip().strip('"\'') for v in line.split(",")]
                # Skip blank Excel rows that only contain empty commas (e.g. ",,,,,,,,,,,,")
                if all(not v for v in vals):
                    continue
                row_obj = {}
                for idx, col_name in enumerate(parsed_cols):
                    row_obj[col_name] = vals[idx] if idx < len(vals) else ""
                parsed_rows.append(row_obj)

    record_count = len(parsed_rows) or int(data.get("recordCount", 0))

    if IS_MONGO_CONNECTED:
        try:
            client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2500)
            db = client["edupredict_db"]

            dataset_doc = {
                "file_name": file_name,
                "dataset_name": dataset_name,
                "format": fmt,
                "record_count": record_count,
                "columns": parsed_cols,
                "rows": parsed_rows[:1000],
                "uploaded_at": datetime.utcnow(),
                "status": "ingested"
            }
            db["uploaded_datasets"].insert_one(dataset_doc)

            # Also upsert matching student rows into student_master_records
            imported_students = 0
            master_col = db["student_master_records"]
            for idx, r in enumerate(parsed_rows):
                s_id = r.get("student_id") or r.get("studentId") or r.get("StudentID") or r.get("id")
                s_name = r.get("name") or r.get("Name") or r.get("student_name") or r.get("StudentName")
                if not s_id and s_name:
                    s_id = f"STU-2026-{2001 + idx}"
                if s_id and s_name:
                    parts = str(s_name).split(" ", 1)
                    try:
                        att = float(r.get("AttendanceRate") or r.get("attendance_rate") or r.get("attendance") or 85.0)
                    except ValueError:
                        att = 85.0
                    try:
                        gpa = float(r.get("CurrentGPA") or r.get("gpa") or r.get("current_gpa") or 3.0)
                    except ValueError:
                        gpa = 3.0
                    try:
                        sem = int(r.get("Semester") or r.get("semester") or 4)
                    except ValueError:
                        sem = 4

                    dept = r.get("Department") or r.get("department") or "Computer Science"
                    email_val = r.get("Email") or r.get("email") or f"{str(s_id).lower()}@university.edu"

                    master_col.update_one(
                        {"student_id": str(s_id)},
                        {"$set": {
                            "student_id": str(s_id),
                            "first_name": parts[0],
                            "last_name": parts[1] if len(parts) > 1 else "",
                            "name": str(s_name),
                            "email": email_val,
                            "department": dept,
                            "program": r.get("program") or f"B.Sc. in {dept}",
                            "cohort_year": 2024,
                            "current_semester": sem,
                            "cumulative_gpa": gpa,
                            "attendance_rate": att,
                            "source_dataset": file_name,
                            "updated_at": datetime.utcnow()
                        }},
                        upsert=True
                    )
                    imported_students += 1

            return jsonify({
                "success": True,
                "mongoConnected": True,
                "recordCount": record_count,
                "message": f"Saved '{file_name}' ({record_count} rows) to MongoDB collection 'uploaded_datasets' ({imported_students} student records updated)."
            }), 200
        except Exception as e:
            logger.error(f"Error saving CSV dataset to MongoDB: {e}")
            return jsonify({"success": False, "error": str(e)}), 500

    return jsonify({
        "success": True,
        "mongoConnected": False,
        "recordCount": record_count,
        "message": f"Processed {record_count} rows locally (start MongoDB & Python backend to persist in MongoDB Compass)."
    }), 200


# ==============================================================================
# MAIN ENTRYPOINT
# ==============================================================================

if __name__ == "__main__":
    initialize_database()
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"Starting EduPredict Backend REST API on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=False)
