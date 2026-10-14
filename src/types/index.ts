export type UserRole = 'admin' | 'faculty' | 'student' | 'analyst';
export type ThemeMode = 'academic' | 'hadoop';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar: string;
  studentId?: string;
  title?: string;
}

export interface StudentDemographics {
  gender: 'Female' | 'Male' | 'Non-binary' | 'Other';
  firstGenStudent: boolean;
  financialAidStatus: 'Full' | 'Partial' | 'None';
  highSchoolGPA: number;
}

export interface AcademicMetrics {
  currentGPA: number;
  cumulativeGPA: number;
  creditHoursAttempted: number;
  creditHoursCompleted: number;
  midtermsAverage: number;
  assignmentsScore: number;
  finalExamForecast: number;
  recentGradeTrend: 'improving' | 'stable' | 'declining';
}

export interface AttendanceMetrics {
  overallRate: number; // 0 to 100%
  totalClasses: number;
  absentDays: number;
  consecutiveAbsences: number;
  trend: 'improving' | 'stable' | 'declining';
  weeklyAttendanceHistory: number[]; // last 8 weeks %
}

export interface LMSEngagementMetrics {
  weeklyHours: number;
  videoCompletionRate: number; // 0 to 100%
  quizAttemptsAvg: number;
  forumPostsCount: number;
  lastLoginDaysAgo: number;
  assignmentSubmissionOnTimeRate: number; // 0 to 100%
  activityIndexScore: number; // 0 to 100
  weeklyActivityHistory: number[]; // last 8 weeks index
}

export interface RiskFactor {
  factor: string;
  impact: 'negative' | 'positive';
  weight: number; // percentage impact
  description: string;
}

export interface PredictiveMetrics {
  dropoutRiskScore: number; // 0 to 100%
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  riskKeyFactors: RiskFactor[];
  predictedGPA: number;
  predictedGraduationRate: number; // 0 to 100%
  anomalyDetected: boolean;
  anomalyReason?: string;
  clusterId: number; // 0, 1, 2, 3
  clusterName: 'Struggling & Disengaged' | 'Diligent but Struggling' | 'Passive High-Potential' | 'Consistent High Achiever';
  clusterDistance: number;
}

export interface Intervention {
  id: string;
  timestamp: string;
  studentId: string;
  studentName: string;
  counselor: string;
  type: 'academic_counseling' | 'peer_tutoring' | 'attendance_warning' | 'faculty_mentoring' | 'financial_support';
  notes: string;
  outcomeStatus: 'pending' | 'in_progress' | 'successful' | 'unsuccessful';
  followUpDate?: string;
}

export interface Student {
  id: string;
  studentId: string; // e.g. STU-2024-0891
  name: string;
  email: string;
  department: string;
  program: string;
  semester: number;
  cohort: string;
  avatar: string;
  demographics: StudentDemographics;
  academic: AcademicMetrics;
  attendance: AttendanceMetrics;
  lms: LMSEngagementMetrics;
  predictions: PredictiveMetrics;
  interventions: Intervention[];
  currentCourses: { code: string; name: string; gradeCurrent: string; attendance: number }[];
}

export interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  credits: number;
  enrolledCount: number;
  capacity: number;
  predictedDemandNextTerm: number;
  historicalDropRate: number;
  instructor: string;
  semester: string;
  difficultyRating: number; // 1 to 5
}

export interface HdfsNode {
  id: string;
  name: string;
  type: 'namenode' | 'datanode';
  status: 'healthy' | 'warning' | 'decommissioned';
  capacityGB: number;
  usedGB: number;
  blocksCount: number;
  ipAddress: string;
  rack: string;
  heartbeatAgoSec: number;
}

export interface HdfsFile {
  path: string;
  name: string;
  sizeMB: number;
  replication: number;
  blockCount: number;
  modificationDate: string;
  owner: string;
  group: string;
  permissions: string;
  format: 'parquet' | 'csv' | 'orc' | 'json';
  recordsEstimate: number;
}

export interface MapReduceJob {
  id: string;
  name: string;
  engine: 'MapReduce v2' | 'Apache Spark 3.5' | 'Apache Impala';
  status: 'running' | 'completed' | 'queued' | 'failed';
  progressMap: number; // 0 to 100
  progressReduce: number; // 0 to 100
  startTime: string;
  finishTime?: string;
  recordsProcessed: number;
  durationSeconds: number;
  clusterCpuUsage: number; // %
  stages: { name: string; status: 'done' | 'active' | 'pending'; timeMs: number }[];
}

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  studentId: string;
  studentName: string;
  eventType: 'lms_video_watch' | 'quiz_submission' | 'attendance_checkin' | 'forum_post' | 'assignment_upload' | 'login_burst';
  detail: string;
  riskDelta: number; // e.g. -2.5% risk reduction or +4.0% risk increase
}

export interface Alert {
  id: string;
  timestamp: string;
  studentId: string;
  studentName: string;
  department: string;
  severity: 'info' | 'warning' | 'critical';
  type: 'attendance_drop' | 'risk_spike' | 'quiz_failure' | 'anomaly_flag' | 'lms_inactivity';
  title: string;
  message: string;
  status: 'unresolved' | 'acknowledged' | 'resolved';
  assignee?: string;
}

export interface ModelEvaluation {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocauc: number;
  confusionMatrix: {
    tp: number;
    fp: number;
    tn: number;
    fn: number;
  };
  features: { name: string; weight: number; correlation: number }[];
}

export interface SupportTicket {
  id: string;
  timestamp: string;
  senderName: string;
  senderEmail: string;
  role: UserRole;
  category: 'Model Query' | 'Data Discrepancy' | 'HDFS Sync' | 'Intervention Workflow' | 'Academic Guidance';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
}
