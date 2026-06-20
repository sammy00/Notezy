"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  CheckCheck,
  Database,
  Download,
  Info,
  Keyboard,
  Palette,
  Settings,
  SlidersHorizontal,
  Upload,
  User,
  X,
} from "lucide-react";
import { AuthUser } from "@/features/auth/authClient";
import { useTheme } from "@/shared/theme/ThemeProvider";
import { showToast } from "@/shared/toast";

export type WorkspaceDialogType =
  | "settings"
  | "notifications"
  | "profile"
  | "usage"
  | "shortcuts";

type Props = {
  open: WorkspaceDialogType | null;
  user: AuthUser | null;
  notificationsRead?: boolean;
  onMarkNotificationsRead?: () => void;
  onClose: () => void;
};

type SettingsSection =
  | "general"
  | "appearance"
  | "editor"
  | "notifications"
  | "data"
  | "about";

type AppSettings = {
  defaultView: "list" | "grid";
  startPage: "all" | "favorites" | "pinned";
  autoSaveInterval: "1" | "2" | "5";
  compactMode: boolean;
  accentColor: "purple" | "blue" | "green";
  fontSize: "small" | "medium" | "large";
  fontFamily: "dm-sans" | "system";
  showWordCount: boolean;
  showReadingTime: boolean;
  autoFocus: boolean;
  markdown: boolean;
  reminders: boolean;
  desktopNotifications: boolean;
};

const SETTINGS_KEY = "notezy-app-settings";
const DEFAULT_SETTINGS: AppSettings = {
  defaultView: "list",
  startPage: "all",
  autoSaveInterval: "1",
  compactMode: false,
  accentColor: "purple",
  fontSize: "medium",
  fontFamily: "dm-sans",
  showWordCount: true,
  showReadingTime: true,
  autoFocus: true,
  markdown: true,
  reminders: true,
  desktopNotifications: false,
};

const SETTINGS_SECTIONS: Array<{
  id: SettingsSection;
  label: string;
  icon: typeof Settings;
}> = [
  { id: "general", label: "General", icon: Settings },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "editor", label: "Editor", icon: SlidersHorizontal },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "data", label: "Data", icon: Database },
  { id: "about", label: "About", icon: Info },
];

export default function WorkspaceDialog({
  open,
  user,
  notificationsRead = false,
  onMarkNotificationsRead,
  onClose,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 20000,
            display: "grid",
            placeItems: "center",
            padding: 18,
            background: "rgba(20,23,47,0.28)",
            backdropFilter: "blur(10px)",
          }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label={dialogTitle(open)}
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.23, ease: [0.22, 0.61, 0.36, 1] }}
            style={{
              position: "relative",
              width: open === "settings" ? "min(780px, 96vw)" : "min(480px, 96vw)",
              maxHeight: "min(720px, 90vh)",
              overflow: "hidden",
              borderRadius: 26,
              background: "#FFFCF6",
              border: "1px solid rgba(255,255,255,0.94)",
              boxShadow: "0 34px 90px rgba(42,39,78,0.28), inset 0 1px 0 #fff",
            }}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                zIndex: 3,
                width: 34,
                height: 34,
                border: "1px solid rgba(225,219,238,.9)",
                borderRadius: 11,
                display: "grid",
                placeItems: "center",
                color: "#59617E",
                background: "rgba(255,255,255,.74)",
                cursor: "pointer",
              }}
            >
              <X size={17} />
            </button>
            {open === "settings" && <SettingsContent />}
            {open === "notifications" && (
              <NotificationsContent
                read={notificationsRead}
                onMarkAllRead={onMarkNotificationsRead}
              />
            )}
            {open === "profile" && <ProfileContent user={user} />}
            {open === "usage" && <UsageContent user={user} />}
            {open === "shortcuts" && <ShortcutsContent />}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function SettingsContent() {
  const { mode, setMode } = useTheme();
  const [section, setSection] = useState<SettingsSection>("general");
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (saved) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((current) => {
      const next = { ...current, [key]: value };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
    showToast("Setting Updated");
  };

  return (
    <div className="notezy-settings-dialog-layout" style={{ display: "grid", gridTemplateColumns: "190px minmax(0, 1fr)", minHeight: 520 }}>
      <aside className="notezy-settings-sidebar" style={{ padding: 22, background: "#F6F2FA", borderRight: "1px solid #EAE4F0" }}>
        <h2 style={{ margin: "2px 0 18px", color: "#18254B", fontSize: 21 }}>Settings</h2>
        <div className="notezy-settings-tabs" style={{ display: "grid", gap: 5 }}>
          {SETTINGS_SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              style={{
                height: 38,
                padding: "0 10px",
                border: 0,
                borderRadius: 11,
                display: "flex",
                alignItems: "center",
                gap: 9,
                color: section === id ? "#6746D5" : "#626A87",
                background: section === id ? "rgba(139,92,246,.11)" : "transparent",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      </aside>
      <div className="notezy-settings-content" style={{ padding: "28px 30px", overflowY: "auto", maxHeight: "90vh" }}>
        <h3 style={{ margin: "0 0 5px", color: "#18254B", fontSize: 19 }}>
          {SETTINGS_SECTIONS.find((item) => item.id === section)?.label}
        </h3>
        <p style={{ margin: "0 0 22px", color: "#7A8199", fontSize: 12 }}>
          Customize how Notezy works for you.
        </p>
        {section === "general" && (
          <SettingsGroup>
            <SelectRow label="Default View" value={settings.defaultView} onChange={(value) => update("defaultView", value as AppSettings["defaultView"])} options={["list", "grid"]} />
            <SelectRow label="Start Page" value={settings.startPage} onChange={(value) => update("startPage", value as AppSettings["startPage"])} options={["all", "favorites", "pinned"]} />
            <SelectRow label="Auto Save Interval" value={settings.autoSaveInterval} onChange={(value) => update("autoSaveInterval", value as AppSettings["autoSaveInterval"])} options={["1", "2", "5"]} suffix=" sec" />
            <ToggleRow label="Compact Mode" value={settings.compactMode} onChange={(value) => update("compactMode", value)} />
          </SettingsGroup>
        )}
        {section === "appearance" && (
          <SettingsGroup>
            <SelectRow label="Theme" value={mode} onChange={(value) => setMode(value as "light" | "dark")} options={["light", "dark"]} />
            <SelectRow label="Accent Color" value={settings.accentColor} onChange={(value) => update("accentColor", value as AppSettings["accentColor"])} options={["purple", "blue", "green"]} />
            <SelectRow label="Font Size" value={settings.fontSize} onChange={(value) => update("fontSize", value as AppSettings["fontSize"])} options={["small", "medium", "large"]} />
            <SelectRow label="Font Family" value={settings.fontFamily} onChange={(value) => update("fontFamily", value as AppSettings["fontFamily"])} options={["dm-sans", "system"]} />
          </SettingsGroup>
        )}
        {section === "editor" && (
          <SettingsGroup>
            <ToggleRow label="Show Word Count" value={settings.showWordCount} onChange={(value) => update("showWordCount", value)} />
            <ToggleRow label="Show Reading Time" value={settings.showReadingTime} onChange={(value) => update("showReadingTime", value)} />
            <ToggleRow label="Auto Focus New Notes" value={settings.autoFocus} onChange={(value) => update("autoFocus", value)} />
            <ToggleRow label="Enable Markdown" value={settings.markdown} onChange={(value) => update("markdown", value)} />
          </SettingsGroup>
        )}
        {section === "notifications" && (
          <SettingsGroup>
            <ToggleRow label="Reminder Notifications" value={settings.reminders} onChange={(value) => update("reminders", value)} />
            <ToggleRow label="Desktop Notifications" value={settings.desktopNotifications} onChange={(value) => update("desktopNotifications", value)} />
            <SettingRow label="Email Notifications" description="Coming soon"><span style={{ color: "#9AA0B5", fontSize: 11, fontWeight: 800 }}>Future</span></SettingRow>
          </SettingsGroup>
        )}
        {section === "data" && (
          <SettingsGroup>
            <ActionRow icon={<Download size={16} />} label="Export Notes" action="Export" />
            <ActionRow icon={<Upload size={16} />} label="Import Notes" action="Import" />
            <ActionRow icon={<Database size={16} />} label="Backup Data" action="Backup" />
          </SettingsGroup>
        )}
        {section === "about" && (
          <SettingsGroup>
            <SettingRow label="Version"><strong style={{ fontSize: 12 }}>1.0.0</strong></SettingRow>
            <ActionRow icon={<Info size={16} />} label="Changelog" action="View" />
            <ActionRow icon={<Info size={16} />} label="Privacy Policy" action="View" />
          </SettingsGroup>
        )}
      </div>
    </div>
  );
}

function NotificationsContent({
  read,
  onMarkAllRead,
}: {
  read: boolean;
  onMarkAllRead?: () => void;
}) {
  const notifications = [
    { title: "Note reminder", body: "Review your pinned interview notes.", time: "Today" },
    { title: "Daily journal reminder", body: "Take a minute to capture your day.", time: "Yesterday" },
    { title: "Backup successful", body: "Your Notezy workspace is up to date.", time: "2 days ago" },
  ];
  return (
    <DialogBody icon={<Bell size={20} />} title="Notifications" subtitle="Simple updates from your workspace.">
      <div style={{ display: "grid", gap: 8 }}>
        {notifications.map((item, index) => (
          <div key={item.title} style={{ padding: 14, borderRadius: 15, display: "grid", gridTemplateColumns: "8px 1fr auto", gap: 10, alignItems: "start", background: !read && index === 0 ? "#F5F0FF" : "#F8F6F2", border: "1px solid #EEE8F0" }}>
            <span style={{ width: 7, height: 7, marginTop: 5, borderRadius: 99, background: !read && index === 0 ? "#8B5CF6" : "#B8B2C4" }} />
            <div><strong style={{ color: "#263052", fontSize: 12.5 }}>{item.title}</strong><p style={{ margin: "3px 0 0", color: "#737A92", fontSize: 11.5, lineHeight: 1.45 }}>{item.body}</p></div>
            <span style={{ color: "#9AA0B5", fontSize: 10 }}>{item.time}</span>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          onMarkAllRead?.();
          showToast("Notifications marked as read");
        }}
        disabled={read}
        style={{
          width: "100%",
          height: 38,
          marginTop: 14,
          border: "1px solid #E2DBEA",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          color: read ? "#999FAF" : "#6D4DE2",
          background: read ? "#F7F5F7" : "#FFFFFF",
          fontSize: 11.5,
          fontWeight: 850,
          cursor: read ? "default" : "pointer",
        }}
      >
        <CheckCheck size={15} />
        {read ? "All caught up" : "Mark all as read"}
      </button>
    </DialogBody>
  );
}

function ProfileContent({ user }: { user: AuthUser | null }) {
  const stats = useNoteStats(user);
  return (
    <DialogBody icon={<User size={20} />} title="My Profile" subtitle="Your Notezy account and workspace.">
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, borderRadius: 17, background: "#F6F2FA" }}>
        <Avatar user={user} size={50} />
        <div><strong style={{ color: "#202A51", fontSize: 15 }}>{user?.name ?? "Notezy User"}</strong><p style={{ margin: "3px 0 0", color: "#737A92", fontSize: 12 }}>{user?.email ?? "No email"}</p><span style={{ color: "#7C5CE0", fontSize: 10.5, fontWeight: 850 }}>Free Plan</span></div>
      </div>
      <h4 style={{ margin: "20px 0 9px", color: "#3E4665", fontSize: 12 }}>Profile Information</h4>
      <SettingsGroup>
        <SettingRow label="Name"><strong style={{ fontSize: 12 }}>{user?.name ?? "Notezy User"}</strong></SettingRow>
        <SettingRow label="Email"><strong style={{ fontSize: 12 }}>{user?.email ?? "No email"}</strong></SettingRow>
        <SettingRow label="Member Since"><strong style={{ fontSize: 12 }}>{formatMemberDate(user?.createdAt)}</strong></SettingRow>
      </SettingsGroup>
      <div style={{ marginTop: 14 }}><StatGrid stats={stats} /></div>
    </DialogBody>
  );
}

function UsageContent({ user }: { user: AuthUser | null }) {
  const stats = useNoteStats(user);
  return (
    <DialogBody icon={<Database size={20} />} title="Usage Statistics" subtitle="A quick look at your Notezy workspace.">
      <StatGrid stats={stats} />
      <div style={{ marginTop: 16, padding: 15, borderRadius: 16, background: "#F6F2FA", color: "#6D748D", fontSize: 12, lineHeight: 1.55 }}>
        You&apos;re building a useful personal knowledge base. Keep capturing the small ideas—they compound nicely.
      </div>
    </DialogBody>
  );
}

function ShortcutsContent() {
  return (
    <DialogBody icon={<Keyboard size={20} />} title="Keyboard Shortcuts" subtitle="Move through Notezy without leaving the keyboard.">
      <SettingsGroup>
        {[ ["Create a new note", "Ctrl", "N"], ["Focus search", "Ctrl", "K"], ["Save now", "Ctrl", "S"], ["Close dialog", "Esc", ""] ].map(([label, modifier, key]) => (
          <SettingRow key={label} label={label}>
            <span style={{ display: "flex", gap: 5 }}><Kbd>{modifier}</Kbd>{key && <Kbd>{key}</Kbd>}</span>
          </SettingRow>
        ))}
      </SettingsGroup>
    </DialogBody>
  );
}

function DialogBody({ icon, title, subtitle, children }: { icon: ReactNode; title: string; subtitle: string; children: ReactNode }) {
  return <div style={{ padding: "26px 28px 30px", overflowY: "auto", maxHeight: "90vh" }}><div style={{ display: "flex", alignItems: "center", gap: 10, color: "#6D4DE2" }}>{icon}<h2 style={{ margin: 0, color: "#18254B", fontSize: 21 }}>{title}</h2></div><p style={{ margin: "6px 0 20px", color: "#7A8199", fontSize: 12 }}>{subtitle}</p>{children}</div>;
}

function SettingsGroup({ children }: { children: ReactNode }) {
  return <div style={{ overflow: "hidden", borderRadius: 16, border: "1px solid #ECE6EF", background: "rgba(255,255,255,.72)" }}>{children}</div>;
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: ReactNode }) {
  return <div style={{ minHeight: 54, padding: "10px 13px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, borderBottom: "1px solid #F0EBF1" }}><div><div style={{ color: "#3A4262", fontSize: 12.5, fontWeight: 800 }}>{label}</div>{description && <div style={{ color: "#959AAD", fontSize: 10.5 }}>{description}</div>}</div>{children}</div>;
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return <SettingRow label={label}><button type="button" aria-pressed={value} onClick={() => onChange(!value)} style={{ width: 42, height: 24, padding: 3, border: 0, borderRadius: 99, display: "flex", justifyContent: value ? "flex-end" : "flex-start", background: value ? "#8B5CF6" : "#D9D5DE", cursor: "pointer" }}><span style={{ width: 18, height: 18, borderRadius: 99, background: "white", boxShadow: "0 2px 5px rgba(40,35,70,.2)" }} /></button></SettingRow>;
}

function SelectRow({ label, value, options, suffix = "", onChange }: { label: string; value: string; options: string[]; suffix?: string; onChange: (value: string) => void }) {
  return <SettingRow label={label}><select value={value} onChange={(event) => onChange(event.target.value)} style={{ height: 32, minWidth: 112, padding: "0 9px", border: "1px solid #DDD6E5", borderRadius: 10, color: "#555E7C", background: "#FFF", fontSize: 11.5, fontWeight: 750, textTransform: "capitalize" }}>{options.map((option) => <option key={option} value={option}>{option.replace("-", " ")}{suffix}</option>)}</select></SettingRow>;
}

function ActionRow({ icon, label, action }: { icon: ReactNode; label: string; action: string }) {
  return <SettingRow label={label}><button type="button" onClick={() => showToast(`${label} Ready`, "info")} style={{ height: 31, padding: "0 10px", border: "1px solid #DDD6E5", borderRadius: 10, display: "flex", alignItems: "center", gap: 6, color: "#6D4DE2", background: "#FFF", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>{icon}{action}</button></SettingRow>;
}

function Avatar({ user, size }: { user: AuthUser | null; size: number }) {
  const initials = user?.name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() ?? "N";
  return <div style={{ width: size, height: size, flexShrink: 0, borderRadius: "50%", display: "grid", placeItems: "center", color: "#FFF", background: "linear-gradient(135deg,#C4B5FD,#7C3AED)", fontSize: 13, fontWeight: 900, boxShadow: "0 10px 22px rgba(103,72,190,.22)" }}>{initials}</div>;
}

function StatGrid({ stats }: { stats: Array<{ label: string; value: number }> }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 9 }}>{stats.map((stat) => <div key={stat.label} style={{ padding: 14, borderRadius: 15, background: "#F8F5FA", border: "1px solid #EEE8F0" }}><strong style={{ display: "block", color: "#5F43C8", fontSize: 21 }}>{stat.value}</strong><span style={{ color: "#7C8298", fontSize: 10.5, fontWeight: 750 }}>{stat.label}</span></div>)}</div>;
}

function Kbd({ children }: { children: ReactNode }) {
  return <kbd style={{ minWidth: 27, height: 25, padding: "0 7px", borderRadius: 7, display: "grid", placeItems: "center", color: "#555E7C", background: "#F6F2FA", border: "1px solid #DED7E7", boxShadow: "0 2px 0 #D4CEDD", fontSize: 10.5, fontWeight: 850 }}>{children}</kbd>;
}

function useNoteStats(user: AuthUser | null) {
  return useMemo(() => {
    if (typeof window === "undefined") return defaultStats();
    try {
      const key = user?.id ? `notezy-notes-cache:${user.id}` : "notezy-notes-cache";
      const notes = JSON.parse(localStorage.getItem(key) ?? "[]") as Array<{ pinned?: boolean; category?: string; createdAt?: string }>;
      const categories = new Set(notes.map((note) => note.category).filter(Boolean));
      return [
        { label: "Notes Created", value: notes.length },
        { label: "Pinned Notes", value: notes.filter((note) => note.pinned).length },
        { label: "Categories", value: categories.size },
        { label: "Days Active", value: notes.length ? Math.max(1, new Set(notes.map((note) => note.createdAt?.slice(0, 10)).filter(Boolean)).size) : 0 },
      ];
    } catch {
      return defaultStats();
    }
  }, [user]);
}

const defaultStats = () => [
  { label: "Notes Created", value: 0 },
  { label: "Pinned Notes", value: 0 },
  { label: "Categories", value: 0 },
  { label: "Days Active", value: 0 },
];

const dialogTitle = (type: WorkspaceDialogType) => ({ settings: "Settings", notifications: "Notifications", profile: "My Profile", usage: "Usage Statistics", shortcuts: "Keyboard Shortcuts" })[type];
const formatMemberDate = (date?: string) => date ? new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(date)) : "Current account";
