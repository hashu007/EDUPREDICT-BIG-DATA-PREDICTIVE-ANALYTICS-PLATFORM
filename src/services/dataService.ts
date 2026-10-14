import {
  Student,
  Course,
  HdfsNode,
  HdfsFile,
  MapReduceJob,
  TelemetryEvent,
  Alert,
  Intervention,
  User
} from '../types';
import { calculatePredictiveMetrics } from './mlEngine';

// Default Demo Users for Role Switching
export const DEMO_USERS: Record<string, User> = {
  admin: {
    id: 'usr-admin-01',
    name: 'Dr. Sarah Mitchell',
    email: 's.mitchell@university.edu',
    role: 'admin',
    department: 'Academic Affairs & Institutional Research',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    title: 'Dean of Academic Analytics & Operations'
  },
  faculty: {
    id: 'usr-faculty-01',
    name: 'Prof. Marcus Vance',
    email: 'm.vance@university.edu',
    role: 'faculty',
    department: 'Department of Computer Science',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Associate Professor & Curriculum Lead'
  },
  student: {
    id: 'usr-student-01',
    name: 'Hassam Khan',
    email: 'hassamkhan33344@gmail.com',
    role: 'student',
    department: 'Department of Computer Science',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    studentId: 'STU-2024-0891',
    title: 'Senior Undergraduate Scholar, Honors'
  },
  analyst: {
    id: 'usr-analyst-01',
    name: 'Elena Rostova',
    email: 'e.rostova@university.edu',
    role: 'analyst',
    department: 'Big Data & Institutional Intelligence Lab',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    title: 'Lead Big Data Architect & ML Scientist'
  }
};

export const DEMO_LOGIN_CREDENTIALS: Record<string, { email: string; password: string; aliases: string[] }> = {
  admin: { email: DEMO_USERS.admin.email, password: 'admin123Password!', aliases: ['admin', 'admin@university.edu'] },
  faculty: { email: DEMO_USERS.faculty.email, password: 'faculty123Password!', aliases: ['faculty', 'faculty@university.edu'] },
  student: { email: DEMO_USERS.student.email, password: 'student123Password!', aliases: ['hassam', 'stu-2024-0891'] },
  analyst: { email: DEMO_USERS.analyst.email, password: 'analyst123Password!', aliases: ['analyst', 'analyst@university.edu'] }
};

export const INITIAL_COURSES: Course[] = [
  {
    id: 'crs-01',
    code: 'CS-401',
    name: 'Distributed Systems & Cloud Computing',
    department: 'Computer Science',
    credits: 4,
    enrolledCount: 78,
    capacity: 90,
    predictedDemandNextTerm: 114,
    historicalDropRate: 8.5,
    instructor: 'Prof. Marcus Vance',
    semester: 'Fall 2026',
    difficultyRating: 4.2
  },
  {
    id: 'crs-02',
    code: 'CS-402',
    name: 'Cloud Computing & Distributed Data Systems',
    department: 'Computer Science',
    credits: 4,
    enrolledCount: 85,
    capacity: 85,
    predictedDemandNextTerm: 125,
    historicalDropRate: 11.2,
    instructor: 'Dr. Tariq Al-Mansoor',
    semester: 'Fall 2026',
    difficultyRating: 4.6
  },
  {
    id: 'crs-03',
    code: 'DS-305',
    name: 'Statistical Machine Learning & Predictive Modeling',
    department: 'Data Science',
    credits: 3,
    enrolledCount: 64,
    capacity: 70,
    predictedDemandNextTerm: 95,
    historicalDropRate: 14.8,
    instructor: 'Dr. Elena Rostova',
    semester: 'Fall 2026',
    difficultyRating: 4.4
  },
  {
    id: 'crs-04',
    code: 'SE-320',
    name: 'Software Engineering Principles & Agile Delivery',
    department: 'Software Engineering',
    credits: 3,
    enrolledCount: 92,
    capacity: 100,
    predictedDemandNextTerm: 105,
    historicalDropRate: 5.2,
    instructor: 'Prof. David Chen',
    semester: 'Fall 2026',
    difficultyRating: 3.2
  },
  {
    id: 'crs-05',
    code: 'BA-210',
    name: 'Business Analytics & Decision Sciences',
    department: 'Business Analytics',
    credits: 3,
    enrolledCount: 54,
    capacity: 65,
    predictedDemandNextTerm: 82,
    historicalDropRate: 6.9,
    instructor: 'Dr. Priya Patel',
    semester: 'Fall 2026',
    difficultyRating: 3.5
  },
  {
    id: 'crs-06',
    code: 'AI-450',
    name: 'Deep Neural Networks & Natural Language Systems',
    department: 'Artificial Intelligence',
    credits: 4,
    enrolledCount: 48,
    capacity: 50,
    predictedDemandNextTerm: 88,
    historicalDropRate: 16.1,
    instructor: 'Dr. Robert Novak',
    semester: 'Fall 2026',
    difficultyRating: 4.8
  }
];

export const INITIAL_HDFS_NODES: HdfsNode[] = [
  {
    id: 'node-nn-01',
    name: 'edupredict-nn01.cluster.local',
    type: 'namenode',
    status: 'healthy',
    capacityGB: 8192,
    usedGB: 4120,
    blocksCount: 48920,
    ipAddress: '10.240.0.10',
    rack: '/rack-a1',
    heartbeatAgoSec: 1
  },
  {
    id: 'node-dn-01',
    name: 'edupredict-dn01.cluster.local',
    type: 'datanode',
    status: 'healthy',
    capacityGB: 16384,
    usedGB: 9840,
    blocksCount: 16320,
    ipAddress: '10.240.0.11',
    rack: '/rack-a1',
    heartbeatAgoSec: 2
  },
  {
    id: 'node-dn-02',
    name: 'edupredict-dn02.cluster.local',
    type: 'datanode',
    status: 'healthy',
    capacityGB: 16384,
    usedGB: 9540,
    blocksCount: 16180,
    ipAddress: '10.240.0.12',
    rack: '/rack-a1',
    heartbeatAgoSec: 2
  },
  {
    id: 'node-dn-03',
    name: 'edupredict-dn03.cluster.local',
    type: 'datanode',
    status: 'healthy',
    capacityGB: 16384,
    usedGB: 10120,
    blocksCount: 16420,
    ipAddress: '10.240.0.13',
    rack: '/rack-b2',
    heartbeatAgoSec: 3
  },
  {
    id: 'node-dn-04',
    name: 'edupredict-dn04.cluster.local',
    type: 'datanode',
    status: 'healthy',
    capacityGB: 16384,
    usedGB: 8900,
    blocksCount: 15400,
    ipAddress: '10.240.0.14',
    rack: '/rack-b2',
    heartbeatAgoSec: 2
  }
];

export const INITIAL_HDFS_FILES: HdfsFile[] = [
  {
    path: '/user/edupredict/raw/student_demographics_2026.parquet',
    name: 'student_demographics_2026.parquet',
    sizeMB: 248.5,
    replication: 3,
    blockCount: 2,
    modificationDate: '2026-09-28 04:12 UTC',
    owner: 'hadoop',
    group: 'supergroup',
    permissions: '-rwxr-xr-x',
    format: 'parquet',
    recordsEstimate: 45000
  },
  {
    path: '/user/edupredict/raw/lms_telemetry_clickstream.parquet',
    name: 'lms_telemetry_clickstream.parquet',
    sizeMB: 1840.2,
    replication: 3,
    blockCount: 15,
    modificationDate: '2026-09-30 06:30 UTC',
    owner: 'spark_job',
    group: 'supergroup',
    permissions: '-rw-r--r--',
    format: 'parquet',
    recordsEstimate: 4200000
  },
  {
    path: '/user/edupredict/processed/student_attendance_aggregated.orc',
    name: 'student_attendance_aggregated.orc',
    sizeMB: 112.4,
    replication: 3,
    blockCount: 1,
    modificationDate: '2026-09-29 23:00 UTC',
    owner: 'mapreduce',
    group: 'supergroup',
    permissions: '-rwxr-xr-x',
    format: 'orc',
    recordsEstimate: 380000
  },
  {
    path: '/user/edupredict/features/student_predictive_features_v4.parquet',
    name: 'student_predictive_features_v4.parquet',
    sizeMB: 68.7,
    replication: 3,
    blockCount: 1,
    modificationDate: '2026-09-30 01:15 UTC',
    owner: 'ml_pipeline',
    group: 'supergroup',
    permissions: '-rw-r--r--',
    format: 'parquet',
    recordsEstimate: 125000
  },
  {
    path: '/user/edupredict/analytics/course_demand_forecast_2027_s1.csv',
    name: 'course_demand_forecast_2027_s1.csv',
    sizeMB: 14.8,
    replication: 3,
    blockCount: 1,
    modificationDate: '2026-09-29 18:40 UTC',
    owner: 'impala',
    group: 'supergroup',
    permissions: '-rwxr-xr-x',
    format: 'csv',
    recordsEstimate: 18500
  }
];

export const INITIAL_MAPREDUCE_JOBS: MapReduceJob[] = [
  {
    id: 'job_20260930_0842',
    name: 'EduPredict-Aggregate-LMS-Telemetrics-Daily',
    engine: 'Apache Spark 3.5',
    status: 'completed',
    progressMap: 100,
    progressReduce: 100,
    startTime: '2026-09-30 06:15:00 UTC',
    finishTime: '2026-09-30 06:18:42 UTC',
    recordsProcessed: 1420500,
    durationSeconds: 222,
    clusterCpuUsage: 78,
    stages: [
      { name: 'Reading Student Records from Drives', status: 'done', timeMs: 38000 },
      { name: 'Grouping by Student & Enrolled Course', status: 'done', timeMs: 84000 },
      { name: 'Organizing Records in Fast Memory', status: 'done', timeMs: 42000 },
      { name: 'Calculating 30-Day Study Summaries', status: 'done', timeMs: 58000 }
    ]
  },
  {
    id: 'job_20260930_0910',
    name: 'EduPredict-Student-Learning-Profiles-Update',
    engine: 'Apache Spark 3.5',
    status: 'completed',
    progressMap: 100,
    progressReduce: 100,
    startTime: '2026-09-30 07:00:10 UTC',
    finishTime: '2026-09-30 07:04:15 UTC',
    recordsProcessed: 48200,
    durationSeconds: 245,
    clusterCpuUsage: 84,
    stages: [
      { name: 'Standardizing Academic Scores', status: 'done', timeMs: 45000 },
      { name: 'Identifying Learning Archetypes 1-4', status: 'done', timeMs: 140000 },
      { name: 'Writing Profiles to Campus Storage', status: 'done', timeMs: 60000 }
    ]
  },
  {
    id: 'job_20260930_1044',
    name: 'EduPredict-Performance-Anomaly-Detector',
    engine: 'MapReduce v2',
    status: 'running',
    progressMap: 94,
    progressReduce: 62,
    startTime: '2026-09-30 07:35:00 UTC',
    recordsProcessed: 894000,
    durationSeconds: 140,
    clusterCpuUsage: 64,
    stages: [
      { name: 'Calculating Course Attendance Averages', status: 'done', timeMs: 52000 },
      { name: 'Sorting Unusual Score Drops', status: 'active', timeMs: 48000 },
      { name: 'Generating Early Advisory Flags', status: 'pending', timeMs: 0 }
    ]
  }
];

export const STUDENT_PORTRAITS: Record<string, string> = {
  'Jordan Rivera': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'Samantha Lee': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'Devon Brooks': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'Carlos Mendoza': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'Serena Williams-Taylor': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'Aisha Al-Hashimi': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'Tyler Vance': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  'Alexander Novak': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'Marcus Brody': 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
  'Maya Lin': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'Liam O’Connor': 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
  'Priya Sharma': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
  'Zane Washington': 'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=150&auto=format&fit=crop&q=80',
  'Fatima Zahra': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'Lucas Silva': 'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=150&auto=format&fit=crop&q=80',
  'Rachel Goldberg': 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=150&auto=format&fit=crop&q=80',
  'Ananya Roy': 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80',
  'Jason Wu': 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&auto=format&fit=crop&q=80',
  'Khadija El-Mansouri': 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
  'Hassam Khan': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
};

const DEFAULT_PORTRAIT_LIST = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80'
];

export const getStudentAvatar = (name: string, idx = 0): string => {
  if (STUDENT_PORTRAITS[name]) return STUDENT_PORTRAITS[name];
  return DEFAULT_PORTRAIT_LIST[idx % DEFAULT_PORTRAIT_LIST.length];
};

export function getCohortForSemester(sem: number): string {
  if (sem >= 7) return '2023–2027 (Senior Batch)';
  if (sem >= 5) return '2024–2028 (Junior Batch)';
  if (sem >= 3) return '2025–2029 (Sophomore Batch)';
  return '2026–2030 (Freshman Batch)';
}

export function getCoursesForStudent(dept: string, semester: number, gpa: number, attendanceRate: number) {
  const getGrade = (offset = 0) => {
    const adj = gpa + offset;
    if (adj >= 3.7) return 'A';
    if (adj >= 3.3) return 'A-';
    if (adj >= 3.0) return 'B+';
    if (adj >= 2.7) return 'B';
    if (adj >= 2.3) return 'B-';
    if (adj >= 2.0) return 'C+';
    if (adj >= 1.7) return 'C';
    if (adj >= 1.3) return 'D';
    return 'F';
  };

  const att = (diff = 0) => Math.min(100, Math.max(20, Math.round(attendanceRate + diff)));

  if (dept === 'Data Science') {
    if (semester >= 6) {
      return [
        { code: 'DS-401', name: 'Big Data Pipeline Engineering', gradeCurrent: getGrade(), attendance: att(0) },
        { code: 'DS-405', name: 'Natural Language Processing & LLMs', gradeCurrent: getGrade(-0.2), attendance: att(-3) },
        { code: 'DS-490', name: 'Predictive Analytics Capstone Project', gradeCurrent: getGrade(0.1), attendance: att(2) }
      ];
    }
    return [
      { code: 'DS-305', name: 'Statistical Machine Learning', gradeCurrent: getGrade(), attendance: att(0) },
      { code: 'DS-310', name: 'Data Wrangling & Feature Engineering', gradeCurrent: getGrade(0.1), attendance: att(1) },
      { code: 'STA-201', name: 'Applied Multivariate Statistics', gradeCurrent: getGrade(-0.3), attendance: att(-2) }
    ];
  }

  if (dept === 'Software Engineering') {
    if (semester >= 6) {
      return [
        { code: 'SE-401', name: 'Cloud-Native Distributed Microservices', gradeCurrent: getGrade(), attendance: att(0) },
        { code: 'SE-420', name: 'DevOps, CI/CD & Site Reliability', gradeCurrent: getGrade(0.1), attendance: att(2) },
        { code: 'SE-490', name: 'Software Architecture Capstone', gradeCurrent: getGrade(-0.1), attendance: att(-1) }
      ];
    }
    return [
      { code: 'SE-320', name: 'Agile Software Engineering Principles', gradeCurrent: getGrade(), attendance: att(0) },
      { code: 'SE-330', name: 'Automated Software Testing & QA', gradeCurrent: getGrade(-0.2), attendance: att(-2) },
      { code: 'SE-210', name: 'Software Requirements & UX Design', gradeCurrent: getGrade(0.2), attendance: att(1) }
    ];
  }

  if (dept === 'Business Analytics') {
    if (semester >= 6) {
      return [
        { code: 'BA-401', name: 'Enterprise Business Intelligence Systems', gradeCurrent: getGrade(), attendance: att(0) },
        { code: 'BA-410', name: 'Supply Chain Analytics & Forecasting', gradeCurrent: getGrade(-0.2), attendance: att(-2) },
        { code: 'BA-450', name: 'Strategic Executive Decision Modeling', gradeCurrent: getGrade(0.1), attendance: att(1) }
      ];
    }
    return [
      { code: 'BA-210', name: 'Business Analytics & Decision Sciences', gradeCurrent: getGrade(), attendance: att(0) },
      { code: 'BA-301', name: 'Econometrics & Predictive Forecasting', gradeCurrent: getGrade(-0.1), attendance: att(-3) },
      { code: 'BA-320', name: 'Customer Lifetime Value Analytics', gradeCurrent: getGrade(0.2), attendance: att(2) }
    ];
  }

  if (dept === 'Artificial Intelligence') {
    if (semester >= 6) {
      return [
        { code: 'AI-450', name: 'Deep Neural Networks & Transformers', gradeCurrent: getGrade(), attendance: att(0) },
        { code: 'AI-470', name: 'Reinforcement Learning & Robotics', gradeCurrent: getGrade(-0.2), attendance: att(-2) },
        { code: 'AI-490', name: 'Autonomous Systems & Edge AI', gradeCurrent: getGrade(0.1), attendance: att(1) }
      ];
    }
    return [
      { code: 'AI-301', name: 'Computer Vision & Pattern Recognition', gradeCurrent: getGrade(), attendance: att(0) },
      { code: 'AI-310', name: 'Knowledge Graphs & Symbolic AI', gradeCurrent: getGrade(0.1), attendance: att(1) },
      { code: 'MAT-230', name: 'Convex Optimization for AI', gradeCurrent: getGrade(-0.3), attendance: att(-4) }
    ];
  }

  // Default Computer Science
  if (semester >= 6) {
    return [
      { code: 'CS-401', name: 'Distributed Systems & Cloud Computing', gradeCurrent: getGrade(), attendance: att(0) },
      { code: 'CS-402', name: 'Cloud Computing & Distributed Data Systems', gradeCurrent: getGrade(-0.1), attendance: att(-2) },
      { code: 'CS-460', name: 'Compiler Design & Parallel Programming', gradeCurrent: getGrade(-0.2), attendance: att(-1) }
    ];
  }
  return [
    { code: 'CS-301', name: 'Advanced Algorithms & Data Structures', gradeCurrent: getGrade(), attendance: att(0) },
    { code: 'CS-305', name: 'Operating Systems & Concurrency', gradeCurrent: getGrade(-0.1), attendance: att(-2) },
    { code: 'CS-310', name: 'Database Management Systems & SQL', gradeCurrent: getGrade(0.2), attendance: att(1) }
  ];
}

// Helper to create realistic student dataset
function generateInitialStudents(): Student[] {
  const students: Student[] = [];

  // Lead Student Profile (matching user context Hassam Khan)
  const hassamAcademic = {
    currentGPA: 3.72,
    cumulativeGPA: 3.65,
    creditHoursAttempted: 114,
    creditHoursCompleted: 114,
    midtermsAverage: 88.5,
    assignmentsScore: 92.0,
    finalExamForecast: 90.0,
    recentGradeTrend: 'improving' as const
  };
  const hassamAttendance = {
    overallRate: 94.0,
    totalClasses: 48,
    absentDays: 3,
    consecutiveAbsences: 0,
    trend: 'stable' as const,
    weeklyAttendanceHistory: [92, 95, 96, 91, 94, 98, 92, 95]
  };
  const hassamLms = {
    weeklyHours: 11.5,
    videoCompletionRate: 96.0,
    quizAttemptsAvg: 2.8,
    forumPostsCount: 19,
    lastLoginDaysAgo: 0,
    assignmentSubmissionOnTimeRate: 98.0,
    activityIndexScore: 94,
    weeklyActivityHistory: [88, 90, 92, 95, 93, 97, 94, 96]
  };
  const hassamPred = calculatePredictiveMetrics(hassamAcademic, hassamAttendance, hassamLms);

  students.push({
    id: 'stu-hassam-khan',
    studentId: 'STU-2024-0891',
    name: 'Hassam Khan',
    email: 'hassamkhan33344@gmail.com',
    department: 'Computer Science',
    program: 'B.Sc. Computer Science (Honors)',
    semester: 7,
    cohort: '2024-2027',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    demographics: {
      gender: 'Male',
      firstGenStudent: false,
      financialAidStatus: 'Partial',
      highSchoolGPA: 3.8
    },
    academic: hassamAcademic,
    attendance: hassamAttendance,
    lms: hassamLms,
    predictions: hassamPred,
    interventions: [
      {
        id: 'int-001',
        timestamp: '2026-09-15',
        studentId: 'STU-2024-0891',
        studentName: 'Hassam Khan',
        counselor: 'Prof. Marcus Vance',
        type: 'faculty_mentoring',
        notes: 'Senior honors research review conducted. Approved distributed systems & predictive analytics syllabus.',
        outcomeStatus: 'successful'
      }
    ],
    currentCourses: [
      { code: 'CS-401', name: 'Distributed Systems & Cloud Computing', gradeCurrent: 'A', attendance: 95 },
      { code: 'CS-402', name: 'Cloud Computing & Distributed Data Systems', gradeCurrent: 'A-', attendance: 96 },
      { code: 'DS-305', name: 'Statistical Machine Learning', gradeCurrent: 'A', attendance: 92 },
      { code: 'SE-320', name: 'Software Engineering Principles', gradeCurrent: 'A', attendance: 93 }
    ]
  });

  // Synthesized realistic cohorts with diverse pedagogical profiles
  const rawRoster = [
    // CRITICAL / HIGH RISK STUDENTS
    {
      name: 'Jordan Rivera',
      gender: 'Male' as const,
      dept: 'Computer Science',
      sem: 5,
      currentGPA: 1.82,
      cumGPA: 2.10,
      midterms: 42,
      assignments: 50,
      attendanceRate: 58,
      consecutiveAbs: 4,
      trend: 'declining' as const,
      lmsHours: 2.1,
      videoRate: 35,
      punctuality: 45
    },
    {
      name: 'Samantha Lee',
      gender: 'Female' as const,
      dept: 'Data Science',
      sem: 3,
      currentGPA: 2.05,
      cumGPA: 2.30,
      midterms: 48,
      assignments: 55,
      attendanceRate: 64,
      consecutiveAbs: 3,
      trend: 'declining' as const,
      lmsHours: 2.8,
      videoRate: 42,
      punctuality: 52
    },
    {
      name: 'Devon Brooks',
      gender: 'Male' as const,
      dept: 'Software Engineering',
      sem: 4,
      currentGPA: 1.65,
      cumGPA: 1.95,
      midterms: 38,
      assignments: 40,
      attendanceRate: 52,
      consecutiveAbs: 5,
      trend: 'declining' as const,
      lmsHours: 1.5,
      videoRate: 25,
      punctuality: 38
    },
    {
      name: 'Aisha Al-Hashimi',
      gender: 'Female' as const,
      dept: 'Business Analytics',
      sem: 6,
      currentGPA: 2.15,
      cumGPA: 2.45,
      midterms: 52,
      assignments: 60,
      attendanceRate: 68,
      consecutiveAbs: 2,
      trend: 'declining' as const,
      lmsHours: 3.2,
      videoRate: 48,
      punctuality: 58
    },
    {
      name: 'Carlos Mendoza',
      gender: 'Male' as const,
      dept: 'Artificial Intelligence',
      sem: 5,
      currentGPA: 1.90,
      cumGPA: 2.15,
      midterms: 45,
      assignments: 48,
      attendanceRate: 60,
      consecutiveAbs: 4,
      trend: 'declining' as const,
      lmsHours: 2.4,
      videoRate: 38,
      punctuality: 42
    },

    // DILIGENT BUT STRUGGLING (High attendance, high LMS hours, but poor exam scores)
    {
      name: 'Emily Watson',
      gender: 'Female' as const,
      dept: 'Computer Science',
      sem: 4,
      currentGPA: 2.45,
      cumGPA: 2.50,
      midterms: 55,
      assignments: 78,
      attendanceRate: 94,
      consecutiveAbs: 0,
      trend: 'stable' as const,
      lmsHours: 9.5,
      videoRate: 88,
      punctuality: 85
    },
    {
      name: 'Tariq Mahmood',
      gender: 'Male' as const,
      dept: 'Data Science',
      sem: 4,
      currentGPA: 2.55,
      cumGPA: 2.60,
      midterms: 58,
      assignments: 82,
      attendanceRate: 91,
      consecutiveAbs: 0,
      trend: 'stable' as const,
      lmsHours: 8.8,
      videoRate: 84,
      punctuality: 90
    },
    {
      name: 'Chloe Bennett',
      gender: 'Female' as const,
      dept: 'Software Engineering',
      sem: 3,
      currentGPA: 2.40,
      cumGPA: 2.48,
      midterms: 54,
      assignments: 76,
      attendanceRate: 96,
      consecutiveAbs: 0,
      trend: 'improving' as const,
      lmsHours: 10.2,
      videoRate: 92,
      punctuality: 88
    },

    // PASSIVE HIGH POTENTIAL / ASYNCHRONOUS (Low attendance, but brilliant exam scores)
    {
      name: 'Alexander Novak',
      gender: 'Male' as const,
      dept: 'Artificial Intelligence',
      sem: 7,
      currentGPA: 3.85,
      cumGPA: 3.80,
      midterms: 94,
      assignments: 88,
      attendanceRate: 52,
      consecutiveAbs: 3,
      trend: 'stable' as const,
      lmsHours: 4.0,
      videoRate: 45,
      punctuality: 75
    },
    {
      name: 'Maya Lin',
      gender: 'Female' as const,
      dept: 'Computer Science',
      sem: 6,
      currentGPA: 3.90,
      cumGPA: 3.88,
      midterms: 96,
      assignments: 92,
      attendanceRate: 54,
      consecutiveAbs: 2,
      trend: 'stable' as const,
      lmsHours: 4.5,
      videoRate: 50,
      punctuality: 82
    },

    // CONSISTENT HIGH ACHIEVERS
    {
      name: 'Liam O’Connor',
      gender: 'Male' as const,
      dept: 'Software Engineering',
      sem: 7,
      currentGPA: 3.88,
      cumGPA: 3.82,
      midterms: 92,
      assignments: 95,
      attendanceRate: 96,
      consecutiveAbs: 0,
      trend: 'improving' as const,
      lmsHours: 12.0,
      videoRate: 95,
      punctuality: 96
    },
    {
      name: 'Priya Sharma',
      gender: 'Female' as const,
      dept: 'Data Science',
      sem: 5,
      currentGPA: 3.94,
      cumGPA: 3.91,
      midterms: 95,
      assignments: 98,
      attendanceRate: 98,
      consecutiveAbs: 0,
      trend: 'stable' as const,
      lmsHours: 13.5,
      videoRate: 98,
      punctuality: 100
    },
    {
      name: 'Zane Washington',
      gender: 'Male' as const,
      dept: 'Business Analytics',
      sem: 5,
      currentGPA: 3.78,
      cumGPA: 3.70,
      midterms: 89,
      assignments: 91,
      attendanceRate: 92,
      consecutiveAbs: 0,
      trend: 'improving' as const,
      lmsHours: 10.0,
      videoRate: 90,
      punctuality: 94
    },
    {
      name: 'Fatima Zahra',
      gender: 'Female' as const,
      dept: 'Artificial Intelligence',
      sem: 6,
      currentGPA: 3.82,
      cumGPA: 3.79,
      midterms: 90,
      assignments: 93,
      attendanceRate: 95,
      consecutiveAbs: 0,
      trend: 'stable' as const,
      lmsHours: 11.0,
      videoRate: 92,
      punctuality: 95
    },
    {
      name: 'Lucas Silva',
      gender: 'Male' as const,
      dept: 'Computer Science',
      sem: 4,
      currentGPA: 3.68,
      cumGPA: 3.60,
      midterms: 86,
      assignments: 89,
      attendanceRate: 93,
      consecutiveAbs: 0,
      trend: 'improving' as const,
      lmsHours: 9.8,
      videoRate: 88,
      punctuality: 92
    },

    // MODERATE RISK / AVERAGE PERFORMERS
    {
      name: 'Rachel Goldberg',
      gender: 'Female' as const,
      dept: 'Business Analytics',
      sem: 4,
      currentGPA: 2.92,
      cumGPA: 3.05,
      midterms: 68,
      assignments: 72,
      attendanceRate: 80,
      consecutiveAbs: 1,
      trend: 'stable' as const,
      lmsHours: 6.2,
      videoRate: 70,
      punctuality: 74
    },
    {
      name: 'Marcus Brody',
      gender: 'Male' as const,
      dept: 'Computer Science',
      sem: 5,
      currentGPA: 2.85,
      cumGPA: 2.95,
      midterms: 65,
      assignments: 70,
      attendanceRate: 78,
      consecutiveAbs: 1,
      trend: 'declining' as const,
      lmsHours: 5.8,
      videoRate: 65,
      punctuality: 70
    },
    {
      name: 'Ananya Roy',
      gender: 'Female' as const,
      dept: 'Software Engineering',
      sem: 4,
      currentGPA: 3.12,
      cumGPA: 3.18,
      midterms: 74,
      assignments: 79,
      attendanceRate: 84,
      consecutiveAbs: 0,
      trend: 'stable' as const,
      lmsHours: 7.0,
      videoRate: 75,
      punctuality: 80
    },
    {
      name: 'Jason Wu',
      gender: 'Male' as const,
      dept: 'Data Science',
      sem: 6,
      currentGPA: 3.08,
      cumGPA: 3.15,
      midterms: 72,
      assignments: 76,
      attendanceRate: 82,
      consecutiveAbs: 1,
      trend: 'stable' as const,
      lmsHours: 6.5,
      videoRate: 72,
      punctuality: 76
    },
    {
      name: 'Khadija El-Mansouri',
      gender: 'Female' as const,
      dept: 'Computer Science',
      sem: 5,
      currentGPA: 3.25,
      cumGPA: 3.30,
      midterms: 78,
      assignments: 82,
      attendanceRate: 88,
      consecutiveAbs: 0,
      trend: 'improving' as const,
      lmsHours: 8.0,
      videoRate: 80,
      punctuality: 84
    },

    // ANOMALOUS GHOST PRESENCE (High attendance, exam collapse)
    {
      name: 'Tyler Vance',
      gender: 'Male' as const,
      dept: 'Computer Science',
      sem: 3,
      currentGPA: 2.00,
      cumGPA: 2.20,
      midterms: 40,
      assignments: 45,
      attendanceRate: 95,
      consecutiveAbs: 0,
      trend: 'declining' as const,
      lmsHours: 3.0,
      videoRate: 40,
      punctuality: 50
    },

    // ACUTE PERFORMANCE SHOCK
    {
      name: 'Serena Williams-Taylor',
      gender: 'Female' as const,
      dept: 'Data Science',
      sem: 6,
      currentGPA: 2.30,
      cumGPA: 3.75,
      midterms: 50,
      assignments: 60,
      attendanceRate: 72,
      consecutiveAbs: 3,
      trend: 'declining' as const,
      lmsHours: 4.0,
      videoRate: 50,
      punctuality: 60
    }
  ];

  rawRoster.forEach((r, idx) => {
    const sId = `STU-2024-${String(1001 + idx).padStart(4, '0')}`;
    const acad = {
      currentGPA: r.currentGPA,
      cumulativeGPA: r.cumGPA,
      creditHoursAttempted: r.sem * 16,
      creditHoursCompleted: r.sem * 15,
      midtermsAverage: r.midterms,
      assignmentsScore: r.assignments,
      finalExamForecast: Math.min(100, Math.max(30, r.midterms + (r.trend === 'improving' ? 5 : -4))),
      recentGradeTrend: r.trend
    };
    const att = {
      overallRate: r.attendanceRate,
      totalClasses: 48,
      absentDays: Math.round(48 * (1 - r.attendanceRate / 100)),
      consecutiveAbsences: r.consecutiveAbs,
      trend: r.trend,
      weeklyAttendanceHistory: [
        r.attendanceRate + (r.trend === 'declining' ? 8 : -4),
        r.attendanceRate + (r.trend === 'declining' ? 6 : -2),
        r.attendanceRate + 3,
        r.attendanceRate + 1,
        r.attendanceRate - 1,
        r.attendanceRate - 2,
        r.attendanceRate - (r.trend === 'declining' ? 5 : 0),
        r.attendanceRate
      ].map(v => Math.max(20, Math.min(100, v)))
    };
    const lms = {
      weeklyHours: r.lmsHours,
      videoCompletionRate: r.videoRate,
      quizAttemptsAvg: Number((r.midterms / 35).toFixed(1)),
      forumPostsCount: Math.round(r.lmsHours * 1.5),
      lastLoginDaysAgo: r.lmsHours < 3 ? 4 : 0,
      assignmentSubmissionOnTimeRate: r.punctuality,
      activityIndexScore: Math.round((r.attendanceRate * 0.4) + (r.videoRate * 0.3) + (r.lmsHours / 12 * 100 * 0.3)),
      weeklyActivityHistory: [70, 72, 75, 71, 74, 76, 73, 75].map(v => Math.max(15, Math.min(100, Math.round(v * (r.lmsHours / 8)))))
    };

    const preds = calculatePredictiveMetrics(acad, att, lms);

    students.push({
      id: `stu-${idx + 2}`,
      studentId: sId,
      name: r.name,
      email: `${r.name.toLowerCase().replace(/[^a-z]/g, '')}@student.university.edu`,
      department: r.dept,
      program: `B.Sc. ${r.dept}`,
      semester: r.sem,
      cohort: getCohortForSemester(r.sem),
      avatar: getStudentAvatar(r.name, idx),
      demographics: {
        gender: r.gender,
        firstGenStudent: idx % 3 === 0,
        financialAidStatus: idx % 2 === 0 ? 'Full' : 'Partial',
        highSchoolGPA: Number((2.8 + (idx % 12) * 0.1).toFixed(2))
      },
      academic: acad,
      attendance: att,
      lms: lms,
      predictions: preds,
      interventions: r.attendanceRate < 70 ? [
        {
          id: `int-auto-${idx}`,
          timestamp: '2026-09-22',
          studentId: sId,
          studentName: r.name,
          counselor: 'Dr. Sarah Mitchell',
          type: 'attendance_warning',
          notes: `Official automated early alert issued due to attendance dropping below 70% (${r.attendanceRate}%).`,
          outcomeStatus: 'in_progress',
          followUpDate: '2026-10-05'
        }
      ] : [],
      currentCourses: getCoursesForStudent(r.dept, r.sem, acad.currentGPA, att.overallRate)
    });
  });

  return students;
}

export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'alt-001',
    timestamp: '2026-09-30 08:14 UTC',
    studentId: 'STU-2024-1003',
    studentName: 'Devon Brooks',
    department: 'Software Engineering',
    severity: 'critical',
    type: 'attendance_drop',
    title: 'Severe Attendance Collapse & Dropout Risk Spike',
    message: 'Attendance plummeted to 52% with 5 consecutive unexcused absences. Machine learning model elevated dropout probability to 86%.',
    status: 'unresolved'
  },
  {
    id: 'alt-002',
    timestamp: '2026-09-30 07:45 UTC',
    studentId: 'STU-2024-1021',
    studentName: 'Serena Williams-Taylor',
    department: 'Data Science',
    severity: 'critical',
    type: 'anomaly_flag',
    title: 'Acute Performance Shock Anomaly Detected',
    message: 'Student with historical 3.75 cumulative GPA recorded 50% on midterms. Statistical anomaly Z-score exceeds 2.8.',
    status: 'unresolved'
  },
  {
    id: 'alt-003',
    timestamp: '2026-09-29 16:30 UTC',
    studentId: 'STU-2024-1001',
    studentName: 'Jordan Rivera',
    department: 'Computer Science',
    severity: 'warning',
    type: 'quiz_failure',
    title: 'Consecutive LMS Quiz Submissions Failed',
    message: 'Scored 42% on CS-402 Distributed Systems quiz. Zero video interactions logged in the preceding 7 days.',
    status: 'acknowledged',
    assignee: 'Prof. Marcus Vance'
  },
  {
    id: 'alt-004',
    timestamp: '2026-09-29 11:20 UTC',
    studentId: 'STU-2024-1020',
    studentName: 'Tyler Vance',
    department: 'Computer Science',
    severity: 'warning',
    type: 'anomaly_flag',
    title: 'Ghost Presence Anomaly Identified',
    message: 'Student maintains 95% physical class attendance but scores 40% on examinations with only 3.0h weekly LMS engagement.',
    status: 'acknowledged',
    assignee: 'Dr. Sarah Mitchell'
  }
];

export const INITIAL_TELEMETRY: TelemetryEvent[] = [
  {
    id: 'tel-001',
    timestamp: 'Just now',
    studentId: 'STU-2024-0891',
    studentName: 'Hassam Khan',
    eventType: 'quiz_submission',
    detail: 'Submitted CS-402 Big Data Pipeline quiz with score 96/100',
    riskDelta: -1.2
  },
  {
    id: 'tel-002',
    timestamp: '2 min ago',
    studentId: 'STU-2024-1011',
    studentName: 'Priya Sharma',
    eventType: 'lms_video_watch',
    detail: 'Completed 45min module: Spark RDD vs DataFrames Architecture',
    riskDelta: -0.8
  },
  {
    id: 'tel-003',
    timestamp: '4 min ago',
    studentId: 'STU-2024-1003',
    studentName: 'Devon Brooks',
    eventType: 'login_burst',
    detail: 'LMS portal session timed out after 3 minutes of inactivity',
    riskDelta: 0.5
  },
  {
    id: 'tel-004',
    timestamp: '7 min ago',
    studentId: 'STU-2024-1006',
    studentName: 'Emily Watson',
    eventType: 'forum_post',
    detail: 'Posted question in CS-401 discussion forum regarding cloud storage block allocation',
    riskDelta: -0.6
  },
  {
    id: 'tel-005',
    timestamp: '11 min ago',
    studentId: 'STU-2024-1002',
    studentName: 'Samantha Lee',
    eventType: 'assignment_upload',
    detail: 'Uploaded Assignment 3 for DS-305 (Late by 14 hours)',
    riskDelta: 1.1
  }
];

// In-Memory Global State with LocalStorage Caching
class EduPredictDataService {
  private students: Student[];
  private courses: Course[];
  private hdfsNodes: HdfsNode[];
  private hdfsFiles: HdfsFile[];
  private mapReduceJobs: MapReduceJob[];
  private alerts: Alert[];
  private telemetry: TelemetryEvent[];
  private activeUser: User;
  private registeredUsers: (User & { password?: string })[];
  private listeners: (() => void)[] = [];

  constructor() {
    const loaded = this.loadFromStorage('edupredict_students', generateInitialStudents());
    this.students = loaded.map((s, idx) => {
      const courses = (s.currentCourses && s.currentCourses.length > 0 && s.currentCourses.some(c => c.name.toLowerCase().includes(s.department.toLowerCase().slice(0, 4))))
        ? s.currentCourses
        : getCoursesForStudent(s.department, s.semester, s.academic?.currentGPA || 3.0, s.attendance?.overallRate || 90);
      return {
        ...s,
        avatar: STUDENT_PORTRAITS[s.name] || (s.avatar && !s.avatar.includes('1500000000000') ? s.avatar : getStudentAvatar(s.name, idx)),
        currentCourses: courses,
        cohort: s.cohort || getCohortForSemester(s.semester)
      };
    });
    this.courses = this.loadFromStorage('edupredict_courses', INITIAL_COURSES);
    this.hdfsNodes = INITIAL_HDFS_NODES;
    this.hdfsFiles = INITIAL_HDFS_FILES;
    this.mapReduceJobs = INITIAL_MAPREDUCE_JOBS;
    this.alerts = this.loadFromStorage('edupredict_alerts', INITIAL_ALERTS);
    this.telemetry = INITIAL_TELEMETRY;
    this.registeredUsers = this.loadFromStorage('edupredict_registered_users', []);
    
    // Load persisted user or default
    const savedUser = this.loadFromStorage<User | null>('edupredict_active_user', null);
    if (savedUser) {
      this.activeUser = savedUser;
    } else {
      const savedUserRole = localStorage.getItem('edupredict_active_role') || 'admin';
      this.activeUser = DEMO_USERS[savedUserRole] || DEMO_USERS.admin;
    }

    // Start background simulated streaming telemetry
    this.startStreamingSimulation();
  }

  private loadFromStorage<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return fallback;
  }

  private saveToStorage(key: string, val: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {
      // ignore
    }
  }

  public subscribe(cb: () => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  public getActiveUser(): User {
    return this.activeUser;
  }

  public setActiveUser(user: User) {
    this.activeUser = user;
    localStorage.setItem('edupredict_active_role', user.role);
    localStorage.setItem('edupredict_active_user', JSON.stringify(user));
    this.notify();
  }

  public setActiveUserRole(role: string) {
    if (DEMO_USERS[role]) {
      this.activeUser = DEMO_USERS[role];
      localStorage.setItem('edupredict_active_role', role);
      localStorage.setItem('edupredict_active_user', JSON.stringify(DEMO_USERS[role]));
      this.notify();
    }
  }

  public registerStudentUser(data: {
    name: string;
    email: string;
    password: string;
    department: string;
    program?: string;
    semester: number;
    studentId?: string;
  }): { success: boolean; user?: User; error?: string } {
    const emailClean = data.email.trim().toLowerCase();
    const existing = this.registeredUsers.find(
      u => u.email.toLowerCase() === emailClean || (data.studentId && u.studentId?.toLowerCase() === data.studentId.trim().toLowerCase())
    );
    if (existing) {
      return { success: false, error: 'An account with this email or Student ID already exists.' };
    }

    const assignedId = data.studentId?.trim() || `STU-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const studentUser: User = {
      id: `usr-student-${Date.now()}`,
      name: data.name.trim(),
      email: emailClean,
      role: 'student',
      department: data.department,
      studentId: assignedId,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      title: `${data.department} Undergraduate Scholar`
    };

    // Store credential
    this.registeredUsers.push({
      ...studentUser,
      password: data.password
    });
    this.saveToStorage('edupredict_registered_users', this.registeredUsers);

    // Create corresponding Student profile in student registry
    const existingStudentRecord = this.students.find(s => s.studentId === assignedId);
    if (!existingStudentRecord) {
      const academic = {
        currentGPA: 3.55,
        cumulativeGPA: 3.55,
        creditHoursAttempted: data.semester * 16,
        creditHoursCompleted: data.semester * 16,
        midtermsAverage: 84.0,
        assignmentsScore: 88.0,
        finalExamForecast: 86.0,
        recentGradeTrend: 'improving' as const
      };
      const attendance = {
        overallRate: 94.0,
        totalClasses: 48,
        absentDays: 3,
        consecutiveAbsences: 0,
        trend: 'stable' as const,
        weeklyAttendanceHistory: [92, 94, 95, 91, 93, 96, 94, 94]
      };
      const lms = {
        weeklyHours: 9.2,
        videoCompletionRate: 92.0,
        quizAttemptsAvg: 2.8,
        forumPostsCount: 14,
        lastLoginDaysAgo: 0,
        assignmentSubmissionOnTimeRate: 96.0,
        activityIndexScore: 88,
        weeklyActivityHistory: [82, 86, 88, 90, 89, 93, 91, 94]
      };
      const pred = calculatePredictiveMetrics(academic, attendance, lms);

      const deptCourses = this.courses.filter(c => c.department === data.department);
      const enrolledCourses = (deptCourses.length > 0 ? deptCourses : this.courses.slice(0, 3)).map(c => ({
        code: c.code,
        name: c.name,
        gradeCurrent: 'A',
        attendance: 94
      }));

      const newStudentObj: Student = {
        id: `stu-${Date.now()}`,
        studentId: assignedId,
        name: data.name.trim(),
        email: emailClean,
        department: data.department,
        program: data.program || `B.Sc. in ${data.department}`,
        semester: data.semester,
        cohort: '2026-2029',
        avatar: studentUser.avatar,
        demographics: {
          gender: 'Other',
          firstGenStudent: false,
          financialAidStatus: 'Partial',
          highSchoolGPA: 3.7
        },
        academic,
        attendance,
        lms,
        predictions: pred,
        interventions: [],
        currentCourses: enrolledCourses
      };

      this.students.unshift(newStudentObj);
      this.saveToStorage('edupredict_students', this.students);
    }

    // Attempt backend registration in background (syncs with local MongoDB when running)
    this.syncToBackend();

    this.setActiveUser(studentUser);
    return { success: true, user: studentUser };
  }

  public authenticate(emailOrId: string, passwordPlain: string): { success: boolean; user?: User; error?: string } {
    const query = emailOrId.trim().toLowerCase();

    // 1. Check registered users list (by exact email or exact student ID)
    const registered = this.registeredUsers.find(
      u => u.email.toLowerCase() === query || u.studentId?.toLowerCase() === query
    );
    if (registered) {
      if (registered.password && registered.password === passwordPlain) {
        const safeUser: User = {
          id: registered.id,
          name: registered.name,
          email: registered.email,
          role: registered.role,
          department: registered.department,
          studentId: registered.studentId,
          avatar: registered.avatar,
          title: registered.title
        };
        this.setActiveUser(safeUser);
        return { success: true, user: safeUser };
      }
      return { success: false, error: 'Incorrect password entered.' };
    }

    // 2. Predefined demo accounts require their matching demo password too.
    const demoRole = Object.keys(DEMO_LOGIN_CREDENTIALS).find(role => {
      const credentials = DEMO_LOGIN_CREDENTIALS[role];
      const user = DEMO_USERS[role];
      return [user.email.toLowerCase(), ...credentials.aliases].includes(query);
    });
    if (demoRole) {
      const credentials = DEMO_LOGIN_CREDENTIALS[demoRole];
      if (credentials.password !== passwordPlain) {
        return { success: false, error: 'Incorrect password entered.' };
      }
      this.setActiveUser(DEMO_USERS[demoRole]);
      return { success: true, user: DEMO_USERS[demoRole] };
    }

    // Student records without a registered credential are not login accounts.
    const matchedStudent = this.students.find(
      s => s.email.toLowerCase() === query || s.studentId.toLowerCase() === query || s.name.toLowerCase() === query
    );
    if (matchedStudent) return { success: false, error: 'No sign-in account is registered for this student. Please register first.' };

    return {
      success: false,
      error: 'No account found with this Email or Student ID. Please check your spelling or register a new student account.'
    };
  }

  public getStudents(): Student[] {
    return [...this.students];
  }

  public addStudents(newStudents: Student[]): Student[] {
    if (!newStudents || newStudents.length === 0) return [];

    const existingIds = new Set(this.students.map(s => s.studentId.toUpperCase()));
    const uniqueToIngest = newStudents.filter(s => !existingIds.has(s.studentId.toUpperCase()));

    if (uniqueToIngest.length === 0) return [];

    uniqueToIngest.forEach(s => {
      // Ensure course schedule & cohort are set
      if (!s.currentCourses || s.currentCourses.length === 0) {
        s.currentCourses = getCoursesForStudent(s.department, s.semester, s.academic?.currentGPA || 3.0, s.attendance?.overallRate || 90);
      }
      if (!s.cohort) {
        s.cohort = getCohortForSemester(s.semester);
      }

      // Auto-register so user can immediately sign in with this imported student
      const cleanEmail = s.email.trim().toLowerCase();
      if (!this.registeredUsers.some(u => u.email.toLowerCase() === cleanEmail || u.studentId?.toLowerCase() === s.studentId.toLowerCase())) {
        this.registeredUsers.push({
          id: s.id,
          name: s.name,
          email: cleanEmail,
          role: 'student',
          department: s.department,
          studentId: s.studentId,
          avatar: s.avatar,
          title: `${s.department} Undergraduate Scholar`,
          password: 'student123Password!'
        });
      }

      // Create alert notices for high or critical risk students
      if (s.predictions.riskLevel === 'critical' || s.predictions.riskLevel === 'high') {
        this.alerts.unshift({
          id: `alt-imp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          studentId: s.studentId,
          studentName: s.name,
          department: s.department,
          severity: s.predictions.riskLevel === 'critical' ? 'critical' : 'warning',
          type: s.attendance.overallRate < 70 ? 'attendance_drop' : 'risk_spike',
          title: `Imported Cohort Risk Notice: ${s.name}`,
          message: `Batch imported student ${s.name} (${s.studentId}) flagged with ${s.predictions.dropoutRiskScore}% dropout risk score in ${s.department}.`,
          timestamp: 'Just now',
          status: 'unresolved'
        });
      }
    });

    this.students.unshift(...uniqueToIngest);
    this.saveToStorage('edupredict_students', this.students);
    this.saveToStorage('edupredict_registered_users', this.registeredUsers);
    this.saveToStorage('edupredict_alerts', this.alerts);

    // Log student record update event
    this.telemetry.unshift({
      id: `tel-${Date.now()}`,
      timestamp: 'Just now',
      studentId: uniqueToIngest[0].studentId,
      studentName: `${uniqueToIngest.length} Cohort Students`,
      eventType: 'quiz_submission',
      detail: `Bulk ingested ${uniqueToIngest.length} student records into secure campus cloud store.`,
      riskDelta: -0.5
    });

    this.notify();
    this.syncToBackend();
    return uniqueToIngest;
  }

  public getCSVTemplateContent(): string {
    return [
      'StudentID,Name,Email,Department,Semester,AttendanceRate,CurrentGPA,MidtermsAvg,LMSWeeklyHours,DropoutRisk,RiskLevel,Cluster,Anomaly',
      'STU-2026-2001,Zainab Al-Mansoor,zainab.almansoor@university.edu,Business Administration,6,68,2.15,52,3.2,64,high,Struggling & Disengaged,NO',
      'STU-2026-2002,Bilal Ahmed,bilal.khan@university.edu,Computer Science,3,95,2.00,40,3.0,48,medium,Struggling Despite Attendance,YES',
      'STU-2026-2003,Ayesha Siddiqui,ayesha.siddiqui@university.edu,Data Science,4,92,3.68,88,12.4,6,low,Consistent High Achiever,NO'
    ].join('\n');
  }

  public parseStudentCSV(csvContent: string): {
    rawLineNumber: number;
    student: Student;
    status: 'valid' | 'duplicate' | 'error';
    message: string;
  }[] {
    // Strip UTF-8 BOM if present from Excel export
    const cleanCsv = csvContent.replace(/^\uFEFF/, '');

    // Detect delimiter (comma, semicolon, or tab) from header line
    const firstLine = cleanCsv.split(/\r?\n/)[0] || '';
    const delimiter = firstLine.includes('\t') && !firstLine.includes(',')
      ? '\t'
      : firstLine.includes(';') && !firstLine.includes(',')
      ? ';'
      : ',';

    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result.map(s => s.replace(/^"|"$/g, '').trim());
    };

    const rawLines = cleanCsv.split(/\r?\n/);
    if (rawLines.length < 2) return [];

    const headers = parseCSVLine(rawLines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

    const getCol = (cols: string[], possibleNames: string[]): string => {
      // First try exact match on normalized header
      for (const name of possibleNames) {
        const exactIdx = headers.findIndex(h => h === name);
        if (exactIdx !== -1 && cols[exactIdx] !== undefined) {
          return cols[exactIdx].trim();
        }
      }
      // Fallback to substring match
      for (const name of possibleNames) {
        const idx = headers.findIndex(h => h.includes(name));
        if (idx !== -1 && cols[idx] !== undefined) {
          return cols[idx].trim();
        }
      }
      return '';
    };

    const existingStudentIds = new Set(this.students.map(s => s.studentId.toUpperCase()));
    const existingEmails = new Set(this.students.map(s => s.email.toLowerCase()));
    const seenInCSV = new Set<string>();
    const previews: {
      rawLineNumber: number;
      student: Student;
      status: 'valid' | 'duplicate' | 'error';
      message: string;
    }[] = [];

    let autoIdCounter = 2001 + this.students.length;

    for (let i = 1; i < rawLines.length; i++) {
      const line = rawLines[i];
      if (!line || !line.trim()) continue;

      const cols = parseCSVLine(line);
      // Skip blank Excel rows that only contain empty commas (e.g. ",,,,,,,,,,,,")
      if (cols.every(c => !c || c.trim() === '')) {
        continue;
      }

      const rawStudentId = getCol(cols, ['studentid', 'student_id', 'id', 'rollno', 'regno']);
      let name = getCol(cols, ['name', 'studentname', 'fullname', 'student']);
      const rawEmail = getCol(cols, ['email', 'emailaddress', 'mail']);

      // If name is blank but email is provided, derive a readable name from email prefix
      if (!name && rawEmail && rawEmail.includes('@')) {
        name = rawEmail
          .split('@')[0]
          .replace(/[._-]+/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
      }

      const department = getCol(cols, ['department', 'dept', 'program', 'faculty', 'major']) || 'Computer Science';
      const parsedSem = parseInt(getCol(cols, ['semester', 'sem', 'term', 'year']), 10);
      const semester = !isNaN(parsedSem) && parsedSem >= 1 && parsedSem <= 12 ? parsedSem : 5;

      const parsedAtt = parseFloat(getCol(cols, ['attendancerate', 'attendance_rate', 'attendance', 'att']));
      const attendanceRate = !isNaN(parsedAtt) ? Math.min(100, Math.max(0, parsedAtt)) : 82;

      const parsedGpa = parseFloat(getCol(cols, ['currentgpa', 'current_gpa', 'gpa', 'cgpa']));
      const currentGPA = !isNaN(parsedGpa) ? Math.min(4.0, Math.max(0, parsedGpa)) : 3.1;

      const parsedMid = parseFloat(getCol(cols, ['midtermsavg', 'midterms_avg', 'midterms', 'midterm']));
      const midtermsAvg = !isNaN(parsedMid) ? Math.min(100, Math.max(0, parsedMid)) : 75;

      const parsedLms = parseFloat(getCol(cols, ['lmsweeklyhours', 'lms_weekly_hours', 'lmshours', 'lms']));
      const lmsWeeklyHours = !isNaN(parsedLms) ? Math.max(0, parsedLms) : 8.5;

      // Auto-generate a unique StudentID if Column A (StudentID) was left blank in Excel,
      // OR if the provided StudentID is already used by another student
      let studentId = rawStudentId ? rawStudentId.toUpperCase() : '';
      let isAutoAssignedId = false;

      const isSameExistingPerson = rawEmail && existingEmails.has(rawEmail.toLowerCase());
      if ((!studentId || existingStudentIds.has(studentId) || seenInCSV.has(studentId)) && name && !isSameExistingPerson) {
        do {
          studentId = `STU-2026-${autoIdCounter++}`;
        } while (existingStudentIds.has(studentId) || seenInCSV.has(studentId));
        isAutoAssignedId = true;
      }

      if (!name) {
        previews.push({
          rawLineNumber: i + 1,
          student: {
            id: `stu-err-${i}`,
            studentId: studentId || `ROW-${i + 1}`,
            name: `Missing Name (Row ${i + 1})`,
            email: rawEmail || 'missing@university.edu',
            department,
            program: `B.S. in ${department}`,
            semester,
            cohort: 'Class of 2026',
            avatar: '',
            demographics: { gender: 'Other', firstGenStudent: false, financialAidStatus: 'None', highSchoolGPA: 3.0 },
            academic: { currentGPA, cumulativeGPA: currentGPA, creditHoursAttempted: 0, creditHoursCompleted: 0, midtermsAverage: midtermsAvg, assignmentsScore: 0, finalExamForecast: 0, recentGradeTrend: 'stable' },
            attendance: { overallRate: attendanceRate, totalClasses: 48, absentDays: 0, consecutiveAbsences: 0, trend: 'stable', weeklyAttendanceHistory: [] },
            lms: { weeklyHours: lmsWeeklyHours, videoCompletionRate: 0, quizAttemptsAvg: 0, forumPostsCount: 0, lastLoginDaysAgo: 0, assignmentSubmissionOnTimeRate: 0, activityIndexScore: 0, weeklyActivityHistory: [] },
            predictions: { dropoutRiskScore: 0, riskLevel: 'low', riskKeyFactors: [], predictedGPA: currentGPA, predictedGraduationRate: 0, anomalyDetected: false, clusterId: 0, clusterName: 'Consistent High Achiever', clusterDistance: 0 },
            interventions: [],
            currentCourses: []
          },
          status: 'error',
          message: `Row ${i + 1}: Missing student Name.`
        });
        continue;
      }

      const email = rawEmail || `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@university.edu`;

      const academic = {
        currentGPA,
        cumulativeGPA: currentGPA,
        creditHoursAttempted: semester * 15,
        creditHoursCompleted: Math.max(0, (semester - 1) * 15),
        midtermsAverage: midtermsAvg,
        assignmentsScore: Math.min(100, Math.round(midtermsAvg * 1.05)),
        finalExamForecast: Math.min(100, Math.round(currentGPA * 22 + 10)),
        recentGradeTrend: currentGPA >= 3.0 ? ('improving' as const) : currentGPA >= 2.2 ? ('stable' as const) : ('declining' as const)
      };

      const attendance = {
        overallRate: attendanceRate,
        totalClasses: 48,
        absentDays: Math.round((100 - attendanceRate) * 0.48),
        consecutiveAbsences: attendanceRate < 70 ? 4 : attendanceRate < 85 ? 1 : 0,
        trend: attendanceRate >= 85 ? ('improving' as const) : attendanceRate >= 75 ? ('stable' as const) : ('declining' as const),
        weeklyAttendanceHistory: [
          Math.max(0, attendanceRate - 2),
          Math.max(0, attendanceRate - 1),
          attendanceRate,
          Math.min(100, attendanceRate + 1),
          attendanceRate
        ]
      };

      const lms = {
        weeklyHours: lmsWeeklyHours,
        videoCompletionRate: Math.min(100, Math.round(lmsWeeklyHours * 8 + 10)),
        quizAttemptsAvg: 1.8,
        forumPostsCount: Math.round(lmsWeeklyHours * 1.5),
        lastLoginDaysAgo: attendanceRate < 70 ? 4 : 0,
        assignmentSubmissionOnTimeRate: Math.min(100, Math.round(attendanceRate * 0.95)),
        activityIndexScore: Math.min(100, Math.round(lmsWeeklyHours * 7 + 20)),
        weeklyActivityHistory: [70, 75, 80, 82, 85]
      };

      const predictions = calculatePredictiveMetrics(academic, attendance, lms);

      const studentObj: Student = {
        id: `stu-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
        studentId,
        name,
        email,
        department,
        program: `B.S. in ${department}`,
        semester,
        cohort: `Class of ${2026 + Math.ceil((8 - semester) / 2)}`,
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        demographics: {
          gender: i % 2 === 0 ? 'Female' : 'Male',
          firstGenStudent: i % 3 === 0,
          financialAidStatus: i % 2 === 0 ? 'Full' : 'Partial',
          highSchoolGPA: Math.min(4.0, Number((currentGPA + 0.3).toFixed(2)))
        },
        academic,
        attendance,
        lms,
        predictions,
        interventions: [],
        currentCourses: getCoursesForStudent(department, semester, currentGPA, attendanceRate)
      };

      let status: 'valid' | 'duplicate' | 'error' = 'valid';
      let message = isAutoAssignedId ? `Auto-assigned new ID: ${studentId}` : 'Parsed successfully';

      if (existingStudentIds.has(studentId) || seenInCSV.has(studentId) || isSameExistingPerson) {
        status = 'duplicate';
        message = `Student ${studentId} (${email}) already exists in the institutional registry or is repeated in CSV.`;
      } else {
        seenInCSV.add(studentId);
      }

      previews.push({
        rawLineNumber: i + 1,
        student: studentObj,
        status,
        message
      });
    }

    return previews;
  }

  public getStudentById(idOrStudentId: string): Student | undefined {
    return this.students.find(s => s.id === idOrStudentId || s.studentId === idOrStudentId);
  }

  public getCourses(): Course[] {
    return [...this.courses];
  }

  public getHdfsNodes(): HdfsNode[] {
    return [...this.hdfsNodes];
  }

  public getHdfsFiles(): HdfsFile[] {
    return [...this.hdfsFiles];
  }

  public getMapReduceJobs(): MapReduceJob[] {
    return [...this.mapReduceJobs];
  }

  public getAlerts(): Alert[] {
    return [...this.alerts];
  }

  public getTelemetry(): TelemetryEvent[] {
    return [...this.telemetry];
  }

  public addIntervention(studentId: string, intervention: Omit<Intervention, 'id' | 'timestamp'>) {
    const student = this.students.find(s => s.id === studentId || s.studentId === studentId);
    if (!student) return;

    const newIntervention: Intervention = {
      ...intervention,
      id: `int-${Date.now()}`,
      timestamp: new Date().toISOString().split('T')[0]
    };

    student.interventions.unshift(newIntervention);

    // Logging an intervention gives positive predictive lift
    student.attendance.overallRate = Math.min(100, student.attendance.overallRate + 3);
    student.predictions = calculatePredictiveMetrics(student.academic, student.attendance, student.lms);

    this.saveToStorage('edupredict_students', this.students);
    this.notify();
    this.syncToBackend();
  }

  public updateStudentMetrics(
    studentId: string,
    updates: {
      attendanceRate?: number;
      absentDays?: number;
      currentGPA?: number;
      midtermsAverage?: number;
      weeklyHours?: number;
      assignmentSubmissionOnTimeRate?: number;
      videoCompletionRate?: number;
    }
  ) {
    const student = this.students.find(s => s.id === studentId || s.studentId === studentId);
    if (!student) return;

    if (updates.attendanceRate !== undefined) {
      student.attendance.overallRate = updates.attendanceRate;
      if (student.attendance.weeklyAttendanceHistory && student.attendance.weeklyAttendanceHistory.length > 0) {
        student.attendance.weeklyAttendanceHistory[student.attendance.weeklyAttendanceHistory.length - 1] = updates.attendanceRate;
      }
    }
    if (updates.absentDays !== undefined) {
      student.attendance.absentDays = updates.absentDays;
    }
    if (updates.currentGPA !== undefined) {
      student.academic.currentGPA = updates.currentGPA;
    }
    if (updates.midtermsAverage !== undefined) {
      student.academic.midtermsAverage = updates.midtermsAverage;
    }
    if (updates.weeklyHours !== undefined) {
      student.lms.weeklyHours = updates.weeklyHours;
      if (student.lms.weeklyActivityHistory && student.lms.weeklyActivityHistory.length > 0) {
        student.lms.weeklyActivityHistory[student.lms.weeklyActivityHistory.length - 1] = updates.weeklyHours;
      }
    }
    if (updates.assignmentSubmissionOnTimeRate !== undefined) {
      student.lms.assignmentSubmissionOnTimeRate = updates.assignmentSubmissionOnTimeRate;
    }
    if (updates.videoCompletionRate !== undefined) {
      student.lms.videoCompletionRate = updates.videoCompletionRate;
    }

    // Recalculate predictive metrics via ML Engine
    student.predictions = calculatePredictiveMetrics(student.academic, student.attendance, student.lms);

    this.saveToStorage('edupredict_students', this.students);
    this.notify();
    this.syncToBackend();
    return student;
  }

  public updateAlertStatus(alertId: string, status: Alert['status'], assignee?: string) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = status;
      if (assignee) alert.assignee = assignee;
      this.saveToStorage('edupredict_alerts', this.alerts);
      this.notify();
    }
  }

  public dismissAlert(alertId: string) {
    this.alerts = this.alerts.filter(a => a.id !== alertId);
    this.saveToStorage('edupredict_alerts', this.alerts);
    this.notify();
  }

  public createAlert(alertData: Omit<Alert, 'id' | 'timestamp' | 'status'>) {
    const newAlert: Alert = {
      ...alertData,
      id: `alt-${Date.now()}`,
      timestamp: 'Just now',
      status: 'unresolved'
    };
    this.alerts.unshift(newAlert);
    this.saveToStorage('edupredict_alerts', this.alerts);
    this.notify();
  }

  public triggerMapReduceJob(jobName: string, engine: MapReduceJob['engine'] = 'Apache Spark 3.5') {
    const newJob: MapReduceJob = {
      id: `job_${Date.now().toString().slice(-8)}`,
      name: jobName,
      engine,
      status: 'running',
      progressMap: 10,
      progressReduce: 0,
      startTime: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      recordsProcessed: 125000,
      durationSeconds: 1,
      clusterCpuUsage: 82,
      stages: [
        { name: 'Reading Student Records from Drives', status: 'active', timeMs: 4200 },
        { name: 'Grouping Data & Calculating Trends', status: 'pending', timeMs: 0 },
        { name: 'Updating Student Risk & GPA Forecasts', status: 'pending', timeMs: 0 },
        { name: 'Writing Updated Reports to Storage', status: 'pending', timeMs: 0 }
      ]
    };

    this.mapReduceJobs.unshift(newJob);
    this.notify();

    // Progress simulation
    let step = 1;
    const interval = setInterval(() => {
      step++;
      if (step === 2) {
        newJob.progressMap = 55;
        newJob.stages[0].status = 'done';
        newJob.stages[1].status = 'active';
      } else if (step === 3) {
        newJob.progressMap = 100;
        newJob.progressReduce = 45;
        newJob.stages[1].status = 'done';
        newJob.stages[2].status = 'active';
      } else if (step === 4) {
        newJob.progressReduce = 88;
        newJob.stages[2].status = 'done';
        newJob.stages[3].status = 'active';
      } else if (step >= 5) {
        newJob.progressReduce = 100;
        newJob.status = 'completed';
        newJob.stages[3].status = 'done';
        newJob.finishTime = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
        newJob.durationSeconds = 18;
        clearInterval(interval);
      }
      this.notify();
    }, 1500);
  }

  public ingestNewDataset(name: string, recordsCount: number, format: HdfsFile['format'] = 'parquet') {
    const newFile: HdfsFile = {
      path: `/user/edupredict/raw/${name.toLowerCase().replace(/\s+/g, '_')}.${format}`,
      name: `${name.toLowerCase().replace(/\s+/g, '_')}.${format}`,
      sizeMB: Number((recordsCount * 0.0055).toFixed(1)),
      replication: 3,
      blockCount: Math.max(1, Math.ceil(recordsCount / 30000)),
      modificationDate: 'Just now',
      owner: this.activeUser.name.toLowerCase().replace(/[^a-z]/g, ''),
      group: 'supergroup',
      permissions: '-rwxr-xr-x',
      format,
      recordsEstimate: recordsCount
    };

    this.hdfsFiles.unshift(newFile);
    this.notify();
    return newFile;
  }

  // Simulated Apache Impala / Hive SQL query execution
  public executeSql(sql: string): { columns: string[]; rows: Record<string, unknown>[]; executionTimeMs: number } {
    const start = performance.now();
    const query = sql.trim().toLowerCase();

    // Default return student fields
    let filtered = [...this.students];

    if (query.includes('where')) {
      if (query.includes('risk') || query.includes('dropout')) {
        filtered = filtered.filter(s => s.predictions.dropoutRiskScore > 50);
      } else if (query.includes('attendance < 75') || query.includes('attendance < 70')) {
        filtered = filtered.filter(s => s.attendance.overallRate < 75);
      } else if (query.includes('gpa < 2.5') || query.includes('gpa < 2.0')) {
        filtered = filtered.filter(s => s.academic.currentGPA < 2.5);
      } else if (query.includes('anomaly')) {
        filtered = filtered.filter(s => s.predictions.anomalyDetected);
      } else if (query.includes('cluster = 0') || query.includes('disengaged')) {
        filtered = filtered.filter(s => s.predictions.clusterId === 0);
      }
    }

    const rows = filtered.map(s => ({
      student_id: s.studentId,
      name: s.name,
      department: s.department,
      semester: s.semester,
      attendance_rate: `${s.attendance.overallRate}%`,
      current_gpa: s.academic.currentGPA,
      midterms_avg: `${s.academic.midtermsAverage}%`,
      lms_weekly_hours: `${s.lms.weeklyHours}h`,
      dropout_risk: `${s.predictions.dropoutRiskScore}%`,
      risk_level: s.predictions.riskLevel.toUpperCase(),
      cluster: s.predictions.clusterName,
      anomaly: s.predictions.anomalyDetected ? 'FLAGGED' : 'NORMAL'
    }));

    const executionTimeMs = Math.round(performance.now() - start + Math.random() * 45 + 15);
    const columns = rows.length > 0 ? Object.keys(rows[0]) : ['result'];

    return { columns, rows, executionTimeMs };
  }

  private startStreamingSimulation() {
    setInterval(() => {
      const randomStudent = this.students[Math.floor(Math.random() * this.students.length)];
      if (!randomStudent) return;

      const events: { type: TelemetryEvent['eventType']; detail: string; delta: number }[] = [
        {
          type: 'lms_video_watch',
          detail: `Watched 25 mins of lecture video in ${randomStudent.currentCourses[0]?.code || 'CS-401'}`,
          delta: -0.5
        },
        {
          type: 'quiz_submission',
          detail: `Completed weekly formative assessment with score ${Math.floor(Math.random() * 30 + 70)}%`,
          delta: -0.8
        },
        {
          type: 'attendance_checkin',
          detail: `RFID / biometric attendance verified in Lecture Hall 402`,
          delta: -0.4
        },
        {
          type: 'forum_post',
          detail: `Participated in peer code review discussion thread`,
          delta: -0.3
        },
        {
          type: 'assignment_upload',
          detail: `Submitted laboratory assignment report`,
          delta: -0.7
        }
      ];

      const chosen = events[Math.floor(Math.random() * events.length)];
      const newTelemetry: TelemetryEvent = {
        id: `tel-${Date.now()}`,
        timestamp: 'Just now',
        studentId: randomStudent.studentId,
        studentName: randomStudent.name,
        eventType: chosen.type,
        detail: chosen.detail,
        riskDelta: chosen.delta
      };

      this.telemetry.unshift(newTelemetry);
      if (this.telemetry.length > 15) {
        this.telemetry.pop();
      }

      this.notify();
    }, 12000);
  }

  // ==========================================
  // MONGODB BACKEND SYNCHRONIZATION
  // ==========================================

  public async syncToBackend(): Promise<{ success: boolean; message?: string; mongoConnected?: boolean }> {
    try {
      const payload = {
        students: this.students,
        users: this.registeredUsers,
        courses: this.courses,
        alerts: this.alerts
      };
      const res = await fetch('/api/sync/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch {
      return { success: false, mongoConnected: false, message: 'Server or MongoDB offline' };
    }
  }

  public async uploadCsvDataset(options: {
    fileName: string;
    rawCsv?: string;
    rows?: any[];
    columns?: string[];
    datasetName?: string;
    format?: HdfsFile['format'];
  }): Promise<{ success: boolean; message: string; mongoConnected?: boolean; recordCount?: number }> {
    const recordCount = options.rows?.length || (options.rawCsv ? options.rawCsv.trim().split(/\r?\n/).length - 1 : 100);

    // 1. Ingest into active HDFS storage ledger
    this.ingestNewDataset(options.datasetName || options.fileName, Math.max(1, recordCount), options.format || 'csv');

    // 1b. If rawCsv contains student records, automatically add valid new students to the live Student Registry
    let addedStudentsCount = 0;
    if (options.rawCsv) {
      const parsed = this.parseStudentCSV(options.rawCsv);
      const validStudents = parsed.filter(p => p.status === 'valid').map(p => p.student);
      if (validStudents.length > 0) {
        this.students = [...validStudents, ...this.students];
        addedStudentsCount = validStudents.length;
        this.saveToStorage('edupredict_students', this.students);
        this.notify();
        this.syncToBackend();
      }
    }

    // 2. Post to MongoDB Backend endpoint
    try {
      const res = await fetch('/api/upload/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: options.fileName,
          rawCsv: options.rawCsv,
          rows: options.rows,
          columns: options.columns,
          datasetName: options.datasetName,
          format: options.format || 'csv',
          recordCount
        })
      });
      const data = await res.json();
      return data;
    } catch {
      return {
        success: true,
        mongoConnected: false,
        message: `Dataset processed (${recordCount} records${addedStudentsCount > 0 ? `, ${addedStudentsCount} new students added to registry` : ''}).`
      };
    }
  }
}

export const dataService = new EduPredictDataService();
