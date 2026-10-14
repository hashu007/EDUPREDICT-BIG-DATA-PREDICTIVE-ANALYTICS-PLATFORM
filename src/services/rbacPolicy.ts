import { UserRole } from '../types';
import { NavTab } from '../components/navigation/Sidebar';

export interface RoleConfig {
  allowedTabs: NavTab[];
  defaultTab: NavTab;
  roleTitle: string;
  badgeLabel: string;
  badgeColor: string;
  canSearchPeerRecords: boolean;
  canViewClusterStatus: boolean;
  canViewArchitectureWhitepaper: boolean;
  canViewAlerts: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RoleConfig> = {
  admin: {
    // Unrestricted master access to all platform capabilities
    allowedTabs: [
      'overview',
      'students',
      'management_analytics',
      'alerts',
      'hdfs',
      'mapreduce',
      'impala',
      'analytics',
      'documentation',
      'support'
    ],
    defaultTab: 'overview',
    roleTitle: 'Dean & Academic Administration',
    badgeLabel: 'Administrator',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/90 dark:text-purple-200 dark:border-purple-700',
    canSearchPeerRecords: true,
    canViewClusterStatus: true,
    canViewArchitectureWhitepaper: true,
    canViewAlerts: true
  },
  analyst: {
    allowedTabs: [
      'overview',
      'management_analytics',
      'analytics',
      'impala',
      'mapreduce',
      'hdfs',
      'students',
      'alerts',
      'documentation',
      'support'
    ],
    defaultTab: 'overview',
    roleTitle: 'Big Data Analyst & ML Engineer',
    badgeLabel: 'Data Scientist',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/90 dark:text-amber-200 dark:border-amber-700',
    canSearchPeerRecords: true,
    canViewClusterStatus: true,
    canViewArchitectureWhitepaper: true,
    canViewAlerts: true
  },
  faculty: {
    allowedTabs: ['overview', 'management_analytics', 'students', 'alerts', 'support'],
    defaultTab: 'overview',
    roleTitle: 'Departmental Faculty & Instructor',
    badgeLabel: 'Faculty',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/90 dark:text-blue-200 dark:border-blue-700',
    canSearchPeerRecords: true,
    canViewClusterStatus: false,
    canViewArchitectureWhitepaper: false,
    canViewAlerts: true
  },
  student: {
    allowedTabs: ['overview', 'support'],
    defaultTab: 'overview',
    roleTitle: 'Student Self-Service',
    badgeLabel: 'Student',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/90 dark:text-emerald-200 dark:border-emerald-700',
    canSearchPeerRecords: false,
    canViewClusterStatus: false,
    canViewArchitectureWhitepaper: false,
    canViewAlerts: false
  }
};

export const hasTabPermission = (role: UserRole, tab: NavTab): boolean => {
  const config = ROLE_PERMISSIONS[role];
  if (!config) return false;
  return config.allowedTabs.includes(tab);
};
