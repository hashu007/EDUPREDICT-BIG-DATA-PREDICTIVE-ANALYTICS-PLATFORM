import React, { useState } from 'react';
import {
  BookOpen,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  AlertCircle,
  Building2,
  CheckCircle2,
  Sun,
  Moon,
  UserPlus,
  LogIn,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { User, ThemeMode } from '../../types';
import { DEMO_LOGIN_CREDENTIALS, DEMO_USERS, dataService } from '../../services/dataService';

interface LoginPortalProps {
  onLogin: (user: User) => void;
  theme: ThemeMode;
  onToggleTheme: (theme: ThemeMode) => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({
  onLogin,
  theme,
  onToggleTheme
}) => {
  // Navigation tabs: 'sign_in' | 'sign_up' | 'quick_roles'
  const [authMode, setAuthMode] = useState<'sign_in' | 'sign_up' | 'quick_roles'>('sign_in');
  
  // Sign In Form State
  const [signInEmailOrId, setSignInEmailOrId] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpStudentId, setSignUpStudentId] = useState('');
  const [signUpDepartment, setSignUpDepartment] = useState('Computer Science');
  const [signUpProgram, setSignUpProgram] = useState('B.Sc. in Computer Science');
  const [signUpSemester, setSignUpSemester] = useState(1);
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Status & Feedback States
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isAcademic = theme === 'academic';

  // Handle Department change in Sign Up to sync default Program
  const handleDepartmentChange = (dept: string) => {
    setSignUpDepartment(dept);
    setSignUpProgram(`B.Sc. in ${dept}`);
  };

  // 1. Sign In Submission
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!signInEmailOrId.trim()) {
      setErrorMessage('Please enter your university email or student ID.');
      return;
    }

    if (!signInPassword.trim()) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const authResult = dataService.authenticate(signInEmailOrId, signInPassword);

      if (authResult.success && authResult.user) {
        onLogin(authResult.user);
      } else {
        setErrorMessage(authResult.error || 'Authentication failed. Please verify your credentials.');
      }
    }, 350);
  };

  // 2. Student Sign Up Submission
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!signUpName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!signUpEmail.trim() || !signUpEmail.includes('@')) {
      setErrorMessage('Please enter a valid university email address.');
      return;
    }

    if (!signUpPassword) {
      setErrorMessage('Please enter an account password.');
      return;
    }

    if (signUpPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-type your password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const regResult = dataService.registerStudentUser({
        name: signUpName,
        email: signUpEmail,
        password: signUpPassword,
        department: signUpDepartment,
        program: signUpProgram,
        semester: Number(signUpSemester),
        studentId: signUpStudentId.trim() || undefined
      });

      if (regResult.success && regResult.user) {
        // Pre-fill Sign In email/ID, clear Sign Up fields, and redirect to Sign In section
        setSignInEmailOrId(regResult.user.email);
        setSignInPassword('');
        setSignUpName('');
        setSignUpEmail('');
        setSignUpStudentId('');
        setSignUpPassword('');
        setSignUpConfirmPassword('');
        setAuthMode('sign_in');
        setSuccessMessage(
          `Account created successfully for ${regResult.user.name} (Student ID: ${regResult.user.studentId})! Please sign in below to access your dashboard.`
        );
      } else {
        setErrorMessage(regResult.error || 'Unable to register student account.');
      }
    }, 450);
  };

  // 3. Quick Role Selection
  const handleQuickRoleSelect = (roleKey: string) => {
    setErrorMessage('');
    setSuccessMessage('');
    const credentials = DEMO_LOGIN_CREDENTIALS[roleKey] || DEMO_LOGIN_CREDENTIALS.student;
    setSignInEmailOrId(credentials.email);
    setSignInPassword(credentials.password);
    setAuthMode('sign_in');
    setSuccessMessage('Demo credentials filled. Select Sign In to verify them.');
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors ${isAcademic ? 'theme-academic' : 'theme-hadoop'} ${
        isAcademic
          ? 'bg-[#f4f6f9] text-slate-800'
          : 'bg-[#070c16] text-slate-100'
      }`}
    >
      {/* Top Header - Responsive Across Mobile, Tablet, and Desktop */}
      <header
        className={`px-3.5 sm:px-6 md:px-8 py-2.5 sm:py-3.5 border-b flex items-center justify-between gap-3 sticky top-0 z-30 backdrop-blur-md transition-colors ${
          isAcademic
            ? 'bg-white/95 border-slate-200 text-slate-900 shadow-2xs'
            : 'bg-[#090f1d]/95 border-slate-800 text-slate-100'
        }`}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-700 flex items-center justify-center text-white shadow-sm shrink-0">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-amber-50" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className={`font-display-academic font-black text-sm sm:text-base md:text-lg tracking-wide shrink-0 ${
                isAcademic ? 'text-slate-900' : 'text-white'
              }`}>
                EDUPREDICT
              </span>
              <span className={`text-[9px] sm:text-[11px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full border shrink-0 hidden min-[460px]:inline-flex ${
                isAcademic
                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
              }`}>
                Institutional Intelligence
              </span>
            </div>
            <div className={`text-[10px] sm:text-xs truncate max-w-[180px] min-[400px]:max-w-[240px] sm:max-w-md ${
              isAcademic ? 'text-slate-500' : 'text-slate-400'
            }`}>
              Student Retention & Academic Workstation
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => onToggleTheme(isAcademic ? 'hadoop' : 'academic')}
            aria-label={`Switch to ${isAcademic ? 'Dark' : 'Light'} Mode`}
            className={`text-xs px-2.5 sm:px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-all ${
              isAcademic
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700 shadow-2xs'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            {isAcademic ? (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-3.5 sm:p-6 my-2 sm:my-4">
        <div className="w-full max-w-xl">
          {/* Card Container */}
          <div
            className={`rounded-2xl border shadow-xl overflow-hidden transition-all ${
              isAcademic
                ? 'bg-white border-slate-200'
                : 'bg-[#0d1526] border-slate-800'
            }`}
          >
            {/* Card Header & Tab Switcher */}
            <div
              className={`p-4 sm:p-7 text-center relative border-b ${
                isAcademic
                  ? 'bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-white border-slate-200'
                  : 'bg-gradient-to-b from-amber-500/10 via-transparent to-transparent border-slate-800'
              }`}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-700 text-white flex items-center justify-center mx-auto shadow-md mb-2">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h1 className={`text-lg sm:text-2xl font-display-academic font-bold ${
                isAcademic ? 'text-slate-900' : 'text-white'
              }`}>
                {authMode === 'sign_up' ? 'Create Student Account' : 'Student & Institutional Sign In'}
              </h1>
              <p className={`text-[11px] sm:text-xs mt-1 max-w-md mx-auto leading-relaxed ${
                isAcademic ? 'text-slate-600' : 'text-slate-400'
              }`}>
                {authMode === 'sign_up'
                  ? 'Register to access your courses, attendance analytics, and predictive GPA forecasts.'
                  : 'Sign in to access your personal academic workstation or select a quick demo profile.'}
              </p>

              {/* Three Navigation Tabs - Responsive Grid/Flex */}
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 mt-3.5 sm:mt-4 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-900/60 max-w-md mx-auto w-full">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('sign_in');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className={`flex-1 py-1.5 px-1.5 sm:px-2 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-all truncate ${
                    authMode === 'sign_in'
                      ? 'bg-amber-700 text-white shadow-xs font-bold'
                      : isAcademic
                      ? 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('sign_up');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className={`flex-1 py-1.5 px-1.5 sm:px-2 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-all truncate ${
                    authMode === 'sign_up'
                      ? 'bg-amber-700 text-white shadow-xs font-bold'
                      : isAcademic
                      ? 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Sign Up</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('quick_roles');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className={`flex-1 py-1.5 px-1.5 sm:px-2 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-all truncate ${
                    authMode === 'quick_roles'
                      ? 'bg-amber-700 text-white shadow-xs font-bold'
                      : isAcademic
                      ? 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Quick Demo</span>
                </button>
              </div>
            </div>

            {/* Error & Success Alerts */}
            {errorMessage && (
              <div className={`mx-6 mt-4 p-3 rounded-lg border text-xs flex items-center gap-2 ${
                isAcademic
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-red-950/50 border-red-800 text-red-300'
              }`}>
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className={`mx-6 mt-4 p-3 rounded-lg border text-xs flex items-center gap-2 ${
                isAcademic
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
              }`}>
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* TAB 1: STUDENT & USER SIGN IN */}
            {authMode === 'sign_in' && (
              <form onSubmit={handleSignIn} className="p-6 sm:p-8 space-y-4">
                {/* Email / Student ID */}
                <div className="space-y-1">
                  <label className={`text-xs font-semibold flex items-center justify-between ${
                    isAcademic ? 'text-slate-800' : 'text-slate-200'
                  }`}>
                    <span>University Email or Student ID</span>
                    <span className="text-[10px] text-slate-400 font-mono">e.g. STU-2024-0891</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={signInEmailOrId}
                      onChange={(e) => setSignInEmailOrId(e.target.value)}
                      placeholder="Enter email or student ID"
                      className={`w-full pl-9 pr-3 py-2 rounded-lg border text-xs focus:outline-none transition-colors ${
                        isAcademic
                          ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-600'
                          : 'bg-[#090f1d] border-slate-800 text-slate-100 placeholder-slate-500 focus:border-amber-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className={`text-xs font-semibold flex items-center justify-between ${
                    isAcademic ? 'text-slate-800' : 'text-slate-200'
                  }`}>
                    <span>Password</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSignInEmailOrId('hassamkhan33344@gmail.com');
                        setSignInPassword('student123Password!');
                      }}
                      className="text-[10px] text-amber-700 hover:underline font-semibold"
                    >
                      Fill Demo Student
                    </button>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showSignInPassword ? 'text' : 'password'}
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="Enter account password"
                      className={`w-full pl-9 pr-9 py-2 rounded-lg border text-xs focus:outline-none transition-colors ${
                        isAcademic
                          ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-600'
                          : 'bg-[#090f1d] border-slate-800 text-slate-100 placeholder-slate-500 focus:border-amber-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember & Options */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-amber-700 focus:ring-amber-500"
                    />
                    <span className={`text-[11px] ${isAcademic ? 'text-slate-600' : 'text-slate-400'}`}>
                      Keep me signed in
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('sign_up');
                      setErrorMessage('');
                    }}
                    className={`text-[11px] hover:underline font-semibold ${
                      isAcademic ? 'text-amber-800' : 'text-amber-400'
                    }`}
                  >
                    New student? Register here
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md mt-2 disabled:opacity-70"
                >
                  {isLoading ? (
                    <span>Signing in...</span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: STUDENT SIGN UP (REGISTRATION) */}
            {authMode === 'sign_up' && (
              <form onSubmit={handleSignUp} className="p-6 sm:p-8 space-y-3.5">
                {/* Full Name & Student ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={`text-xs font-semibold ${isAcademic ? 'text-slate-800' : 'text-slate-200'}`}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      placeholder="e.g. Ali Hassan"
                      className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none transition-colors ${
                        isAcademic
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-600'
                          : 'bg-[#090f1d] border-slate-800 text-slate-100 focus:border-amber-500'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`text-xs font-semibold flex items-center justify-between ${
                      isAcademic ? 'text-slate-800' : 'text-slate-200'
                    }`}>
                      <span>Student ID</span>
                      <span className="text-[10px] text-slate-400">Optional</span>
                    </label>
                    <input
                      type="text"
                      value={signUpStudentId}
                      onChange={(e) => setSignUpStudentId(e.target.value)}
                      placeholder="e.g. STU-2026-1042"
                      className={`w-full px-3 py-2 rounded-lg border text-xs font-mono focus:outline-none transition-colors ${
                        isAcademic
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-600'
                          : 'bg-[#090f1d] border-slate-800 text-slate-100 focus:border-amber-500'
                      }`}
                    />
                  </div>
                </div>

                {/* University Email */}
                <div className="space-y-1">
                  <label className={`text-xs font-semibold ${isAcademic ? 'text-slate-800' : 'text-slate-200'}`}>
                    University Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="student@university.edu"
                      className={`w-full pl-9 pr-3 py-2 rounded-lg border text-xs focus:outline-none transition-colors ${
                        isAcademic
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-600'
                          : 'bg-[#090f1d] border-slate-800 text-slate-100 focus:border-amber-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Department & Semester */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={`text-xs font-semibold flex items-center gap-1.5 ${
                      isAcademic ? 'text-slate-800' : 'text-slate-200'
                    }`}>
                      <Building2 className="w-3.5 h-3.5 text-amber-700" />
                      <span>Department *</span>
                    </label>
                    <select
                      value={signUpDepartment}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none transition-colors ${
                        isAcademic
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-600'
                          : 'bg-[#090f1d] border-slate-800 text-slate-100 focus:border-amber-500'
                      }`}
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Software Engineering">Software Engineering</option>
                      <option value="Business Analytics">Business Analytics</option>
                      <option value="Artificial Intelligence">Artificial Intelligence</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className={`text-xs font-semibold flex items-center gap-1.5 ${
                      isAcademic ? 'text-slate-800' : 'text-slate-200'
                    }`}>
                      <GraduationCap className="w-3.5 h-3.5 text-amber-700" />
                      <span>Current Semester *</span>
                    </label>
                    <select
                      value={signUpSemester}
                      onChange={(e) => setSignUpSemester(Number(e.target.value))}
                      className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none transition-colors ${
                        isAcademic
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-600'
                          : 'bg-[#090f1d] border-slate-800 text-slate-100 focus:border-amber-500'
                      }`}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={`text-xs font-semibold ${isAcademic ? 'text-slate-800' : 'text-slate-200'}`}>
                      Password (min 6 chars) *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showSignUpPassword ? 'text' : 'password'}
                        required
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-9 pr-9 py-2 rounded-lg border text-xs focus:outline-none transition-colors ${
                          isAcademic
                            ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-600'
                            : 'bg-[#090f1d] border-slate-800 text-slate-100 focus:border-amber-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        className="text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className={`text-xs font-semibold ${isAcademic ? 'text-slate-800' : 'text-slate-200'}`}>
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showSignUpPassword ? 'text' : 'password'}
                        required
                        value={signUpConfirmPassword}
                        onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-9 pr-3 py-2 rounded-lg border text-xs focus:outline-none transition-colors ${
                          isAcademic
                            ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-600'
                            : 'bg-[#090f1d] border-slate-800 text-slate-100 focus:border-amber-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Sign Up Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md mt-2 disabled:opacity-70"
                >
                  {isLoading ? (
                    <span>Registering Student Account...</span>
                  ) : (
                    <>
                      <span>Complete Registration & Proceed to Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('sign_in');
                      setErrorMessage('');
                    }}
                    className={`text-[11px] hover:underline font-semibold ${
                      isAcademic ? 'text-amber-800' : 'text-amber-400'
                    }`}
                  >
                    Already have an account? Sign in here
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: QUICK ROLE DEMO ACCESS */}
            {authMode === 'quick_roles' && (
              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`text-xs font-bold tracking-wide ${
                    isAcademic ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    Select Any Stakeholder Persona:
                  </div>
                  <div className={`text-[11px] ${
                    isAcademic ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    1-Click Instant Login
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Student 1: Honors Student (Low Risk) */}
                  <button
                    onClick={() => handleQuickRoleSelect('student')}
                    disabled={isLoading}
                    className={`p-3.5 rounded-xl border text-left transition-all group relative overflow-hidden ${
                      isAcademic
                        ? 'bg-slate-50 hover:bg-amber-50/70 border-slate-200 hover:border-amber-400 text-slate-800 shadow-2xs'
                        : 'bg-[#131e36] hover:bg-amber-950/40 border-slate-800 hover:border-amber-700 text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold truncate ${
                            isAcademic ? 'text-slate-900' : 'text-white'
                          }`}>
                            {DEMO_USERS.student.name}
                          </span>
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold shrink-0 bg-emerald-100 text-emerald-900 border border-emerald-300">
                            Honors Student
                          </span>
                        </div>
                        <div className={`text-[11px] truncate ${
                          isAcademic ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          ID: {DEMO_USERS.student.studentId}
                        </div>
                        <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          GPA 3.92 · Low Risk (1.8%)
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Big Data & Research Analyst */}
                  <button
                    onClick={() => handleQuickRoleSelect('analyst')}
                    disabled={isLoading}
                    className={`p-3.5 rounded-xl border text-left transition-all group relative overflow-hidden ${
                      isAcademic
                        ? 'bg-slate-50 hover:bg-emerald-50/70 border-slate-200 hover:border-emerald-400 text-slate-800 shadow-2xs'
                        : 'bg-[#131e36] hover:bg-emerald-950/40 border-slate-800 hover:border-emerald-700 text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold truncate ${
                            isAcademic ? 'text-slate-900' : 'text-white'
                          }`}>
                            {DEMO_USERS.analyst.name}
                          </span>
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold shrink-0 bg-emerald-100 text-emerald-900 border border-emerald-300">
                            Analyst
                          </span>
                        </div>
                        <div className={`text-[11px] truncate ${
                          isAcademic ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          Institutional Research Analyst
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          Grade & Retention Predictor Lab
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Teacher / Faculty */}
                  <button
                    onClick={() => handleQuickRoleSelect('faculty')}
                    disabled={isLoading}
                    className={`p-3.5 rounded-xl border text-left transition-all group relative overflow-hidden ${
                      isAcademic
                        ? 'bg-slate-50 hover:bg-blue-50/70 border-slate-200 hover:border-blue-400 text-slate-800 shadow-2xs'
                        : 'bg-[#131e36] hover:bg-blue-950/40 border-slate-800 hover:border-blue-700 text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold truncate ${
                            isAcademic ? 'text-slate-900' : 'text-white'
                          }`}>
                            {DEMO_USERS.faculty.name}
                          </span>
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold shrink-0 bg-blue-100 text-blue-900 border border-blue-300">
                            Teacher
                          </span>
                        </div>
                        <div className={`text-[11px] truncate ${
                          isAcademic ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          Associate Professor
                        </div>
                        <div className={`text-[10px] ${
                          isAcademic ? 'text-slate-600' : 'text-slate-400'
                        }`}>
                          Department of Computer Science
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Administrator */}
                  <button
                    onClick={() => handleQuickRoleSelect('admin')}
                    disabled={isLoading}
                    className={`p-3.5 rounded-xl border text-left transition-all group relative overflow-hidden ${
                      isAcademic
                        ? 'bg-slate-50 hover:bg-purple-50/70 border-slate-200 hover:border-purple-400 text-slate-800 shadow-2xs'
                        : 'bg-[#131e36] hover:bg-purple-950/40 border-slate-800 hover:border-purple-700 text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold truncate ${
                            isAcademic ? 'text-slate-900' : 'text-white'
                          }`}>
                            {DEMO_USERS.admin.name}
                          </span>
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold shrink-0 bg-purple-100 text-purple-900 border border-purple-300">
                            Admin
                          </span>
                        </div>
                        <div className={`text-[11px] truncate ${
                          isAcademic ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          Dean of Academic Affairs
                        </div>
                        <div className={`text-[10px] ${
                          isAcademic ? 'text-slate-600' : 'text-slate-400'
                        }`}>
                          Campus-Wide Retention Overview
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                <div className={`pt-2 text-center text-xs ${
                  isAcademic ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Select any persona to immediately enter their customized workspace.
                </div>
              </div>
            )}

            {/* Footer Notice */}
            <div
              className={`p-4 border-t text-xs flex flex-wrap items-center justify-between gap-2 transition-colors ${
                isAcademic
                  ? 'bg-slate-50 border-slate-200 text-slate-600'
                  : 'bg-[#090f1d] border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5 font-medium">
                <Shield className="w-4 h-4 text-amber-700" />
                <span>Secure Institutional Authentication</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Educational Records Protected</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`p-4 text-center text-xs border-t transition-colors ${
          isAcademic
            ? 'bg-white border-slate-200 text-slate-500'
            : 'bg-[#090f1d] border-slate-800 text-slate-400'
        }`}
      >
        EduPredict · Student Retention & Academic Performance Workstation · Institutional Intelligence System
      </footer>
    </div>
  );
};
