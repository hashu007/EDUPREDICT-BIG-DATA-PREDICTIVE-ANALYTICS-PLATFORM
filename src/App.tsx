import React, { useState, useEffect } from 'react';
import { Header } from './components/navigation/Header';
import { Sidebar, NavTab } from './components/navigation/Sidebar';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { FacultyDashboard } from './components/dashboards/FacultyDashboard';
import { StudentPortal } from './components/dashboards/StudentPortal';
import { AnalystLab } from './components/dashboards/AnalystLab';
import { StudentRoster } from './components/students/StudentRoster';
import { StudentDetailModal } from './components/students/StudentDetailModal';
import { HdfsClusterView } from './components/bigdata/HdfsClusterView';
import { MapReduceRunner } from './components/bigdata/MapReduceRunner';
import { ImpalaQueryConsole } from './components/bigdata/ImpalaQueryConsole';
import { AlertsHub } from './components/alerts/AlertsHub';
import { ProjectReportHub } from './components/documentation/ProjectReportHub';
import { SupportModal } from './components/support/SupportModal';
import { LoginPortal } from './components/auth/LoginPortal';
import { AccessRestricted } from './components/navigation/AccessRestricted';
import { ManagementAnalyticsHub } from './components/analytics/ManagementAnalyticsHub';
import { ROLE_PERMISSIONS, hasTabPermission } from './services/rbacPolicy';
import { dataService } from './services/dataService';
import { Student, Intervention, Alert, MapReduceJob, HdfsFile, ThemeMode, User, UserRole } from './types';
import { LayoutDashboard, Users, Bell, BrainCircuit, Menu } from 'lucide-react';

export default function App() {
  const [, setTick] = useState(0);

  // Global state loaded from dataService
  const activeUser = dataService.getActiveUser();
  const students = dataService.getStudents();
  const courses = dataService.getCourses();
  const hdfsNodes = dataService.getHdfsNodes();
  const hdfsFiles = dataService.getHdfsFiles();
  const mapReduceJobs = dataService.getMapReduceJobs();
  const alerts = dataService.getAlerts();
  const telemetry = dataService.getTelemetry();

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');

  // Mobile menu drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Theme mode: 'academic' (default light parchment) vs 'hadoop' (industrial cluster dark)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('edupredict_theme');
    return savedTheme === 'hadoop' || savedTheme === 'academic' ? savedTheme : 'academic';
  });

  // Authentication State: starts at the login page by default
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Selected student for detailed drilldown drawer
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Global search query
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    // Synchronize all data with local MongoDB server if available
    dataService.syncToBackend();

    const unsub = dataService.subscribe(() => {
      setTick(t => t + 1);
    });
    return unsub;
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'hadoop');
    document.documentElement.classList.toggle('light', theme === 'academic');
    document.documentElement.style.colorScheme = theme === 'hadoop' ? 'dark' : 'light';
  }, [theme]);

  const handleToggleTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    localStorage.setItem('edupredict_theme', newTheme);
  };

  const handleLogin = (user: User) => {
    dataService.setActiveUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('edupredict_auth_active', 'true');
    const roleConfig = ROLE_PERMISSIONS[user.role as UserRole];
    setCurrentTab(roleConfig?.defaultTab || 'overview');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('edupredict_auth_active', 'false');
  };

  const handleSwitchRole = (roleKey: string) => {
    dataService.setActiveUserRole(roleKey);
    const roleConfig = ROLE_PERMISSIONS[roleKey as UserRole];
    if (roleConfig && !roleConfig.allowedTabs.includes(currentTab)) {
      setCurrentTab(roleConfig.defaultTab);
    }
  };

  const handleAddIntervention = (studentId: string, intervention: Omit<Intervention, 'id' | 'timestamp'>) => {
    dataService.addIntervention(studentId, intervention);
  };

  const handleUpdateAlertStatus = (alertId: string, status: Alert['status']) => {
    dataService.updateAlertStatus(alertId, status);
  };

  const handleDismissAlert = (alertId: string) => {
    dataService.dismissAlert(alertId);
  };

  const handleTriggerJob = (jobName: string, engine?: MapReduceJob['engine']) => {
    dataService.triggerMapReduceJob(jobName, engine);
  };

  const handleIngestDataset = (name: string, records: number, format: HdfsFile['format']) => {
    dataService.ingestNewDataset(name, records, format);
  };

  const handleRequestStudentHelp = (subject: string, message: string) => {
    if (activeUser.studentId) {
      const stu = students.find(s => s.studentId === activeUser.studentId);
      if (stu) {
        dataService.addIntervention(stu.id, {
          studentId: stu.studentId,
          studentName: stu.name,
          counselor: 'Academic Advising Center',
          type: 'academic_counseling',
          notes: `[Student Self-Requested Support] ${subject}: ${message}`,
          outcomeStatus: 'in_progress',
          followUpDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
        });
      }
    }
  };

  const selectedStudent = selectedStudentId
    ? students.find(s => s.id === selectedStudentId) || null
    : null;

  const unreadAlertsCount = alerts.filter(a => a.status === 'unresolved').length;
  const criticalStudentsCount = students.filter(s => s.predictions.dropoutRiskScore >= 70).length;

  const currentUserStudentProfile =
    students.find(s =>
      (activeUser.studentId && s.studentId.trim().toLowerCase() === activeUser.studentId.trim().toLowerCase()) ||
      (activeUser.email && s.email.trim().toLowerCase() === activeUser.email.trim().toLowerCase()) ||
      s.name.trim().toLowerCase() === activeUser.name.trim().toLowerCase()
    ) || students[0];

  const isAcademic = theme === 'academic';

  if (!isAuthenticated) {
    return (
      <LoginPortal
        onLogin={handleLogin}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  return (
    <div
      className={`h-screen flex flex-col font-sans transition-colors overflow-hidden ${
        isAcademic
          ? 'theme-academic bg-slate-100 text-slate-800'
          : 'theme-hadoop bg-[#080d16] text-slate-100'
      }`}
    >
      {/* Top Application Header */}
      <Header
        activeUser={activeUser}
        onSwitchRole={handleSwitchRole}
        alerts={alerts}
        onOpenAlerts={() => setCurrentTab('alerts')}
        onOpenReport={() => setCurrentTab('documentation')}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectStudent={(id) => setSelectedStudentId(id)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onLogout={handleLogout}
        onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
        isMobileMenuOpen={mobileMenuOpen}
      />

      {/* Main Body with Sidebar + Tab Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Responsive Sidebar (Persistent on lg screens, Slide-over on mobile/tablet) */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setMobileMenuOpen(false);
          }}
          userRole={activeUser.role}
          unreadAlertsCount={unreadAlertsCount}
          criticalStudentsCount={criticalStudentsCount}
          theme={theme}
          isOpenMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          onLogout={handleLogout}
          activeUser={activeUser}
          onSwitchRole={handleSwitchRole}
          alerts={alerts}
          onOpenAlerts={() => setCurrentTab('alerts')}
          onOpenReport={() => setCurrentTab('documentation')}
          onToggleTheme={handleToggleTheme}
        />

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 lg:p-8 w-full max-w-[1720px] mx-auto pb-16 lg:pb-8">
          {!hasTabPermission(activeUser.role, currentTab) ? (
            <AccessRestricted
              userRole={activeUser.role}
              attemptedTab={currentTab}
              onReturn={() => setCurrentTab(ROLE_PERMISSIONS[activeUser.role]?.defaultTab || 'overview')}
              theme={theme}
            />
          ) : (
            <>
              {/* TAB: OVERVIEW (Adapts intelligently to active user role) */}
              {currentTab === 'overview' && (
                <>
                  {(activeUser.role === 'admin' || activeUser.role === 'analyst') && (
                    <AdminDashboard
                      students={students}
                      courses={courses}
                      alerts={alerts}
                      telemetry={telemetry}
                      hdfsNodes={hdfsNodes}
                      onSelectStudent={(id) => setSelectedStudentId(id)}
                      onNavigateTab={setCurrentTab}
                      theme={theme}
                    />
                  )}

                  {activeUser.role === 'faculty' && (
                    <FacultyDashboard
                      students={students}
                      courses={courses}
                      onSelectStudent={(id) => setSelectedStudentId(id)}
                      onAddIntervention={handleAddIntervention}
                      theme={theme}
                    />
                  )}

                  {activeUser.role === 'student' && (
                    <StudentPortal
                      student={currentUserStudentProfile}
                      onRequestHelp={handleRequestStudentHelp}
                      theme={theme}
                    />
                  )}
                </>
              )}

              {/* TAB: STUDENT COHORT DIRECTORY */}
              {currentTab === 'students' && (
                <StudentRoster
                  students={students}
                  onSelectStudent={(id) => setSelectedStudentId(id)}
                  onOpenInterventionModal={(student) => setSelectedStudentId(student.id)}
                  theme={theme}
                  userRole={activeUser.role}
                />
              )}

              {/* TAB: HDFS STORAGE TOPOLOGY */}
              {currentTab === 'hdfs' && (
                <HdfsClusterView
                  nodes={hdfsNodes}
                  files={hdfsFiles}
                  onIngestDataset={handleIngestDataset}
                  theme={theme}
                />
              )}

              {/* TAB: MAPREDUCE & SPARK ETL COORDINATOR */}
              {currentTab === 'mapreduce' && (
                <MapReduceRunner
                  jobs={mapReduceJobs}
                  onTriggerJob={handleTriggerJob}
                  theme={theme}
                />
              )}

              {/* TAB: MANAGEMENT MULTI-FILTER ANALYTICS SUITE */}
              {currentTab === 'management_analytics' && (
                <ManagementAnalyticsHub
                  students={students}
                  onSelectStudent={(id) => setSelectedStudentId(id)}
                  theme={theme}
                  userRole={activeUser.role}
                />
              )}

              {/* TAB: ML PREDICTIVE LAB */}
              {currentTab === 'analytics' && (
                <AnalystLab
                  students={students}
                  onTriggerRetrain={handleTriggerJob}
                  onSelectStudent={(id) => setSelectedStudentId(id)}
                  theme={theme}
                />
              )}

              {/* TAB: IMPALA SQL QUERY CONSOLE */}
              {currentTab === 'impala' && <ImpalaQueryConsole theme={theme} />}

              {/* TAB: EARLY WARNING ALERTS */}
              {currentTab === 'alerts' && (
                <AlertsHub
                  alerts={alerts}
                  onUpdateStatus={handleUpdateAlertStatus}
                  onDismissAlert={handleDismissAlert}
                  onSelectStudent={(id) => setSelectedStudentId(id)}
                  theme={theme}
                />
              )}

              {/* TAB: SYSTEM ARCHITECTURE & TECHNICAL SPECIFICATIONS */}
              {currentTab === 'documentation' && (
                <ProjectReportHub students={students} theme={theme} />
              )}

              {/* TAB: MENTORING & SUPPORT */}
              {currentTab === 'support' && (
                <SupportModal activeUser={activeUser} theme={theme} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Touch Quick Tab Bar (Visible only on mobile/tablet `<lg`) */}
      <nav
        aria-label="Mobile Navigation Bar"
        className={`lg:hidden fixed bottom-0 inset-x-0 z-30 border-t flex items-center justify-around py-1 px-2 ${
          isAcademic
            ? 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-700 shadow-lg'
            : 'bg-[#0b101b]/95 backdrop-blur-md border-slate-800 text-slate-300 shadow-2xl'
        }`}
      >
        <button
          onClick={() => setCurrentTab('overview')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg flex-1 transition-colors ${
            currentTab === 'overview'
              ? isAcademic
                ? 'text-amber-700 font-bold'
                : 'text-amber-400 font-bold'
              : isAcademic
              ? 'text-slate-500 hover:text-slate-900'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Overview</span>
        </button>

        {hasTabPermission(activeUser.role, 'students') && (
          <button
            onClick={() => setCurrentTab('students')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-lg flex-1 transition-colors ${
              currentTab === 'students'
                ? isAcademic
                  ? 'text-amber-700 font-bold'
                  : 'text-amber-400 font-bold'
                : isAcademic
                ? 'text-slate-500 hover:text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Roster</span>
          </button>
        )}

        {hasTabPermission(activeUser.role, 'alerts') && (
          <button
            onClick={() => setCurrentTab('alerts')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-lg flex-1 transition-colors relative ${
              currentTab === 'alerts'
                ? isAcademic
                  ? 'text-amber-700 font-bold'
                  : 'text-amber-400 font-bold'
                : isAcademic
                ? 'text-slate-500 hover:text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4 mb-0.5" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
            <span className="text-[10px]">Alerts</span>
          </button>
        )}

        {hasTabPermission(activeUser.role, 'analytics') && (
          <button
            onClick={() => setCurrentTab('analytics')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-lg flex-1 transition-colors ${
              currentTab === 'analytics'
                ? isAcademic
                  ? 'text-amber-700 font-bold'
                  : 'text-amber-400 font-bold'
                : isAcademic
                ? 'text-slate-500 hover:text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BrainCircuit className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Predictor</span>
          </button>
        )}

        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg flex-1 transition-colors ${
            mobileMenuOpen
              ? isAcademic
                ? 'text-amber-700 font-bold'
                : 'text-amber-400 font-bold'
              : isAcademic
              ? 'text-slate-500 hover:text-slate-900'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Menu className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Menu</span>
        </button>
      </nav>

      {/* Student Detail Modal Drawer */}
      {selectedStudent && (activeUser.role !== 'student' || selectedStudent.studentId === activeUser.studentId) && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudentId(null)}
          onAddIntervention={handleAddIntervention}
        />
      )}
    </div>
  );
}
