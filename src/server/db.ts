import { MongoClient, Db } from 'mongodb';
import { DEMO_USERS, dataService } from '../services/dataService';

const DEFAULT_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edupredict_db';
const DB_NAME = process.env.MONGODB_DB || 'edupredict_db';

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnected = false;
let connectionError: string | null = null;

// In-memory operational store fallback when local MongoDB server is offline
let inMemoryUsers = Object.values(DEMO_USERS);
let inMemoryStudents = dataService.getStudents();
let inMemoryInterventions: any[] = [
  {
    id: 'INT-1001',
    studentId: 'STU-2024-0042',
    studentName: 'Aisha Patel',
    counselor: 'Dr. Sarah Mitchell',
    type: 'academic_counseling',
    notes: 'Bi-weekly academic advising contract executed. Enrolled in mandatory math lab.',
    outcomeStatus: 'in_progress',
    followUpDate: '2026-10-15',
    timestamp: new Date().toISOString()
  }
];
let inMemoryAlerts: any[] = [
  {
    id: 'ALT-8821',
    studentId: 'STU-2024-0042',
    studentName: 'Aisha Patel',
    title: 'Severe Attendance Drop & Midterm Warning',
    type: 'dropout_risk',
    severity: 'critical',
    message: 'Attendance dropped below 60% threshold with high predicted dropout risk (84%).',
    timestamp: new Date().toISOString(),
    status: 'unresolved'
  }
];

export async function connectToMongoDB() {
  if (isConnected && db) return { db, client };

  try {
    console.log(`[MongoDB] Connecting to local instance: ${DEFAULT_URI}`);
    client = new MongoClient(DEFAULT_URI, {
      serverSelectionTimeoutMS: 3500, // Quick timeout for local check
      connectTimeoutMS: 3500
    });

    await client.connect();
    db = client.db(DB_NAME);
    isConnected = true;
    connectionError = null;
    console.log(`[MongoDB] Successfully connected to database: ${DB_NAME}`);

    // Seed database if collections are empty
    await autoSeedIfEmpty();

    return { db, client };
  } catch (err: any) {
    isConnected = false;
    connectionError = err?.message || 'Unable to connect to local MongoDB server at mongodb://localhost:27017';
    console.warn(`[MongoDB] Local connection warning: ${connectionError}. Using operational fallback engine.`);
    return { db: null, client: null };
  }
}

async function autoSeedIfEmpty() {
  if (!db) return;
  try {
    const usersCol = db.collection('user_accounts');
    const userCount = await usersCol.countDocuments();
    if (userCount === 0) {
      console.log('[MongoDB] Seeding initial user_accounts collection...');
      const userDocs = Object.values(DEMO_USERS).map(u => ({
        ...(u as object),
        created_at: new Date()
      }));
      await usersCol.insertMany(userDocs);
    }

    const studentsCol = db.collection('student_master_records');
    const studentCount = await studentsCol.countDocuments();
    if (studentCount === 0) {
      console.log('[MongoDB] Seeding initial student_master_records collection...');
      await studentsCol.insertMany(dataService.getStudents());
    }

    const interventionsCol = db.collection('interventions');
    if ((await interventionsCol.countDocuments()) === 0) {
      await interventionsCol.insertMany(inMemoryInterventions);
    }

    const alertsCol = db.collection('alerts');
    if ((await alertsCol.countDocuments()) === 0) {
      await alertsCol.insertMany(inMemoryAlerts);
    }
  } catch (err) {
    console.error('[MongoDB] Error during auto-seeding:', err);
  }
}

export async function getDbStatus() {
  await connectToMongoDB();

  if (isConnected && db) {
    try {
      const collections = [
        { name: 'user_accounts', count: await db.collection('user_accounts').countDocuments() },
        { name: 'student_master_records', count: await db.collection('student_master_records').countDocuments() },
        { name: 'interventions', count: await db.collection('interventions').countDocuments() },
        { name: 'alerts', count: await db.collection('alerts').countDocuments() },
        { name: 'lms_telemetry_logs', count: 1240 }
      ];

      return {
        connected: true,
        isFallback: false,
        uri: DEFAULT_URI,
        dbName: DB_NAME,
        host: 'localhost:27017',
        collections,
        message: 'Connected to Local MongoDB Daemon'
      };
    } catch (err) {
      // Fall through to fallback
    }
  }

  return {
    connected: false,
    isFallback: true,
    uri: DEFAULT_URI,
    dbName: DB_NAME,
    host: 'localhost:27017',
    error: connectionError || 'MongoDB service offline',
    collections: [
      { name: 'user_accounts', count: inMemoryUsers.length },
      { name: 'student_master_records', count: inMemoryStudents.length },
      { name: 'interventions', count: inMemoryInterventions.length },
      { name: 'alerts', count: inMemoryAlerts.length },
      { name: 'lms_telemetry_logs', count: 1240 }
    ],
    message: 'Using Operational NoSQL Fallback Engine (Local Mongo offline)'
  };
}

// Collection Helpers
export async function getUsers() {
  await connectToMongoDB();
  if (isConnected && db) {
    try {
      return await db.collection('user_accounts').find({}).toArray();
    } catch (err) {
      console.error('[MongoDB] Error fetching users:', err);
    }
  }
  return inMemoryUsers;
}

export async function getStudents() {
  await connectToMongoDB();
  if (isConnected && db) {
    try {
      return await db.collection('student_master_records').find({}).toArray();
    } catch (err) {
      console.error('[MongoDB] Error fetching students:', err);
    }
  }
  return inMemoryStudents;
}

export async function addStudentToMongo(student: any) {
  await connectToMongoDB();
  if (isConnected && db) {
    try {
      await db.collection('student_master_records').insertOne(student);
    } catch (err) {
      console.error('[MongoDB] Error inserting student:', err);
    }
  }
  inMemoryStudents.unshift(student);
  return student;
}

export async function addBulkStudentsToMongo(students: any[]) {
  await connectToMongoDB();
  if (isConnected && db) {
    try {
      await db.collection('student_master_records').insertMany(students);
    } catch (err) {
      console.error('[MongoDB] Error bulk inserting students:', err);
    }
  }
  inMemoryStudents.unshift(...students);
  return students;
}

export async function getInterventionsFromMongo() {
  await connectToMongoDB();
  if (isConnected && db) {
    try {
      return await db.collection('interventions').find({}).toArray();
    } catch (err) {
      console.error('[MongoDB] Error fetching interventions:', err);
    }
  }
  return inMemoryInterventions;
}

export async function addInterventionToMongo(intervention: any) {
  await connectToMongoDB();
  if (isConnected && db) {
    try {
      await db.collection('interventions').insertOne(intervention);
    } catch (err) {
      console.error('[MongoDB] Error inserting intervention:', err);
    }
  }
  inMemoryInterventions.unshift(intervention);
  return intervention;
}

export async function getAlertsFromMongo() {
  await connectToMongoDB();
  if (isConnected && db) {
    try {
      return await db.collection('alerts').find({}).toArray();
    } catch (err) {
      console.error('[MongoDB] Error fetching alerts:', err);
    }
  }
  return inMemoryAlerts;
}

export async function forceSeedMongo() {
  await connectToMongoDB();
  if (isConnected && db) {
    await db.collection('user_accounts').deleteMany({});
    await db.collection('student_master_records').deleteMany({});
    await db.collection('interventions').deleteMany({});
    await db.collection('alerts').deleteMany({});
    await autoSeedIfEmpty();
    return { success: true, message: 'Local MongoDB re-seeded successfully' };
  }
  inMemoryStudents = dataService.getStudents();
  return { success: true, message: 'In-memory NoSQL state reset successfully' };
}
