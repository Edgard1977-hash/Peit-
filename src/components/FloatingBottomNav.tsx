import React from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";

export type NavTabId = "home" | "groups" | "progress" | "settings";

export interface FloatingBottomNavProps {
  activeTab: NavTabId;
  onChangeTab: (tab: NavTabId) => void;
  onAddClick?: () => void;
}

interface SoftIconProps {
  filled?: boolean;
  className?: string;
}

// 1. Soft Home Icon (Friendly rounded organic roof and soft arched door with seamless floor)
export function SoftHomeIcon({ filled, className = "" }: SoftIconProps) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className={className}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.36 3.6C11.27 2.69 12.73 2.69 13.64 3.6L20.2 10.15C20.84 10.79 21.2 11.66 21.2 12.57V18.5C21.2 20.16 19.86 21.5 18.2 21.5H14.8V15.8C14.8 14.25 13.55 13 12 13C10.45 13 9.2 14.25 9.2 15.8V21.5H5.8C4.14 21.5 2.8 20.16 2.8 18.5V12.57C2.8 11.66 3.16 10.79 3.8 10.15L10.36 3.6Z"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3.8 10.15L10.36 3.6C11.27 2.69 12.73 2.69 13.64 3.6L20.2 10.15C20.84 10.79 21.2 11.66 21.2 12.57V18.5C21.2 20.16 19.86 21.5 18.2 21.5H14.8V15.8C14.8 14.25 13.55 13 12 13C10.45 13 9.2 14.25 9.2 15.8V21.5H5.8C4.14 21.5 2.8 20.16 2.8 18.5V12.57C2.8 11.66 3.16 10.79 3.8 10.15Z" />
    </svg>
  );
}

// 2. Soft Message / Chat Icon (Clean iOS rounded speech bubble with tail)
export function SoftGroupsIcon({ filled, className = "" }: SoftIconProps) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className={className}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 3C6.48 3 2 7.03 2 12C2 14.18 2.86 16.18 4.3 17.74C3.88 19.34 2.97 20.44 2.89 20.53C2.65 20.82 2.68 21.25 2.96 21.51C3.12 21.65 3.32 21.72 3.53 21.72C4.94 21.72 7.22 20.89 8.65 19.92C9.72 20.61 10.82 21 12 21C17.52 21 22 16.97 22 12C22 7.03 17.52 3 12 3Z"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12c0-4.418-4.03-8-9-8s-9 3.582-9 8c0 2.054.872 3.932 2.32 5.378-.292 1.543-1.07 2.69-1.083 2.709a.75.75 0 0 0 .763 1.163c1.65-.33 3.61-1.096 4.79-1.888A9.7 9.7 0 0 0 12 20c4.97 0 9-3.582 9-8z" />
    </svg>
  );
}

// 3. Soft Progress / Chart Icon (Smooth rounded capsule bars in Apple Health aesthetic)
export function SoftChartIcon({ filled, className = "" }: SoftIconProps) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" width="24" height="24" className={className}>
        <rect x="3.5" y="11" width="4" height="9.5" rx="2" fill="currentColor" />
        <rect x="10" y="3.5" width="4" height="17" rx="2" fill="currentColor" />
        <rect x="16.5" y="7.5" width="4" height="13" rx="2" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3.5" y="11" width="4" height="9.5" rx="2" />
      <rect x="10" y="3.5" width="4" height="17" rx="2" />
      <rect x="16.5" y="7.5" width="4" height="13" rx="2" />
    </svg>
  );
}

// 4. Soft Settings Icon (Rounded smooth gear with circular center)
export function SoftSettingsIcon({ filled, className = "" }: SoftIconProps) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className={className}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1zM12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

const TABS: { id: NavTabId; label: string; icon: React.ComponentType<SoftIconProps> }[] = [
  { id: "home", label: "Home", icon: SoftHomeIcon },
  { id: "groups", label: "Groups", icon: SoftGroupsIcon },
  { id: "progress", label: "Analytics", icon: SoftChartIcon },
  { id: "settings", label: "Settings", icon: SoftSettingsIcon },
];

export default function FloatingBottomNav({ activeTab, onChangeTab, onAddClick }: FloatingBottomNavProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-5 flex items-center justify-between pointer-events-none z-40 select-none">
      {/* Navigation tabs pill matching 0.5x / 1x camera connected tabs style */}
      <div
        className="pointer-events-auto bg-black/5 dark:bg-black/60 backdrop-blur-md p-1 rounded-full flex gap-1 items-center select-none shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-none border border-black/[0.04] dark:border-0"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`relative px-4 py-2.5 rounded-full flex items-center justify-center cursor-pointer select-none transition-colors duration-200 ${
                isActive
                  ? "text-white dark:text-black dark:keep-black font-bold"
                  : "text-[#8E8E93] hover:text-black dark:text-[#98989D] dark:hover:text-white"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavTabPill"
                  className="absolute inset-0 bg-black dark:bg-white dark:keep-white rounded-full -z-10 shadow-sm"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <IconComponent
                filled={isActive}
                className="w-[22px] h-[22px]"
              />
            </button>
          );
        })}
      </div>

      {/* Matching right circular plus button */}
      <motion.button
        id="bottom-nav-plus-btn"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        onClick={onAddClick}
        className="pointer-events-auto w-12 h-12 rounded-full bg-black/5 dark:bg-black/60 backdrop-blur-md border border-black/[0.04] dark:border-0 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-none flex items-center justify-center text-black dark:text-white hover:bg-black/10 dark:hover:bg-black/80 active:scale-95 transition-all cursor-pointer flex-shrink-0"
        aria-label="Add"
      >
        <Plus className="w-6 h-6 stroke-[2.4]" />
      </motion.button>
    </div>
  );
}

