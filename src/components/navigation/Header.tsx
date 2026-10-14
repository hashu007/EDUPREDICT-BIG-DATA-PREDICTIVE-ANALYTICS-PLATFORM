import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  Sun,
  Moon,
  X,
  LogOut,
  Menu,
  FileText,
  Bell,
  ChevronDown,
  ShieldCheck,
  User as UserIcon
} from 'lucide-react';
import { User, Alert, ThemeMode } from '../../types';
import { DEMO_USERS, dataService } from '../../services/dataService';

interface HeaderProps {
  activeUser: User;
  onSwitchRole: (role: string) => void;
  alerts: Alert[];
  onOpenAlerts: () => void;
  onOpenReport: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectStudent: (studentId: string) => void;
  theme: ThemeMode;
  onToggleTheme: (t: ThemeMode) => void;
  onLogout: () => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeUser,
  onSwitchRole,
  alerts,
  onOpenAlerts,
  onOpenReport,
  searchQuery,
  onSearchChange,
  onSelectStudent,
  theme,
  onToggleTheme,
  onLogout,
  onToggleMobileMenu,
  isMobileMenuOpen
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const unreadAlertsCount = alerts.filter(a => a.status === 'unresolved').length;
  const isAcademic = theme === 'academic';

  const matchingStudents = searchQuery.trim().length > 0
    ? dataService.getStudents().filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.department.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  const isStudent = activeUser.role === 'student';
  const canViewAlerts = activeUser.role === 'admin' || activeUser.role === 'faculty';
  const canViewArchitecture = activeUser.role === 'admin' || activeUser.role === 'analyst';

  return (
    <header
      className={`sticky top-0 z-30 transition-colors border-b w-full px-3 sm:px-6 lg:px-8 py-2.5 ${
        isAcademic
          ? 'bg-white text-slate-900 border-slate-200 shadow-2xs'
          : 'bg-[#080d17] text-slate-100 border-slate-800'
      }`}
    >
      <div className="w-full flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Zone 1: Brand Title Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0 min-w-0">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              aria-label="Toggle Navigation Menu"
              className={`lg:hidden p-2 rounded-xl border transition-colors shrink-0 ${
                isAcademic
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          )}

          {/* Academic Seal Icon */}
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0 transition-all ${
              isAcademic
                ? 'bg-amber-700 text-amber-50'
                : 'bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black'
            }`}
          >
            <BookOpen className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-base sm:text-lg font-display-academic font-black tracking-wide truncate ${
                isAcademic ? 'text-slate-900' : 'text-white'
              }`}>
                EDUPREDICT
              </span>
              {/* Badge displays at lg (1024px+) for clean unclipped title on mobile & tablet */}
              <span className={`hidden lg:inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${
                isAcademic
                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
              }`}>
                Institutional Intelligence
              </span>
            </div>
            <div className={`hidden lg:block text-xs ${
              isAcademic ? 'text-slate-500' : 'text-slate-400'
            }`}>
              Student Retention & Academic Performance Workstation
            </div>
          </div>
        </div>

        {/* Zone 2: Desktop Global Search Input (1024px+) */}
        {!isStudent && (
          <div className="hidden lg:flex items-center flex-1 max-w-md relative mx-4">
            <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
              isAcademic ? 'text-slate-400' : 'text-slate-500'
            }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search student name, ID, or course..."
              className={`w-full rounded-xl pl-10 pr-9 py-2 text-xs transition-colors border focus:outline-none ${
                isAcademic
                  ? 'bg-slate-50 hover:bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-600 focus:ring-1 focus:ring-amber-500'
                  : 'bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                  isAcademic ? 'text-slate-400 hover:text-slate-600' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {searchQuery.trim().length > 0 && (
              <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-2xl py-2 z-50 overflow-hidden ${
                isAcademic
                  ? 'bg-white border-slate-200 text-slate-800 shadow-xl'
                  : 'bg-slate-900 border-slate-800 text-slate-100'
              }`}>
                <div className={`px-3 py-1.5 text-[10px] font-mono uppercase font-bold border-b ${
                  isAcademic ? 'text-slate-500 border-slate-100' : 'text-slate-400 border-slate-800'
                }`}>
                  Found {matchingStudents.length} matching scholars
                </div>
                {matchingStudents.length === 0 ? (
                  <div className="px-3 py-3 text-xs text-slate-400 italic text-center">
                    No matching student records found
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto">
                    {matchingStudents.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          onSelectStudent(s.id);
                          onSearchChange('');
                        }}
                        className={`w-full text-left px-3 py-2.5 transition-colors flex items-center justify-between gap-2 border-b last:border-0 ${
                          isAcademic
                            ? 'hover:bg-slate-50 border-slate-100 text-slate-800'
                            : 'hover:bg-slate-800/80 border-slate-800/40 text-slate-100'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate flex items-center gap-1.5">
                            <span>{s.name}</span>
                            <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400">
                              ({s.studentId})
                            </span>
                          </div>
                          <div className={`text-[11px] truncate ${
                            isAcademic ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                            {s.program} · GPA {s.academic.cumulativeGPA.toFixed(2)}
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                          s.predictions.riskLevel === 'critical'
                            ? isAcademic ? 'bg-red-100 text-red-800 border-red-200' : 'bg-red-950/80 text-red-300 border-red-800'
                            : s.predictions.riskLevel === 'high'
                            ? isAcademic ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-amber-950/80 text-amber-300 border-amber-800'
                            : isAcademic ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                        }`}>
                          {s.predictions.riskLevel}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Zone 3: Actions, Mobile & Tablet Search Button & Persona Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile & Tablet Search Button (< 1024px) */}
          {!isStudent && (
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              aria-label="Toggle Search"
              className={`lg:hidden p-2 rounded-xl border transition-colors ${
                mobileSearchOpen
                  ? 'bg-amber-600 text-white border-amber-700'
                  : isAcademic
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Theme Mode Toggle (Desktop only: hidden on mobile & tablet < 1024px) */}
          <button
            onClick={() => onToggleTheme(isAcademic ? 'hadoop' : 'academic')}
            className={`hidden lg:flex px-3 py-1.5 rounded-xl border text-xs font-medium items-center gap-2 transition-all ${
              isAcademic
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
            }`}
            title={`Switch to ${isAcademic ? 'Midnight Theme' : 'Daylight Theme'}`}
          >
            {isAcademic ? (
              <Moon className="w-3.5 h-3.5 text-slate-600" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{isAcademic ? 'Midnight Theme' : 'Daylight Theme'}</span>
          </button>

          {/* System Guide Button */}
          {canViewArchitecture && (
            <button
              onClick={onOpenReport}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                isAcademic
                  ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900'
                  : 'bg-amber-950/60 hover:bg-amber-900/80 border-amber-800 text-amber-300'
              }`}
              title="How the System Works (Student & Faculty Guide)"
            >
              <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>System Guide</span>
            </button>
          )}

          {/* Alerts Bell */}
          {canViewAlerts && (
            <button
              onClick={onOpenAlerts}
              className={`relative p-2 rounded-xl border transition-colors ${
                isAcademic
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
              title="Early Warning Notices"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white font-bold text-[9px] flex items-center justify-center border-2 border-white dark:border-slate-950">
                  {unreadAlertsCount}
                </span>
              )}
            </button>
          )}

          {/* Active Role Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className={`flex items-center gap-1.5 sm:gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border text-xs transition-colors ${
                isAcademic
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex text-left font-semibold text-xs leading-tight items-center gap-1.5">
                <span className="truncate max-w-[100px] sm:max-w-[120px]">{activeUser.name}</span>
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
                  ({activeUser.role})
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {roleDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setRoleDropdownOpen(false)}
                />
                <div className={`absolute right-0 mt-2 w-72 rounded-2xl border shadow-2xl p-2 z-50 ${
                  isAcademic
                    ? 'bg-white border-slate-200 text-slate-800'
                    : 'bg-slate-900 border-slate-800 text-slate-200'
                }`}>
                  <div className={`px-3 py-2 border-b mb-1 ${
                    isAcademic ? 'border-slate-100' : 'border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Switch Persona</span>
                      <ShieldCheck className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Test application views across role levels
                    </div>
                  </div>

                  {Object.entries(DEMO_USERS).map(([roleKey, u]) => (
                    <button
                      key={roleKey}
                      onClick={() => {
                        onSwitchRole(roleKey);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors ${
                        activeUser.role === roleKey
                          ? isAcademic
                            ? 'bg-amber-50 font-bold text-amber-950'
                            : 'bg-amber-950/70 font-bold text-white'
                          : isAcademic
                          ? 'hover:bg-slate-50 text-slate-700'
                          : 'hover:bg-slate-800/70 text-slate-300'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold truncate">{u.name}</span>
                          <span className="text-[9px] uppercase font-mono text-amber-500 font-bold">
                            {u.role}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {u.title || u.department}
                        </div>
                      </div>
                    </button>
                  ))}

                  <div className={`border-t mt-2 pt-2 px-1 ${isAcademic ? 'border-slate-100' : 'border-slate-800'}`}>
                    <button
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-left text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className={`hidden sm:flex p-2 rounded-xl border transition-colors ${
              isAcademic
                ? 'bg-slate-50 hover:bg-red-50 border-slate-200 text-slate-600 hover:text-red-700'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-red-400'
            }`}
            title="Lock Session / Exit"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Mobile & Tablet Search Drawer Bar (< 1024px) */}
      {mobileSearchOpen && !isStudent && (
        <div className="lg:hidden mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="relative">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
              isAcademic ? 'text-slate-400' : 'text-slate-500'
            }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search student name, ID, or course..."
              autoFocus
              className={`w-full rounded-xl pl-9 pr-9 py-2 text-xs border focus:outline-none ${
                isAcademic
                  ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  : 'bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {searchQuery.trim().length > 0 && (
            <div className={`rounded-xl border shadow-xl py-2 z-50 overflow-hidden ${
              isAcademic
                ? 'bg-white border-slate-200 text-slate-800'
                : 'bg-slate-900 border-slate-800 text-slate-100'
            }`}>
              <div className={`px-3 py-1 text-[10px] font-mono uppercase font-bold border-b ${
                isAcademic ? 'text-slate-500 border-slate-100' : 'text-slate-400 border-slate-800'
              }`}>
                Found {matchingStudents.length} matching scholars
              </div>
              {matchingStudents.length === 0 ? (
                <div className="px-3 py-2 text-xs text-slate-400 italic text-center">
                  No matching student records found
                </div>
              ) : (
                <div className="max-h-52 overflow-y-auto">
                  {matchingStudents.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        onSelectStudent(s.id);
                        onSearchChange('');
                        setMobileSearchOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 transition-colors flex items-center justify-between gap-2 border-b last:border-0 ${
                        isAcademic
                          ? 'hover:bg-slate-50 border-slate-100 text-slate-800'
                          : 'hover:bg-slate-800/80 border-slate-800/40 text-slate-100'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate flex items-center gap-1.5">
                          <span>{s.name}</span>
                          <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400">
                            ({s.studentId})
                          </span>
                        </div>
                        <div className={`text-[10px] truncate ${
                          isAcademic ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          {s.program} · GPA {s.academic.cumulativeGPA.toFixed(2)}
                        </div>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${
                        s.predictions.riskLevel === 'critical'
                          ? isAcademic ? 'bg-red-100 text-red-800 border-red-200' : 'bg-red-950/80 text-red-300 border-red-800'
                          : s.predictions.riskLevel === 'high'
                          ? isAcademic ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-amber-950/80 text-amber-300 border-amber-800'
                          : isAcademic ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                      }`}>
                        {s.predictions.riskLevel}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
