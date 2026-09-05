import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Settings as SettingsIcon, Moon, Sun, ChevronRight, X, Mail, Check, LogOut } from "lucide-react";

export type ThemeMode = "system" | "dark" | "light";

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

interface SettingsViewProps {
  currentLanguage: string;
  animateEntrance?: boolean;
}

export default function SettingsView({
  currentLanguage: _currentLanguage,
  animateEntrance = false,
}: SettingsViewProps) {
  // Theme state: "system" | "dark" | "light"
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem("pethealth_theme_mode") as ThemeMode;
      if (saved === "system" || saved === "dark" || saved === "light") {
        return saved;
      }
    } catch {
      // ignore
    }
    return "system";
  });

  // User Profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem("pethealth_user_profile");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  // Account modal state
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [inputName, setInputName] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [authError, setAuthError] = useState("");

  // Apply theme dynamically to documentElement
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      let isDark = false;

      if (themeMode === "dark") {
        isDark = true;
      } else if (themeMode === "light") {
        isDark = false;
      } else {
        // System preference
        isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      }

      if (isDark) {
        root.classList.add("dark");
        root.style.colorScheme = "dark";
      } else {
        root.classList.remove("dark");
        root.style.colorScheme = "light";
      }
    };

    applyTheme();
    localStorage.setItem("pethealth_theme_mode", themeMode);

    // If system, listen for OS theme changes
    if (themeMode === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme();
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [themeMode]);

  const handleSelectTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail.trim() || !inputEmail.includes("@")) {
      setAuthError("Please enter a valid email address");
      return;
    }
    const profileName = inputName.trim() || inputEmail.split("@")[0];
    const newProfile: UserProfile = {
      name: profileName.charAt(0).toUpperCase() + profileName.slice(1),
      email: inputEmail.trim().toLowerCase(),
    };
    setUserProfile(newProfile);
    localStorage.setItem("pethealth_user_profile", JSON.stringify(newProfile));
    setShowAccountModal(false);
    setInputName("");
    setInputEmail("");
    setAuthError("");
  };

  const handleLogout = () => {
    setUserProfile(null);
    localStorage.removeItem("pethealth_user_profile");
    setShowAccountModal(false);
  };

  return (
    <div className="w-full max-w-md min-h-[calc(100vh-140px)] flex flex-col justify-start select-none pb-24">
      {/* 1. Header: Left top text "Settings" */}
      <div className="w-full flex items-center justify-between mb-6 px-1">
        <h1 className="text-[28px] sm:text-[30px] font-bold tracking-tight text-[#1c1c1e] dark:text-[#f5f5f7] leading-none font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
          Settings
        </h1>
      </div>

      {/* 2. Account Section */}
      <motion.div
        initial={animateEntrance ? { opacity: 0, y: 16 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 24, delay: 0.05 }}
        className="w-full flex flex-col mb-6 px-1"
      >
        {/* Small gray label "Account" */}
        <span className="text-[13px] font-medium text-[#8E8E93] tracking-tight ml-1 mb-2 select-none">
          Account
        </span>

        {/* Plaque: Avatar on left, "Create a free account" and "or log in to system" on right */}
        <button
          type="button"
          onClick={() => {
            setAuthError("");
            setShowAccountModal(true);
          }}
          className="w-full bg-white dark:bg-gradient-to-b dark:from-[#202022] dark:to-[#1C1C1E] rounded-[24px] p-4 sm:p-5 border border-black/[0.04] dark:border-white/[0.08] shadow-xs flex items-center justify-between cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all text-left group"
        >
          <div className="flex items-center space-x-3.5 min-w-0">
            {/* Avatar or Profile Icon */}
            <div className="w-12 h-12 rounded-full overflow-hidden bg-[#F2F2F7] dark:bg-[#19191B] flex items-center justify-center flex-shrink-0 text-[#8E8E93] dark:text-[#7C7C80] border border-black/[0.03] dark:border-white/[0.06]">
              {userProfile?.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-full h-full object-cover"
                />
              ) : userProfile?.name ? (
                <span className="text-[18px] font-bold text-[#1C1C1E] dark:text-white">
                  {userProfile.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-6 h-6 stroke-[2]" />
              )}
            </div>

            {/* Account text info */}
            <div className="flex flex-col min-w-0">
              {userProfile ? (
                <>
                  <span className="text-[16px] sm:text-[17px] font-semibold text-[#1C1C1E] dark:text-white tracking-tight leading-snug truncate">
                    {userProfile.name}
                  </span>
                  <span className="text-[13px] sm:text-[14px] text-[#8E8E93] dark:text-[#7C7C80] tracking-tight mt-0.5 leading-snug truncate">
                    {userProfile.email}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[16px] sm:text-[17px] font-semibold text-[#1C1C1E] dark:text-white tracking-tight leading-snug">
                    Create a free account
                  </span>
                  <span className="text-[13px] sm:text-[14px] text-[#8E8E93] dark:text-[#7C7C80] tracking-tight mt-0.5 leading-snug">
                    or log in to system
                  </span>
                </>
              )}
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-[#C7C7CC] dark:text-[#7C7C80] group-hover:text-[#8E8E93] transition-colors flex-shrink-0 ml-2" strokeWidth={2.4} />
        </button>
      </motion.div>

      {/* 3. View Section */}
      <motion.div
        initial={animateEntrance ? { opacity: 0, y: 16 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 24, delay: 0.1 }}
        className="w-full flex flex-col px-1"
      >
        {/* Small gray label "View" */}
        <span className="text-[13px] font-medium text-[#8E8E93] dark:text-[#7C7C80] tracking-tight ml-1 mb-2 select-none">
          View
        </span>

        {/* 3 Plaques in a row: 1. System, 2. Dark, 3. Light - borderless */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {/* 1. System Plaque */}
          <button
            type="button"
            onClick={() => handleSelectTheme("system")}
            className={`rounded-[22px] p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none min-h-[102px] bg-white dark:bg-gradient-to-b dark:from-[#202022] dark:to-[#1C1C1E] ${
              themeMode === "system"
                ? "bg-zinc-100/90 dark:!bg-[#28282B] shadow-sm scale-[1.02]"
                : "hover:scale-[1.01]"
            }`}
          >
            <div
              className={`mb-2.5 transition-colors ${
                themeMode === "system"
                  ? "text-[#1C1C1E] dark:text-white"
                  : "text-[#8E8E93] dark:text-[#7C7C80]"
              }`}
            >
              <SettingsIcon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2]" />
            </div>
            <span
              className={`text-[14px] sm:text-[15px] font-semibold tracking-tight ${
                themeMode === "system"
                  ? "text-[#1C1C1E] dark:text-white"
                  : "text-[#8E8E93] dark:text-[#7C7C80]"
              }`}
            >
              System
            </span>
          </button>

          {/* 2. Dark Plaque */}
          <button
            type="button"
            onClick={() => handleSelectTheme("dark")}
            className={`rounded-[22px] p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none min-h-[102px] bg-white dark:bg-gradient-to-b dark:from-[#202022] dark:to-[#1C1C1E] ${
              themeMode === "dark"
                ? "bg-zinc-100/90 dark:!bg-[#28282B] shadow-sm scale-[1.02]"
                : "hover:scale-[1.01]"
            }`}
          >
            <div
              className={`mb-2.5 transition-colors ${
                themeMode === "dark"
                  ? "text-[#1C1C1E] dark:text-white"
                  : "text-[#8E8E93] dark:text-[#7C7C80]"
              }`}
            >
              <Moon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2]" />
            </div>
            <span
              className={`text-[14px] sm:text-[15px] font-semibold tracking-tight ${
                themeMode === "dark"
                  ? "text-[#1C1C1E] dark:text-white"
                  : "text-[#8E8E93] dark:text-[#7C7C80]"
              }`}
            >
              Dark
            </span>
          </button>

          {/* 3. Light Plaque */}
          <button
            type="button"
            onClick={() => handleSelectTheme("light")}
            className={`rounded-[22px] p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none min-h-[102px] bg-white dark:bg-gradient-to-b dark:from-[#202022] dark:to-[#1C1C1E] ${
              themeMode === "light"
                ? "bg-zinc-100/90 dark:!bg-[#28282B] shadow-sm scale-[1.02]"
                : "hover:scale-[1.01]"
            }`}
          >
            <div
              className={`mb-2.5 transition-colors ${
                themeMode === "light"
                  ? "text-[#1C1C1E] dark:text-white"
                  : "text-[#8E8E93] dark:text-[#7C7C80]"
              }`}
            >
              <Sun className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2]" />
            </div>
            <span
              className={`text-[14px] sm:text-[15px] font-semibold tracking-tight ${
                themeMode === "light"
                  ? "text-[#1C1C1E] dark:text-white"
                  : "text-[#8E8E93] dark:text-[#7C7C80]"
              }`}
            >
              Light
            </span>
          </button>
        </div>
      </motion.div>

      {/* Account Login / Registration Modal */}
      <AnimatePresence>
        {showAccountModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAccountModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal Sheet */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="w-full max-w-sm bg-white dark:bg-gradient-to-b dark:from-[#202022] dark:to-[#1C1C1E] rounded-[28px] p-6 shadow-2xl border border-black/[0.04] dark:border-white/[0.08] relative z-10 select-none"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowAccountModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-[#8E8E93] dark:text-[#7C7C80] hover:text-[#1C1C1E] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {userProfile ? (
                /* Logged In View */
                <div className="flex flex-col items-center text-center pt-2">
                  <div className="w-16 h-16 rounded-full bg-[#F2F2F7] dark:bg-[#19191B] flex items-center justify-center mb-3 text-[#1C1C1E] dark:text-white text-2xl font-bold border border-black/[0.04] dark:border-white/[0.08]">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-[20px] font-bold text-[#1C1C1E] dark:text-white tracking-tight">
                    {userProfile.name}
                  </h3>
                  <p className="text-[14px] text-[#8E8E93] dark:text-[#7C7C80] tracking-tight mt-0.5 mb-6">
                    {userProfile.email}
                  </p>

                  <div className="w-full p-3.5 rounded-[18px] bg-[#F2F2F7] dark:bg-[#19191B] flex items-center space-x-3 mb-6 border border-transparent dark:border-white/[0.06]">
                    <Check className="w-5 h-5 text-[#30D158] flex-shrink-0" />
                    <span className="text-[13px] text-[#1C1C1E] dark:text-white font-medium text-left">
                      Account synchronized with local database
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-3.5 rounded-[18px] bg-[#FF3B30]/10 hover:bg-[#FF3B30]/15 active:bg-[#FF3B30]/20 text-[#FF3B30] font-semibold text-[15px] flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                /* Not Logged In: Sign up / Log in Form */
                <form onSubmit={handleSaveAccount} className="flex flex-col pt-2">
                  <h3 className="text-[21px] font-bold text-[#1C1C1E] dark:text-white tracking-tight mb-1">
                    {authMode === "signup" ? "Create Account" : "Log In"}
                  </h3>
                  <p className="text-[13px] text-[#8E8E93] dark:text-[#7C7C80] tracking-tight mb-5">
                    {authMode === "signup"
                      ? "Save your pets, health logs and reminders across devices."
                      : "Welcome back! Enter your details to continue."}
                  </p>

                  {authMode === "signup" && (
                    <div className="mb-3">
                      <label className="block text-[12px] font-semibold text-[#8E8E93] dark:text-[#7C7C80] uppercase tracking-wider mb-1.5 ml-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                        placeholder="Alex"
                        className="w-full px-4 py-3 rounded-[16px] bg-[#F2F2F7] dark:bg-[#19191B] text-[#1C1C1E] dark:text-white text-[15px] placeholder-[#8E8E93] dark:placeholder-[#7C7C80] outline-none border border-transparent focus:border-[#007AFF] transition-colors"
                      />
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-[12px] font-semibold text-[#8E8E93] dark:text-[#7C7C80] uppercase tracking-wider mb-1.5 ml-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={inputEmail}
                        onChange={(e) => {
                          setInputEmail(e.target.value);
                          setAuthError("");
                        }}
                        placeholder="name@example.com"
                        className="w-full pl-11 pr-4 py-3 rounded-[16px] bg-[#F2F2F7] dark:bg-[#19191B] text-[#1C1C1E] dark:text-white text-[15px] placeholder-[#8E8E93] dark:placeholder-[#7C7C80] outline-none border border-transparent focus:border-[#007AFF] transition-colors"
                      />
                      <Mail className="w-5 h-5 text-[#8E8E93] dark:text-[#7C7C80] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                    {authError && (
                      <p className="text-[12px] text-[#FF3B30] mt-1.5 ml-1">
                        {authError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-[18px] bg-[#1C1C1E] dark:bg-white text-white dark:text-[#1C1C1E] font-semibold text-[15px] shadow-sm hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer mb-3"
                  >
                    {authMode === "signup" ? "Create Free Account" : "Log In"}
                  </button>

                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode(authMode === "signup" ? "login" : "signup");
                        setAuthError("");
                      }}
                      className="text-[13px] text-[#8E8E93] dark:text-[#7C7C80] hover:text-[#1C1C1E] dark:hover:text-white transition-colors cursor-pointer"
                    >
                      {authMode === "signup"
                        ? "Already have an account? Log in"
                        : "Don't have an account? Create one"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
