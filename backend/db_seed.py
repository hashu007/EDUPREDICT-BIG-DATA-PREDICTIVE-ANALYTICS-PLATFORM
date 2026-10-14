"""
EduPredict - Standalone MongoDB Seeder Script
==============================================
Usage:
    python db_seed.py

This script connects to your local MongoDB instance at:
    mongodb://127.0.0.1:27017/edupredict_db
and seeds:
  1. Default RBAC user accounts with secure bcrypt password hashing:
     - Admin: s.mitchell@university.edu (password: admin123Password!)
     - Faculty: m.vance@university.edu (password: faculty123Password!)
     - Student: hassamkhan33344@gmail.com (password: student123Password!)
     - Analyst: e.rostova@university.edu (password: analyst123Password!)
  2. Sample student master records with academic metrics & ML predictions
  3. Real-time threshold alerts in `alerts_notifications`
  4. Operational feedback & support tickets in `feedback_tickets`
"""

import os
from datetime import datetime

try:
    import bcrypt
    def hash_pw(plain: str) -> str:
        return bcrypt.hashpw(plain.encode('utf-8'), bcrypt.gensalt(12)).decode('utf-8')
except ImportError:
    import hashlib
    def hash_pw(plain: str) -> str:
        return "sha256$" + hashlib.sha256(plain.encode('utf-8')).hexdigest()

from pymongo import MongoClient

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://127.0.0.1:27017/edupredict_db")


def seed_database():
    print(f"[*] Connecting to MongoDB at: {MONGO_URI}...")
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=4000)
        db = client.get_default_database()
        if db.name == 'admin' or db.name == 'test':
            db = client['edupredict_db']
        
        # Test connection
        client.admin.command('ping')
        print(f"[✓] Connected successfully to database '{db.name}'.")

        # ---------------------------------------------------------
        # 1. Collection: user_accounts
        # ---------------------------------------------------------
        print("[*] Seeding collection: user_accounts...")
        users_col = db['user_accounts']
        users_col.create_index("email", unique=True)
        users_col.create_index("role")
        users_col.create_index("student_id", sparse=True)

        users_data = [
            {
                "email": "s.mitchell@university.edu",
                "password_hash": hash_pw("admin123Password!"),
                "name": "Dr. Sarah Mitchell",
                "role": "admin",
                "department": "Academic Affairs & Institutional Research",
                "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
                "email": "m.vance@university.edu",
                "password_hash": hash_pw("faculty123Password!"),
                "name": "Prof. Marcus Vance",
                "role": "faculty",
                "department": "Department of Computer Science",
                "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
                "email": "hassamkhan33344@gmail.com",
                "password_hash": hash_pw("student123Password!"),
                "name": "Hassam Khan",
                "role": "student",
                "student_id": "STU-2024-0891",
                "department": "Department of Computer Science",
                "avatar_url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
                "email": "e.rostova@university.edu",
                "password_hash": hash_pw("analyst123Password!"),
                "name": "Elena Rostova",
                "role": "analyst",
                "department": "Big Data & Institutional Intelligence Lab",
                "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
                "is_active": True,
                "created_at": datetime.utcnow()
            }
        ]

        for user in users_data:
            users_col.update_one(
                {"email": user["email"]},
                {"$set": user},
                upsert=True
            )
        print(f"[✓] Seeded {len(users_data)} user accounts.")

        # ---------------------------------------------------------
        # 2. Collection: alerts_notifications
        # ---------------------------------------------------------
        print("[*] Seeding collection: alerts_notifications...")
        alerts_col = db['alerts_notifications']
        alerts_col.create_index("alert_id", unique=True)
        alerts_col.create_index("student_id")
        alerts_col.create_index("created_at")

        sample_alerts = [
            {
                "alert_id": "alt-01",
                "student_id": "STU-2024-0102",
                "student_name": "Devon Zhang",
                "severity": "critical",
                "title": "Severe Truancy Detected",
                "message": "Consecutive absences reached 4 lectures; attendance rate plummeted to 48.2%.",
                "metric_triggered": "consecutive_absences",
                "threshold_value": 3.0,
                "actual_value": 4.0,
                "is_read": False,
                "created_at": datetime.utcnow()
            },
            {
                "alert_id": "alt-02",
                "student_id": "STU-2024-0115",
                "student_name": "Amina Said",
                "severity": "warning",
                "title": "Attendance-to-Grade Divergence",
                "message": "Student maintains 92% class attendance but scored 42% on midterm examinations.",
                "metric_triggered": "exam_divergence",
                "threshold_value": 60.0,
                "actual_value": 42.0,
                "is_read": False,
                "created_at": datetime.utcnow()
            },
            {
                "alert_id": "alt-03",
                "student_id": "STU-2024-0088",
                "student_name": "Lucas Morales",
                "severity": "info",
                "title": "Intervention Milestone Reached",
                "message": "Academic Advisor completed 3rd weekly check-in. Attendance improved by 14%.",
                "metric_triggered": "intervention_status",
                "threshold_value": 1.0,
                "actual_value": 1.0,
                "is_read": True,
                "created_at": datetime.utcnow()
            }
        ]

        for alt in sample_alerts:
            alerts_col.update_one(
                {"alert_id": alt["alert_id"]},
                {"$set": alt},
                upsert=True
            )
        print(f"[✓] Seeded {len(sample_alerts)} threshold alerts.")

        # ---------------------------------------------------------
        # 3. Collection: feedback_tickets
        # ---------------------------------------------------------
        print("[*] Seeding collection: feedback_tickets...")
        feedback_col = db['feedback_tickets']
        feedback_col.create_index("ticket_id", unique=True)
        feedback_col.create_index("status")

        sample_tickets = [
            {
                "ticket_id": "tkt-101",
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
                "created_at": datetime.utcnow()
            },
            {
                "ticket_id": "tkt-102",
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
                "created_at": datetime.utcnow()
            }
        ]

        for tkt in sample_tickets:
            feedback_col.update_one(
                {"ticket_id": tkt["ticket_id"]},
                {"$set": tkt},
                upsert=True
            )
        print(f"[✓] Seeded {len(sample_tickets)} feedback support tickets.")

        # ---------------------------------------------------------
        # 4. Collection: student_master_records
        # ---------------------------------------------------------
        print("[*] Seeding collection: student_master_records...")
        students_col = db['student_master_records']
        students_col.create_index("student_id", unique=True)
        students_col.create_index("department")

        sample_student = {
            "student_id": "STU-2024-0891",
            "first_name": "Hassam",
            "last_name": "Khan",
            "email": "hassamkhan33344@gmail.com",
            "department": "Computer Science",
            "program": "B.Sc. in Computer Science (Big Data Systems)",
            "cohort_year": 2024,
            "current_semester": 6,
            "cumulative_gpa": 3.92,
            "attendance_rate": 96.5,
            "weekly_lms_hours": 14.8,
            "latest_prediction": {
                "evaluated_at": datetime.utcnow(),
                "dropout_probability_percentage": 1.8,
                "risk_level": "Low",
                "predicted_gpa": 3.94,
                "predicted_performance": "Satisfactory / Dean's List Track (> 3.5 GPA)",
                "detected_anomalies": [],
                "recommended_interventions": [
                    "Eligible for Honors Thesis Research & Peer Mentoring Fellowship"
                ]
            },
            "updated_at": datetime.utcnow()
        }

        students_col.update_one(
            {"student_id": sample_student["student_id"]},
            {"$set": sample_student},
            upsert=True
        )
        print("[✓] Seeded student master records.")

        print("\n" + "="*60)
        print(" [✓] SUCCESS: Local MongoDB seeded with all collections!")
        print("="*60)
        print("Login credentials:")
        print("  - Admin:   s.mitchell@university.edu   / admin123Password!")
        print("  - Faculty: m.vance@university.edu      / faculty123Password!")
        print("  - Student: hassamkhan33344@gmail.com   / student123Password!")
        print("  - Analyst: e.rostova@university.edu    / analyst123Password!")
        print("="*60 + "\n")

    except Exception as e:
        print(f"\n[!] Error connecting to MongoDB: {e}")
        print("Ensure your local MongoDB daemon is running (e.g., 'brew services start mongodb-community' or Windows MongoDB service).")


if __name__ == "__main__":
    seed_database()
