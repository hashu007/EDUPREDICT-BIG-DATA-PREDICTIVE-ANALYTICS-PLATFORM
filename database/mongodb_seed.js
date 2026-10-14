/**
 * ==============================================================================
 * EduPredict - MongoDB NoSQL Initialization & Seed Script (MQL)
 * ==============================================================================
 * Purpose: Setup MongoDB collections, schema validators, compound indices,
 *          and seed baseline educational records and RBAC accounts.
 * Execution: mongosh edupredict_db < mongodb_seed.js
 * ==============================================================================
 */

// Switch to edupredict database
const dbName = 'edupredict_db';
db = db.getSiblingDB(dbName);
print(`[+] Connecting to ${dbName}...`);

// 1. Setup Collection: user_accounts with schema validation
db.createCollection('user_accounts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password_hash', 'name', 'role'],
      properties: {
        email: { bsonType: 'string', pattern: '^.+@.+$' },
        password_hash: { bsonType: 'string' },
        name: { bsonType: 'string' },
        role: { enum: ['admin', 'faculty', 'student', 'analyst'] },
        department: { bsonType: 'string' },
        student_id: { bsonType: ['string', 'null'] }
      }
    }
  }
});

// Create unique and compound indexes
db.user_accounts.createIndex({ email: 1 }, { unique: true });
db.user_accounts.createIndex({ role: 1, department: 1 });
db.user_accounts.createIndex({ student_id: 1 }, { sparse: true });

// 2. Setup Collection: student_master_records
db.createCollection('student_master_records');
db.student_master_records.createIndex({ student_id: 1 }, { unique: true });
db.student_master_records.createIndex({ department: 1, cohort_year: 1 });
db.student_master_records.createIndex({ 'latest_prediction.risk_level': 1, attendance_rate: 1 });

// 3. Setup Collection: lms_telemetry_logs with 365-day TTL index
db.createCollection('lms_telemetry_logs');
db.lms_telemetry_logs.createIndex({ student_id: 1, event_timestamp: -1 });
db.lms_telemetry_logs.createIndex({ event_timestamp: 1 }, { expireAfterSeconds: 31536000 });

// 4. Seed RBAC Users
db.user_accounts.insertMany([
  {
    email: 's.mitchell@university.edu',
    password_hash: '$2b$12$e8YkC000000000000000000000000000000000000000000000000', // bcrypt hash placeholder
    name: 'Dr. Sarah Mitchell',
    role: 'admin',
    department: 'Academic Affairs & Institutional Research',
    created_at: new Date()
  },
  {
    email: 'm.vance@university.edu',
    password_hash: '$2b$12$e8YkC000000000000000000000000000000000000000000000000',
    name: 'Prof. Marcus Vance',
    role: 'faculty',
    department: 'Department of Computer Science',
    created_at: new Date()
  },
  {
    email: 'hassamkhan33344@gmail.com',
    password_hash: '$2b$12$e8YkC000000000000000000000000000000000000000000000000',
    name: 'Hassam Khan',
    role: 'student',
    student_id: 'STU-2024-0891',
    department: 'Department of Computer Science',
    created_at: new Date()
  },
  {
    email: 'e.rostova@university.edu',
    password_hash: '$2b$12$e8YkC000000000000000000000000000000000000000000000000',
    name: 'Elena Rostova',
    role: 'analyst',
    department: 'Big Data & Institutional Intelligence Lab',
    created_at: new Date()
  }
]);

// 5. Seed Exemplary Student Records
db.student_master_records.insertOne({
  student_id: 'STU-2024-0891',
  first_name: 'Hassam',
  last_name: 'Khan',
  email: 'hassamkhan33344@gmail.com',
  department: 'Computer Science',
  program: 'B.Sc. in Computer Science (Big Data Systems)',
  cohort_year: 2024,
  current_semester: 6,
  cumulative_gpa: 3.92,
  attendance_rate: 96.5,
  weekly_lms_hours: 14.8,
  latest_prediction: {
    evaluated_at: new Date(),
    dropout_probability_percentage: 1.8,
    risk_level: 'Low',
    predicted_gpa: 3.94,
    predicted_performance: "Satisfactory / Dean's List Track (> 3.5 GPA)",
    detected_anomalies: [],
    recommended_interventions: ['Eligible for Honors Thesis Research & Peer Mentoring Fellowship']
  },
  updated_at: new Date()
});

// ==============================================================================
// SAMPLE MQL AGGREGATION PIPELINES
// ==============================================================================

// Pipeline 1: Departmental At-Risk Density Aggregation
const deptRiskPipeline = [
  {
    $match: {
      'latest_prediction.risk_level': { $in: ['High', 'Critical'] }
    }
  },
  {
    $group: {
      _id: '$department',
      critical_students_count: { $sum: 1 },
      avg_attendance: { $avg: '$attendance_rate' },
      avg_gpa: { $avg: '$cumulative_gpa' }
    }
  },
  {
    $sort: { critical_students_count: -1 }
  },
  {
    $project: {
      department: '$_id',
      critical_students_count: 1,
      avg_attendance: { $round: ['$avg_attendance', 2] },
      avg_gpa: { $round: ['$avg_gpa', 2] }
    }
  }
];

print('[✓] MongoDB collections created, indexed, and baseline seeded successfully!');
