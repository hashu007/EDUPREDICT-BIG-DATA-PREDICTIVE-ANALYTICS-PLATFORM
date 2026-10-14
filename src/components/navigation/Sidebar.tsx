import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  HardDrive,
  Cpu,
  BrainCircuit,
  Database,
  Bell,
  BookOpen,
  LifeBuoy,
  ChevronRight,
  ShieldAlert,
  Server,
  Lock,
  UserCheck,
  X,
  LogOut,
  Activity,
  Sun,
  Moon,
  FileText,
  ChevronDown,
  ShieldCheck,
  Filter
} from 'lucide-react';
import { UserRole, ThemeMode, User, Alert } from '../../types';
import { hasTabPermission, ROLE_PERMISSIONS } from '../../services/rbacPolicy';
import { DEMO_USERS } from '../../services/dataService';

export type NavTab =
  | 'overview'
  | 'students'
  | 'management_analytics'
  | 'hdfs'
  | 'mapreduce'
  | 'analytics'
  | 'impala'
  | 'alerts'
  | 'documentation'
  | 'support';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  userRole: UserRole;
  unreadAlertsCount: number;
  criticalStudentsCount: number;
  theme: ThemeMode;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onLogout?: () => void;
  activeUser?: User;
  onSwitchRole?: (role: string) => void;
  alerts?: Alert[];
  onOpenAlerts?: () => void;
  onOpenReport?: () => void;
  onToggleTheme?: (theme: ThemeMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  unreadAlertsCount,
  criticalStudentsCount,
  theme,
  isOpenMobile = false,
  onCloseMobile,
  onLogout,
  activeUser,
  onSwitchRole,
  alerts = [],
  onOpenAlerts,
  onOpenReport,
  onToggleTheme
}) => {
  const isAcademic = theme === 'academic';
  const [mobileRoleDropdownOpen, setMobileRoleDropdownOpen] = useState(false);

  const canViewAlerts = userRole === 'admin' || userRole === 'faculty';
  const canViewArchitecture = userRole === 'admin' || userRole === 'analyst';

  const sections: {
    title: string;
    items: {
      id: NavTab;
      label: string;
      code: string;
      icon: React.ComponentType<{ className?: string }>;
      badge?: string | number;
      badgeColor?: string;
    }[];
  }[] = [
    {
      title: 'Core Institutional Portals',
      items: [
        {
          id: 'overview',
          label:
            userRole === 'student'
              ? 'Student Academic Pathway'
              : userRole === 'faculty'
              ? 'Faculty Academic Roster'
              : userRole === 'analyst'
              ? 'Institutional Intelligence'
              : 'Dean & Chancellor Cockpit',
          code: 'PORTAL',
          icon: LayoutDashboard
        },
        {
          id: 'students',
          label: 'Student Cohort Directory',
          code: 'REGISTRY',
          icon: Users,
          badge: criticalStudentsCount > 0 ? `${criticalStudentsCount} at risk` : undefined,
          badgeColor: 'bg-red-50 text-red-700 border border-red-200'
        },
        {
          id: 'alerts',
          label: 'Early Warning Notices',
          code: 'ALERTS',
          icon: Bell,
          badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined,
          badgeColor: 'bg-amber-50 text-amber-700 border border-amber-200'
        }
      ]
    },
    {
      title: 'Campus Storage & Processing',
      items: [
        {
          id: 'hdfs',
          label: 'Campus Cloud Storage',
          code: 'STORAGE',
          icon: HardDrive
        },
        {
          id: 'mapreduce',
          label: 'Data Processing Engine',
          code: 'PROCESS',
          icon: Cpu
        },
        {
          id: 'impala',
          label: 'Student Record Finder',
          code: 'SEARCH',
          icon: Database
        }
      ]
    },
    {
      title: 'Predictive Intelligence',
      items: [
        {
          id: 'management_analytics',
          label: 'Multi-Filter Analytics Studio',
          code: 'FILTERS',
          icon: Filter
        },
        {
          id: 'analytics',
          label: 'Grade & Retention Predictor',
          code: 'PREDICT',
          icon: BrainCircuit
        }
      ]
    },
    {
      title: 'Guides & Support',
      items: [
        {
          id: 'documentation',
          label: 'How It Works (System Guide)',
          code: 'GUIDE',
          icon: BookOpen
        },
        {
          id: 'support',
          label: 'Advising & Support Helpdesk',
          code: 'HELP',
          icon: LifeBuoy
        }
      ]
    }
  ];

  // Enforce strict Role-Based Access Control
  const allowedSections = sections
    .map((sec) => ({
      ...sec,
      items: sec.items.filter((item) => hasTabPermission(userRole, item.id))
    }))
    .filter((sec) => sec.items.length > 0);

  const roleConfig = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.admin;

  const handleTabClick = (tabId: NavTab) => {
    onSelectTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile/Tablet Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container: Persistent on desktop (`lg:`), Slide-over drawer on mobile/tablet (`<lg`) */}
      <aside
        className={`h-full flex flex-col select-none overflow-hidden transition-all duration-300 z-50 ${
          isOpenMobile
            ? 'fixed inset-y-0 left-0 w-80 max-w-[88vw] shadow-2xl translate-x-0'
            : 'fixed inset-y-0 left-0 w-80 max-w-[88vw] -translate-x-full lg:static lg:w-64 lg:shrink-0 lg:translate-x-0'
        } ${
          isAcademic
            ? 'bg-white border-r border-slate-200 text-slate-800'
            : 'bg-[#0b101b] border-r border-slate-800 text-slate-200'
        }`}
      >
        {/* Mobile Header with Close Button */}
        <div className={`p-3 border-b flex items-center justify-between lg:hidden ${
          isAcademic ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-900/80'
        }`}>
          <div className="flex items-center gap-2 font-display-academic font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Navigation & Controls
          </div>
          <button
            onClick={onCloseMobile}
            className={`p-1.5 rounded-lg border transition-colors ${
              isAcademic
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile/Tablet System Control Panel (Includes all top-right header options in mobile menu) */}
        <div className={`p-3 mx-3 mt-3 rounded-xl border space-y-2.5 lg:hidden ${
          isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
        }`}>
          {/* Active User Profile & Role Selector */}
          {activeUser && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
                Stakeholder Account
              </div>
              <div className="relative">
                <button
                  onClick={() => setMobileRoleDropdownOpen(!mobileRoleDropdownOpen)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg border text-xs transition-colors ${
                    isAcademic
                      ? 'bg-white border-slate-200 text-slate-900 shadow-2xs'
                      : 'bg-[#0d1526] border-slate-800 text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="text-left min-w-0">
                      <div className="font-bold text-xs truncate">{activeUser.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <span className="uppercase font-bold text-amber-500">{activeUser.role}</span>
                        <span>·</span>
                        <span className="truncate">{activeUser.title || activeUser.department}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                </button>

                {mobileRoleDropdownOpen && (
                  <div className={`mt-1.5 rounded-lg border shadow-xl p-1.5 space-y-1 ${
                    isAcademic ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}>
                    {Object.entries(DEMO_USERS).map(([roleKey, u]) => (
                      <button
                        key={roleKey}
                        onClick={() => {
                          if (onSwitchRole) onSwitchRole(roleKey);
                          setMobileRoleDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 p-1.5 rounded-md text-left text-xs ${
                          activeUser.role === roleKey
                            ? isAcademic ? 'bg-amber-50 font-bold text-amber-900' : 'bg-amber-950/80 font-bold text-amber-300'
                            : isAcademic ? 'hover:bg-slate-50' : 'hover:bg-slate-800'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-[11px] truncate">{u.name}</div>
                          <div className="text-[9px] uppercase font-mono text-amber-500">{u.role}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Header Options Bar (Theme, Specs, Alerts, Cluster Status) */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {/* Theme Toggle */}
            {onToggleTheme && (
              <button
                onClick={() => onToggleTheme(isAcademic ? 'hadoop' : 'academic')}
                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isAcademic
                    ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                    : 'bg-[#0d1526] hover:bg-slate-800 border-slate-800 text-slate-200'
                }`}
              >
                {isAcademic ? <Moon className="w-3.5 h-3.5 text-slate-600" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                <span className="font-mono">{isAcademic ? 'Midnight' : 'Daylight'}</span>
              </button>
            )}

            {/* System Specs */}
            {canViewArchitecture && onOpenReport && (
              <button
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                  onOpenReport();
                }}
                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  isAcademic
                    ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
                    : 'bg-amber-950/60 hover:bg-amber-900 border-amber-800 text-amber-300'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span>Specs</span>
              </button>
            )}

            {/* Early Warning Alerts */}
            {canViewAlerts && onOpenAlerts && (
              <button
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                  onOpenAlerts();
                }}
                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors relative ${
                  isAcademic
                    ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                    : 'bg-[#0d1526] hover:bg-slate-800 border-slate-800 text-slate-200'
                }`}
              >
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                <span>Alerts ({unreadAlertsCount})</span>
              </button>
            )}

            {/* Live Cluster Status */}
            <div className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-mono font-bold flex items-center justify-center gap-1 ${
              isAcademic ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
            }`}>
              <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
              <span>4 DRIVES ONLINE</span>
            </div>
          </div>
        </div>

        {/* Desktop Role Clearance Pill (Hidden on Mobile/Tablet since integrated in Control Panel above) */}
        <div className={`hidden lg:flex shrink-0 p-3 mx-3 mt-3 rounded-lg border text-[11px] items-center justify-between ${
          isAcademic
            ? 'bg-slate-50 border-slate-200 text-slate-700'
            : 'bg-slate-900/80 border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center gap-1.5 min-w-0">
            <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="font-semibold truncate">{roleConfig.roleTitle}</span>
          </div>
          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase shrink-0 border ${
            isAcademic
              ? userRole === 'admin' ? 'bg-purple-100 text-purple-900 border-purple-300'
                : userRole === 'analyst' ? 'bg-amber-100 text-amber-900 border-amber-300'
                : userRole === 'faculty' ? 'bg-blue-100 text-blue-900 border-blue-300'
                : 'bg-emerald-100 text-emerald-900 border-emerald-300'
              : userRole === 'admin' ? 'bg-purple-950/80 text-purple-300 border-purple-700/80'
                : userRole === 'analyst' ? 'bg-amber-950/80 text-amber-300 border-amber-700/80'
                : userRole === 'faculty' ? 'bg-blue-950/80 text-blue-300 border-blue-700/80'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
          }`}>
            {roleConfig.badgeLabel}
          </span>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto overscroll-contain">
          {allowedSections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              <div
                className={`px-3 text-[10px] font-mono uppercase tracking-wider font-bold ${
                  isAcademic ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {sec.title}
              </div>

              <div className="space-y-0.5 pt-1">
                {sec.items.map((item) => {
                  const isActive = currentTab === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                        isActive
                          ? isAcademic
                            ? 'bg-amber-50 text-amber-950 border border-amber-300 font-bold shadow-2xs'
                            : 'bg-amber-950/50 text-amber-200 border border-amber-800/80 font-bold'
                          : isAcademic
                          ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent font-medium'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive
                              ? isAcademic
                                ? 'text-amber-700'
                                : 'text-amber-400'
                              : isAcademic
                              ? 'text-slate-500'
                              : 'text-slate-400'
                          }`}
                        />
                        <span className="text-xs truncate">{item.label}</span>
                      </div>

                      {item.badge !== undefined ? (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      ) : (
                        isActive && (
                          <span
                            className={`text-[9px] font-mono px-1 py-0.2 rounded uppercase ${
                              isAcademic
                                ? 'bg-amber-100/60 text-amber-800 border border-amber-200'
                                : 'bg-slate-900 text-amber-400/80 border border-slate-800'
                            }`}
                          >
                            {item.code}
                          </span>
                        )
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Drawer Footer with Cluster Topology + Sign Out Action */}
        <div className={`p-3 border-t text-[10px] font-mono space-y-2 ${
          isAcademic ? 'border-slate-200 text-slate-500 bg-slate-50' : 'border-slate-800 text-slate-500 bg-[#070b13]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-emerald-500" />
              <span>Campus Storage</span>
            </span>
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              4 Drives Online
            </span>
          </div>

          {onLogout && (
            <button
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
                onLogout();
              }}
              className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border transition-colors font-sans text-xs font-semibold ${
                isAcademic
                  ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-800'
                  : 'bg-red-950/40 hover:bg-red-900/60 border-red-900/50 text-red-300'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock / Exit Session</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
