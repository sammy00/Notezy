"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Moon, Search, Settings, Sun, X } from "lucide-react";
import { motion } from "framer-motion";
import {
  clearAuthSession,
  getStoredAuthToken,
  getStoredAuthUser,
} from "@/features/auth/authClient";
import { useTheme } from "@/shared/theme/ThemeProvider";
import { designSystem } from "@/shared/theme/DesignSystem";
import { showToast } from "@/shared/toast";
import PwaInstallButton from "@/components/ui/PwaInstallButton";
import WorkspaceDialog, {
  WorkspaceDialogType,
} from "@/components/ui/WorkspaceDialog";
import { usePathname } from "next/navigation";

const ACTIONS = [
  {
    label: "Settings",
    icon: Settings,
  },
  {
    label: "Notifications",
    icon: Bell,
    dot: true,
  },
];

const NOTE_SEARCH_EVENT = "notezy:set-note-search";
const FOCUS_SEARCH_EVENT = "notezy:focus-search";
const NOTIFICATIONS_READ_KEY = "notezy-notifications-read-version";
const NOTIFICATIONS_VERSION = "1";

function ProfileMenuButton({
  label,
  danger,
  onClick,
}: {
  label: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        height: 32,
        border: "none",
        borderRadius: 10,
        padding: "0 10px",
        background: "transparent",
        color: danger ? "#D94D5B" : "rgba(32,40,77,0.82)",
        fontSize: 12,
        fontWeight: 800,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      {label}
    </button>
  );
}

function ProfileInfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        padding: "6px 4px",
      }}
    >
      <span
        style={{
          color: "rgba(67,75,119,0.55)",
          fontSize: 10.5,
          fontWeight: 800,
        }}
      >
        {label}
      </span>
      <span
        style={{
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          color: "rgba(32,40,77,0.84)",
          fontSize: 11,
          fontWeight: 800,
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function Navbar() {
  const { mode, colors, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [authUser, setAuthUser] = useState(() => getStoredAuthUser());
  const [profileOpen, setProfileOpen] = useState(false);
  const [workspaceDialog, setWorkspaceDialog] =
    useState<WorkspaceDialogType | null>(null);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [profileView, setProfileView] = useState<
    "menu" | "profile" | "logout"
  >("menu");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const isLoggedIn = Boolean(getStoredAuthToken());
  const profileName = authUser?.name ?? "Sign in";
  const initials =
    authUser?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "N";

  const updateSearch = (value: string) => {
    setSearchQuery(value);
    window.dispatchEvent(
      new CustomEvent(NOTE_SEARCH_EVENT, { detail: { query: value } }),
    );
  };

  const markNotificationsRead = () => {
    localStorage.setItem(NOTIFICATIONS_READ_KEY, NOTIFICATIONS_VERSION);
    setHasUnreadNotifications(false);
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setHasUnreadNotifications(
        localStorage.getItem(NOTIFICATIONS_READ_KEY) !== NOTIFICATIONS_VERSION,
      );
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }

      if (event.key === "Escape" && document.activeElement === searchInputRef.current) {
        updateSearch("");
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleShortcut);

    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    const focusSearch = () => searchInputRef.current?.focus();

    window.addEventListener(FOCUS_SEARCH_EVENT, focusSearch);
    return () => window.removeEventListener(FOCUS_SEARCH_EVENT, focusSearch);
  }, []);

  useEffect(() => {
    if (!profileOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
        setProfileView("menu");
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setProfileView("menu");
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [profileOpen]);

  useEffect(() => {
    const handleSearchSync = (event: Event) => {
      const query = (event as CustomEvent<{ query?: string }>).detail?.query;

      if (typeof query === "string") {
        setSearchQuery(query);
      }
    };

    window.addEventListener(NOTE_SEARCH_EVENT, handleSearchSync);

    return () =>
      window.removeEventListener(NOTE_SEARCH_EVENT, handleSearchSync);
  }, []);

  useEffect(() => {
    const syncAuthUser = () => setAuthUser(getStoredAuthUser());

    window.addEventListener("notezy:auth-changed", syncAuthUser);

    return () => window.removeEventListener("notezy:auth-changed", syncAuthUser);
  }, []);

  useEffect(() => {
    const openWorkspaceDialog = (event: Event) => {
      const dialog = (event as CustomEvent<{ dialog?: WorkspaceDialogType }>)
        .detail?.dialog;
      if (dialog) {
        if (dialog === "notifications") {
          localStorage.setItem(NOTIFICATIONS_READ_KEY, NOTIFICATIONS_VERSION);
          setHasUnreadNotifications(false);
        }
        setWorkspaceDialog(dialog);
      }
    };

    window.addEventListener("notezy:open-workspace-dialog", openWorkspaceDialog);
    return () =>
      window.removeEventListener(
        "notezy:open-workspace-dialog",
        openWorkspaceDialog,
      );
  }, []);

  const logout = () => {
    clearAuthSession();
    setProfileOpen(false);
    setProfileView("menu");
    window.location.replace("/login");
  };

  const searchGlass =
    mode === "light"
      ? {
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.72), rgba(246,246,252,0.42))",
          border: "1px solid rgba(255,255,255,0.76)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.92), 0 4px 20px rgba(0,0,0,.03), 0 12px 24px rgba(90,95,140,0.08)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
        }
      : designSystem.glass.dark.primary;

  const actionGlass =
    mode === "light"
      ? {
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.64), rgba(244,244,251,0.42))",
          border: "1px solid rgba(255,255,255,0.72)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.88), inset 0 -1px 2px rgba(104,96,145,0.07), 0 12px 24px rgba(82,88,132,0.09)",
          backdropFilter: "blur(22px) saturate(175%)",
          WebkitBackdropFilter: "blur(22px) saturate(175%)",
        }
      : designSystem.glass.dark.primary;

  return (
    <div className="relative w-full">
      <div className="notezy-navbar-row flex items-center justify-between gap-4">
        <motion.div
          whileHover={{ y: -1 }}
          transition={{ type: "spring", stiffness: 240, damping: 20 }}
          className="notezy-search-bar flex min-w-0 flex-1 max-w-[400px] items-center gap-3 px-[22px]"
          style={{
            ...searchGlass,
            ...(mode === "dark"
              ? {
                  background: "rgba(255,255,255,0.05)",
                  border: searchFocused
                    ? "1px solid #A78BFA"
                    : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: searchFocused
                    ? "inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 3px rgba(167,139,250,0.10), 0 14px 28px rgba(5,10,24,0.22)"
                    : "inset 0 1px 0 rgba(255,255,255,0.08), 0 12px 24px rgba(5,10,24,0.18)",
                  backdropFilter: "blur(18px) saturate(150%)",
                  WebkitBackdropFilter: "blur(18px) saturate(150%)",
                }
              : {}),
            height: 50,
            borderRadius: 18,
          }}
        >
          <Search
            size={20}
            color={searchFocused ? "#C4B5FD" : mode === "dark" ? "#AAB6CC" : "#61708F"}
            strokeWidth={2.2}
          />

          <input
            ref={searchInputRef}
            value={searchQuery}
            placeholder={pathname === "/app/tasks" ? "Search tasks" : "Search notes"}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onChange={(event) => updateSearch(event.target.value)}
            className="min-w-0 flex-1 bg-transparent outline-none"
            style={{
              color: colors.textPrimary,
              fontSize: designSystem.typography.body,
              fontWeight: designSystem.typography.weights.medium,
              letterSpacing: 0,
            }}
          />

          {searchQuery ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                updateSearch("");
                searchInputRef.current?.focus();
              }}
              style={{
                width: 26,
                height: 26,
                border: "none",
                borderRadius: 999,
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                color:
                  mode === "light"
                    ? "rgba(55,64,98,0.62)"
                    : colors.textMuted,
                background:
                  mode === "light"
                    ? "rgba(255,255,255,0.62)"
                    : "rgba(255,255,255,0.075)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.70), 0 1px 2px rgba(70,78,120,0.06)",
              }}
            >
              <X size={14} strokeWidth={2.4} />
            </button>
          ) : (
            <kbd
              className="hidden sm:flex items-center gap-1 px-2.5 py-[4px]"
              style={{
                borderRadius: 999,
                background:
                  mode === "light"
                    ? "linear-gradient(180deg, rgba(255,255,255,0.72), rgba(246,241,232,0.54))"
                    : "rgba(255,255,255,0.075)",
                color:
                  mode === "light" ? "rgba(55,64,98,0.62)" : colors.textMuted,
                fontSize: 11,
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: 0,
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.70), 0 1px 2px rgba(70,78,120,0.06), 0 0 0 1px rgba(139,92,246,0.06)",
              }}
            >
              <span>Ctrl</span>
              <span>K</span>
            </kbd>
          )}
        </motion.div>

        <div className="notezy-navbar-actions flex shrink-0 items-center" style={{ gap: 14 }}>
          {ACTIONS.map(({ label, icon: Icon, dot }) => (
            <motion.button
              key={label}
              type="button"
              aria-label={label}
              title={label}
              onClick={() => {
                setProfileOpen(false);
                const dialog =
                  label === "Settings" ? "settings" : "notifications";
                if (dialog === "notifications") markNotificationsRead();
                setWorkspaceDialog(dialog);
              }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="relative grid place-items-center"
              style={{
                ...actionGlass,
                ...(mode === "dark"
                  ? {
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.095), rgba(255,255,255,0.052))",
                      border: "1px solid rgba(255,255,255,0.13)",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.13), 0 14px 30px rgba(0,0,0,0.18), 0 0 18px rgba(167,139,250,0.08)",
                    }
                  : {}),
                width: 48,
                height: 48,
                borderRadius: 16,
              }}
            >
              <Icon
                size={20}
                color={mode === "light" ? "#24315F" : colors.textMuted}
                strokeWidth={2.2}
              />

              {dot && hasUnreadNotifications && (
                <span
                  aria-label="Unread notifications"
                  className="absolute rounded-full"
                  style={{
                    width: 9,
                    height: 9,
                    top: 8,
                    right: 10,
                    background: "#8B5CF6",
                    boxShadow:
                      "0 0 0 3px rgba(255,255,255,0.90), 0 2px 8px rgba(139,92,246,0.38)",
                  }}
                />
              )}
            </motion.button>
          ))}

          <PwaInstallButton />

          <motion.button
            type="button"
            aria-label={mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title={mode === "dark" ? "Light theme" : "Dark theme"}
            onClick={() => {
              toggleTheme();
              showToast("Theme Updated");
            }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 240, damping: 20 }}
            className="notezy-theme-toggle flex shrink-0 items-center justify-center"
            style={{
              ...actionGlass,
              ...(mode === "dark"
                ? {
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.095), rgba(255,255,255,0.052))",
                    border: "1px solid rgba(255,255,255,0.13)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.13), 0 14px 30px rgba(0,0,0,0.18), 0 0 18px rgba(167,139,250,0.08)",
                  }
                : {}),
              width: 48,
              height: 48,
              borderRadius: 16,
              padding: 0,
              cursor: "pointer",
            }}
          >
            <span
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 999,
                display: "grid",
                placeItems: "center",
                background: "transparent",
                color:
                  mode === "light"
                    ? "#7C3AED"
                    : "#C4B5FD",
              }}
            >
              {mode === "dark" ? (
                <Moon size={20} strokeWidth={2.2} />
              ) : (
                <Sun size={20} strokeWidth={2.2} />
              )}
            </span>
          </motion.button>

          <div className="relative" ref={profileMenuRef}>
            <motion.button
              type="button"
              aria-label="Open profile menu"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              onClick={() => {
                setProfileOpen((open) => {
                  const nextOpen = !open;

                  if (nextOpen) {
                    setProfileView("menu");
                  }

                  return nextOpen;
                });
              }}
              className="grid place-items-center"
              style={{
                ...actionGlass,
                ...(mode === "dark"
                  ? {
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.095), rgba(255,255,255,0.052))",
                      border: "1px solid rgba(255,255,255,0.13)",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.13), 0 14px 30px rgba(0,0,0,0.18), 0 0 18px rgba(167,139,250,0.08)",
                    }
                  : {}),
                width: 48,
                height: 48,
                borderRadius: 16,
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #C4B5FD, #7C3AED)",
                  display: "grid",
                  placeItems: "center",
                  color: "white",
                  fontSize: 10,
                  fontWeight: 850,
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.48), 0 8px 18px rgba(103,72,190,0.22)",
                }}
              >
                {initials}
              </span>
            </motion.button>

            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 4, scale: 0.96, filter: "blur(5px)" }}
                transition={{ duration: 0.16, ease: [0.22, 0.61, 0.36, 1] }}
                style={{
                  position: "absolute",
                  right: 0,
                  top: 58,
                  zIndex: 250,
                  width: 246,
                  padding: 9,
                  borderRadius: 17,
                  background: "#FFFCF6",
                  border: "1px solid rgba(231,224,214,0.96)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,1), 0 18px 36px rgba(50,42,78,0.18), 0 3px 10px rgba(50,42,78,0.10)",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    right: 18,
                    top: -6,
                    width: 12,
                    height: 12,
                    transform: "rotate(45deg)",
                    background: "#FFFCF6",
                    borderLeft: "1px solid rgba(231,224,214,0.96)",
                    borderTop: "1px solid rgba(231,224,214,0.96)",
                  }}
                />
                {isLoggedIn && profileView === "menu" ? (
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "6px 7px 10px",
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #C4B5FD, #7C3AED)",
                          display: "grid",
                          placeItems: "center",
                          color: "white",
                          fontSize: 11,
                          fontWeight: 850,
                          boxShadow:
                            "inset 0 1px 0 rgba(255,255,255,0.48), 0 8px 18px rgba(103,72,190,0.22)",
                          flexShrink: 0,
                        }}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p
                          className="m-0 truncate text-[12px] font-black leading-tight"
                          style={{ color: "#1f2b56" }}
                        >
                          {profileName}
                        </p>
                        <p
                          className="m-0 truncate text-[10px] font-semibold leading-tight"
                          style={{ color: "#7D7895" }}
                        >
                          Free Plan
                        </p>
                      </div>
                    </div>
                    <div
                      style={{
                        height: 1,
                        margin: "0 2px 6px",
                        background: "rgba(223,219,239,0.92)",
                      }}
                    />
                    <ProfileMenuButton
                      label="View Profile"
                      onClick={() => {
                        setProfileOpen(false);
                        setWorkspaceDialog("profile");
                      }}
                    />
                    <ProfileMenuButton
                      label="Usage Statistics"
                      onClick={() => {
                        setProfileOpen(false);
                        setWorkspaceDialog("usage");
                      }}
                    />
                    <ProfileMenuButton
                      label="Keyboard Shortcuts"
                      onClick={() => {
                        setProfileOpen(false);
                        setWorkspaceDialog("shortcuts");
                      }}
                    />
                    <ProfileMenuButton
                      danger
                      label="Logout"
                      onClick={() => setProfileView("logout")}
                    />
                  </>
                ) : isLoggedIn && profileView === "profile" ? (
                  <>
                    <ProfileMenuButton
                      label="Back"
                      onClick={() => setProfileView("menu")}
                    />
                    <div
                      style={{
                        height: 1,
                        margin: "4px 2px 6px",
                        background: "rgba(223,219,239,0.92)",
                      }}
                    />
                    <ProfileInfoRow label="Name" value={authUser?.name ?? "Notezy User"} />
                    <ProfileInfoRow label="Email" value={authUser?.email ?? "No email"} />
                    <ProfileInfoRow label="Member Since" value="Current account" />
                    <ProfileInfoRow label="Plan" value="Free Plan" />
                  </>
                ) : isLoggedIn && profileView === "logout" ? (
                  <>
                    <div style={{ padding: "4px 5px 8px" }}>
                      <p
                        className="m-0 text-[13px] font-black"
                        style={{ color: "#1f2b56" }}
                      >
                        Logout?
                      </p>
                      <p
                        className="m-0 mt-1 text-[11px] font-semibold leading-snug"
                        style={{ color: "rgba(67,75,119,0.62)" }}
                      >
                        You will need to sign in again to access your saved notes.
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 8, padding: "0 2px 2px" }}>
                      <button
                        type="button"
                        onClick={() => setProfileView("menu")}
                        style={{
                          flex: 1,
                          height: 32,
                          border: "1px solid rgba(226,219,210,0.92)",
                          borderRadius: 11,
                          background: "rgba(255,255,255,0.72)",
                          color: "#4C5676",
                          fontSize: 12,
                          fontWeight: 850,
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={logout}
                        style={{
                          flex: 1,
                          height: 32,
                          border: "none",
                          borderRadius: 11,
                          background: "#EF4444",
                          color: "#FFFFFF",
                          fontSize: 12,
                          fontWeight: 850,
                          cursor: "pointer",
                          boxShadow: "0 10px 20px rgba(239,68,68,0.22)",
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <ProfileMenuButton
                      label="Sign in"
                      onClick={() => window.location.assign("/login")}
                    />
                    <ProfileMenuButton
                      label="Create account"
                      onClick={() => window.location.assign("/signup")}
                    />
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div
        className="mt-5 h-px w-full"
        style={{
          background:
            mode === "light"
              ? "linear-gradient(90deg, rgba(210,214,228,0), rgba(210,214,228,0.82), rgba(210,214,228,0))"
              : "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.12), rgba(255,255,255,0))",
        }}
      />
      <WorkspaceDialog
        open={workspaceDialog}
        user={authUser}
        notificationsRead={!hasUnreadNotifications}
        onMarkNotificationsRead={markNotificationsRead}
        onClose={() => setWorkspaceDialog(null)}
      />
    </div>
  );
}
