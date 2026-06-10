"use client";

import {
  ChevronsLeft, ChevronsRight, FileText, Star,Pin, CheckSquare, Bell, Calendar, User, Briefcase, BookOpen, Map, Trash2, Plus, Sun, LucideIcon, Pencil,
} from "lucide-react";

import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence, DragControls } from "framer-motion";
import WindowBar from "./WindowBar";
import { useTheme } from "@/shared/theme/ThemeProvider";
import { useRouter } from "next/navigation";
import {
  clearAuthSession,
  getStoredAuthToken,
  getStoredAuthUser,
} from "@/features/auth/authClient";



type Props = {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  onMinimize: () => void;
  onMaximize: (state: boolean) => void;
  onClose: () => void;
  maximized: boolean;
  dragControls: DragControls;
};

const NEW_NOTE_EVENT = "notezy:create-note";
const NOTE_FILTER_EVENT = "notezy:set-note-filter";
const NOTE_CATEGORY_EVENT = "notezy:update-note-category";
const CUSTOM_CATEGORIES_KEY = "notezy-custom-categories";

type SidebarItem = {
  label: string;
  icon: LucideIcon;
};

const MAIN_ITEMS: SidebarItem[] = [
  { label: "All Notes", icon: FileText },
  { label: "Favorites", icon: Star },
  { label: "Pinned", icon: Pin },
  { label: "Tasks", icon: CheckSquare },
  { label: "Reminders", icon: Bell },
  { label: "Calendar", icon: Calendar },
];

const CATEGORY_ITEMS: SidebarItem[] = [
  { label: "Personal", icon: User },
  { label: "Work", icon: Briefcase },
  { label: "Journal", icon: BookOpen },
  { label: "Ideas", icon: Map },
];

function readCustomCategories() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const saved = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    const parsed = saved ? JSON.parse(saved) : [];

    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

function saveCustomCategories(categories: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(categories));
}

/* ── Portal tooltip ── */
function PortalTooltip({
  label,
  anchorRect,
  show,
}: {
  label: string;
  anchorRect: DOMRect | null;
  show: boolean;
}) {
  if (typeof window === "undefined" || !anchorRect) return null;
  return ReactDOM.createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -6 }}
          transition={{ duration: 0.13 }}
          style={{
            position: "fixed",
            top: anchorRect.top + anchorRect.height / 2,
            left: anchorRect.right + 10,
            transform: "translateY(-50%)",
            zIndex: 9999,
            pointerEvents: "none",
            background: "rgba(255,255,255,0.97)",
            border: "1px solid rgba(200,195,230,0.5)",
            borderRadius: 10,
            padding: "5px 12px",
            fontSize: 12,
            fontWeight: 600,
            color: "#2d3560",
            boxShadow: "0 8px 24px rgba(65,60,110,0.16)",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ── Nav button ── */
function SidebarButton({
  item,
  active,
  collapsed,
  onClick,
  mode,
}: {
  item: SidebarItem;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
  mode: "light" | "dark";
}) {
  const Icon = item.icon;
  const [hovered, setHovered] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  

  return (
    <>
      <motion.button
        onClick={onClick}
        onMouseEnter={(e) => {
          setHovered(true);
          setAnchorRect(e.currentTarget.getBoundingClientRect());
        }}
        onMouseLeave={() => {
          setHovered(false);
          setAnchorRect(null);
        }}
        whileHover={{
          x: collapsed ? 0 : 2,
          backgroundColor: active ? undefined : "rgba(255,255,255,0.09)",
        }}
        whileTap={{ scale: 0.985 }}
        transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
        className="relative flex h-[35px] w-full items-center rounded-[13px] transition-colors duration-200"
        style={{
          justifyContent: collapsed ? "center" : "flex-start",
          gap: collapsed ? 0 : 11,
          padding: collapsed ? 0 : "0 13px",
          background: active
            ? mode === "dark"
              ? "linear-gradient(90deg, rgba(139,92,246,0.38), rgba(139,92,246,0.16) 58%, rgba(139,92,246,0.05))"
              : "linear-gradient(90deg, rgba(238,232,255,0.86), rgba(238,232,255,0.48))"
            : hovered
              ? mode === "dark"
                ? "rgba(255,255,255,0.075)"
                : "rgba(255,255,255,0.52)"
              : "transparent",
          boxShadow: active
            ? mode === "dark"
              ? "inset 0 1px 0 rgba(255,255,255,0.18), 0 0 24px rgba(139,92,246,0.16)"
              : "inset 0 1px 0 rgba(255,255,255,0.76), 0 4px 12px rgba(139,92,246,0.08)"
            : "none",
        }}
      >
        {active && !collapsed && (
          <span
            className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full"
            style={{
              background: "#8B5CF6",
              boxShadow: "0 0 16px rgba(139,92,246,0.45)",
            }}
          />
        )}
        <Icon
          size={16}
          strokeWidth={2.1}
          style={{
            color:
              mode === "dark"
                  ? active
                    ? "#DED3FF"
                    : hovered
                    ? "#F8FAFC"
                    : "#AAB6CC"
                : active
                  ? "#8B5CF6"
                  : hovered
                    ? "#3d4870"
                    : "#5b6786",
            flexShrink: 0,
          }}
        />
        {/* Label fades in/out smoothly */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
              className="whitespace-nowrap text-[13px] font-semibold leading-none"
              style={{
                color:
                  mode === "dark"
                    ? active
                      ? "#F8FAFC"
                      : hovered
                        ? "#E8EEFC"
                        : "#AAB6CC"
                    : active
                      ? "#5B4CC4"
                      : "#4c5676",
              }}
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {collapsed && (
        <PortalTooltip
          label={item.label}
          anchorRect={anchorRect}
          show={hovered && !!anchorRect}
        />
      )}
    </>
  );
}

function CustomCategoryRow({
  category,
  active,
  collapsed,
  mode,
  isRenaming,
  renameValue,
  onSelect,
  onRenameValueChange,
  onRename,
  onRenameSave,
  onRenameCancel,
  onDelete,
}: {
  category: string;
  active: boolean;
  collapsed: boolean;
  mode: "light" | "dark";
  isRenaming: boolean;
  renameValue: string;
  onSelect: () => void;
  onRenameValueChange: (value: string) => void;
  onRename: () => void;
  onRenameSave: () => void;
  onRenameCancel: () => void;
  onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  if (collapsed) {
    return (
      <SidebarButton
        item={{ label: category, icon: Map }}
        active={active}
        collapsed={collapsed}
        onClick={onSelect}
        mode={mode}
      />
    );
  }

  if (isRenaming) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -3 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex h-[35px] w-full items-center rounded-[13px] px-[13px]"
        style={{
          gap: 11,
          background:
            mode === "dark"
              ? "rgba(255,255,255,0.075)"
              : "rgba(255,255,255,0.56)",
          boxShadow:
            mode === "dark"
              ? "inset 0 1px 0 rgba(255,255,255,0.10)"
              : "inset 0 1px 0 rgba(255,255,255,0.74)",
        }}
      >
        <Map
          size={16}
          strokeWidth={2.1}
          style={{ color: mode === "dark" ? "#AAB6CC" : "#8B5CF6" }}
        />
        <input
          autoFocus
          value={renameValue}
          onChange={(event) => onRenameValueChange(event.target.value)}
          onBlur={onRenameSave}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onRenameSave();
            }

            if (event.key === "Escape") {
              onRenameCancel();
            }
          }}
          className="min-w-0 flex-1 bg-transparent outline-none"
          style={{
            color: mode === "dark" ? "#E8EEFC" : "#4c5676",
            fontSize: 13,
            fontWeight: 650,
            letterSpacing: 0,
          }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{
        x: 2,
        backgroundColor: active ? undefined : "rgba(255,255,255,0.09)",
      }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
      className="relative flex h-[35px] w-full items-center rounded-[13px] transition-colors duration-200"
      style={{
        gap: 11,
        padding: "0 11px 0 13px",
        cursor: "pointer",
        background: active
          ? mode === "dark"
            ? "linear-gradient(90deg, rgba(139,92,246,0.38), rgba(139,92,246,0.16) 58%, rgba(139,92,246,0.05))"
            : "linear-gradient(90deg, rgba(238,232,255,0.86), rgba(238,232,255,0.48))"
          : hovered
            ? mode === "dark"
              ? "rgba(255,255,255,0.075)"
              : "rgba(255,255,255,0.52)"
            : "transparent",
        boxShadow: active
          ? mode === "dark"
            ? "inset 0 1px 0 rgba(255,255,255,0.18), 0 0 24px rgba(139,92,246,0.16)"
            : "inset 0 1px 0 rgba(255,255,255,0.76), 0 4px 12px rgba(139,92,246,0.08)"
          : "none",
      }}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full"
          style={{
            background: "#8B5CF6",
            boxShadow: "0 0 16px rgba(139,92,246,0.45)",
          }}
        />
      )}
      <Map
        size={16}
        strokeWidth={2.1}
        style={{
          color:
            mode === "dark"
              ? active
                ? "#DED3FF"
                : hovered
                  ? "#F8FAFC"
                  : "#AAB6CC"
              : active
                ? "#8B5CF6"
                : hovered
                  ? "#3d4870"
                  : "#5b6786",
          flexShrink: 0,
        }}
      />
      <span
        className="min-w-0 flex-1 truncate whitespace-nowrap text-[13px] font-semibold leading-none"
        style={{
          color:
            mode === "dark"
              ? active
                ? "#F8FAFC"
                : hovered
                  ? "#E8EEFC"
                  : "#AAB6CC"
              : active
                ? "#5B4CC4"
                : "#4c5676",
        }}
      >
        {category}
      </span>
      <motion.div
        animate={{ opacity: hovered || active ? 1 : 0.68 }}
        transition={{ duration: 0.16 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          flexShrink: 0,
        }}
      >
        <motion.button
          type="button"
          aria-label={`Rename ${category}`}
          title="Rename"
          whileHover={{ y: -1, rotate: -5, scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          transition={{ duration: 0.16, ease: [0.22, 0.61, 0.36, 1] }}
          onClick={(event) => {
            event.stopPropagation();
            onRename();
          }}
          style={{
            width: 22,
            height: 22,
            border: "none",
            borderRadius: 8,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            color: active ? "#7C3AED" : "rgba(79,86,124,0.72)",
            background:
              hovered || active
                ? mode === "dark"
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(255,255,255,0.58)"
                : "transparent",
          }}
        >
          <Pencil size={13.5} strokeWidth={2.2} />
        </motion.button>
        <motion.button
          type="button"
          aria-label={`Delete ${category}`}
          title="Delete"
          whileHover={{ y: -1, rotate: 5, scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          transition={{ duration: 0.16, ease: [0.22, 0.61, 0.36, 1] }}
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          style={{
            width: 22,
            height: 22,
            border: "none",
            borderRadius: 8,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            color: "#D94D5B",
            background:
              hovered || active
                ? mode === "dark"
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(255,255,255,0.58)"
                : "transparent",
          }}
        >
          <Trash2 size={13.5} strokeWidth={2.2} />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

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
        height: 31,
        border: "none",
        borderRadius: 10,
        padding: "0 9px",
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

/* ════════════════════════
   SIDEBAR
════════════════════════ */
export default function Sidebar({
  collapsed,
  setCollapsed,
  onMinimize,
  onMaximize,
  onClose,
  maximized,
  dragControls,
}: Props) {

  const router = useRouter();
  const { mode } = useTheme();

  const [active, setActive] = useState("All Notes");
  const [authUser, setAuthUser] = useState(() => getStoredAuthUser());
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileMenuView, setProfileMenuView] = useState<
    "menu" | "profile" | "settings" | "logout"
  >("menu");
  const [customCategories, setCustomCategories] = useState<string[]>(() =>
    readCustomCategories(),
  );
  const [addingCategory, setAddingCategory] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [renamingCategory, setRenamingCategory] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState("");

  const [brightness, setBrightness] =
    useState(0.8);
  const isLoggedIn = Boolean(getStoredAuthToken());
  const profileName = authUser?.name ?? "Sign in";
  const initials =
    authUser?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "N";

  useEffect(() => {
    const syncAuthUser = () => setAuthUser(getStoredAuthUser());

    window.addEventListener("notezy:auth-changed", syncAuthUser);

    return () => window.removeEventListener("notezy:auth-changed", syncAuthUser);
  }, []);

  const logout = () => {
    clearAuthSession();
    setProfileMenuOpen(false);
    setProfileMenuView("menu");
    router.replace("/login");
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen((open) => {
      const nextOpen = !open;

      if (nextOpen) {
        setProfileMenuView("menu");
      }

      return nextOpen;
    });
  };

  const createNewNote = () => {
    window.dispatchEvent(new Event(NEW_NOTE_EVENT));
    window.dispatchEvent(
      new CustomEvent(NOTE_FILTER_EVENT, { detail: { filter: "all" } }),
    );
    setActive("All Notes");
  };

  const selectSidebarItem = (label: string) => {
    setActive(label);

    const filterByLabel: Record<string, string> = {
      "All Notes": "all",
      Favorites: "favorites",
      Pinned: "pinned",
    };

    const filter = filterByLabel[label];

    if (filter) {
      window.dispatchEvent(
        new CustomEvent(NOTE_FILTER_EVENT, { detail: { filter } }),
      );
    }
  };

  const selectCategory = (category: string) => {
    setActive(category);
    window.dispatchEvent(
      new CustomEvent(NOTE_FILTER_EVENT, {
        detail: { filter: "category", category },
      }),
    );
  };

  const addCategory = () => {
    const nextCategory = categoryName.trim();

    if (!nextCategory) {
      setAddingCategory(false);
      return;
    }

    const existingCategories = [
      ...CATEGORY_ITEMS.map((item) => item.label),
      ...customCategories,
    ];
    const alreadyExists = existingCategories.some(
      (category) => category.toLowerCase() === nextCategory.toLowerCase(),
    );

    if (alreadyExists) {
      setCategoryName("");
      setAddingCategory(false);
      selectCategory(nextCategory);
      return;
    }

    const nextCategories = [...customCategories, nextCategory];
    setCustomCategories(nextCategories);
    saveCustomCategories(nextCategories);
    setCategoryName("");
    setAddingCategory(false);
    selectCategory(nextCategory);
  };

  const startRenameCategory = (category: string) => {
    setRenamingCategory(category);
    setRenameValue(category);
  };

  const saveRenamedCategory = () => {
    const oldCategory = renamingCategory;
    const nextCategory = renameValue.trim();

    if (!oldCategory) {
      return;
    }

    if (!nextCategory || nextCategory === oldCategory) {
      setRenamingCategory("");
      setRenameValue("");
      return;
    }

    const existingCategories = [
      ...CATEGORY_ITEMS.map((item) => item.label),
      ...customCategories.filter((category) => category !== oldCategory),
    ];
    const alreadyExists = existingCategories.some(
      (category) => category.toLowerCase() === nextCategory.toLowerCase(),
    );

    if (alreadyExists) {
      setRenamingCategory("");
      setRenameValue("");
      selectCategory(nextCategory);
      return;
    }

    const nextCategories = customCategories.map((category) =>
      category === oldCategory ? nextCategory : category,
    );
    setCustomCategories(nextCategories);
    saveCustomCategories(nextCategories);
    setRenamingCategory("");
    setRenameValue("");
    setActive(nextCategory);
    window.dispatchEvent(
      new CustomEvent(NOTE_CATEGORY_EVENT, {
        detail: { action: "rename", oldCategory, newCategory: nextCategory },
      }),
    );
    selectCategory(nextCategory);
  };

  const confirmDeleteCategory = () => {
    if (!categoryToDelete) {
      return;
    }

    const nextCategories = customCategories.filter(
      (category) => category !== categoryToDelete,
    );
    setCustomCategories(nextCategories);
    saveCustomCategories(nextCategories);
    window.dispatchEvent(
      new CustomEvent(NOTE_CATEGORY_EVENT, {
        detail: { action: "delete", category: categoryToDelete },
      }),
    );
    setCategoryToDelete("");
    setActive("All Notes");
    window.dispatchEvent(
      new CustomEvent(NOTE_FILTER_EVENT, { detail: { filter: "all" } }),
    );
  };

  return (
<div
  className="
    flex
    h-full
    w-full
    flex-col
    overflow-hidden
  "
  style={{
    position: "relative",
    padding: "24px 20px 14px",

    borderRadius: 34,

    background:
      mode === "light"
        ? "linear-gradient(180deg, rgba(255,255,255,0.62), rgba(245,245,250,0.34))"
        : `
          radial-gradient(circle at 18% 0%, rgba(62,96,156,0.24), transparent 34%),
          radial-gradient(circle at 88% 30%, rgba(100,86,180,0.14), transparent 34%),
          linear-gradient(180deg, rgba(13,27,47,0.96), rgba(8,22,42,0.92))
        `,

    border:
      mode === "light"
        ? "1px solid rgba(255,255,255,0.78)"
        : "1px solid rgba(145,168,214,0.16)",

    boxShadow:
      mode === "light"
        ? `
          inset 0 1px 0 rgba(255,255,255,0.92),
          0 14px 40px rgba(90,95,140,0.10)
        `
        : `
          inset 0 1px 0 rgba(255,255,255,0.11),
          inset -1px 0 0 rgba(255,255,255,0.04),
          0 22px 56px rgba(0,0,0,0.32)
        `,

    backdropFilter:
      "blur(24px) saturate(180%)",

    WebkitBackdropFilter:
      "blur(24px) saturate(180%)",
  }}
>
      <div className="shrink-0 mb-6">
        <div
          className="mb-4 flex items-center"
          style={{
            justifyContent: collapsed ? "center" : "flex-start",
            paddingLeft: collapsed ? 0 : 2,
          }}
        >
          <WindowBar
            onMinimize={onMinimize}
            onMaximize={onMaximize}
            onClose={onClose}
            maximized={maximized}
            dragControls={dragControls}
          />
        </div>

        <div
          className="flex items-center"
          style={{ justifyContent: collapsed ? "center" : "space-between" }}
        >
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
              >
                <h1
                  className="text-[22px] font-black leading-tight"
                  style={{ color: mode === "dark" ? "#F7F1EA" : "#1f2b56" }}
                >
                  Notezy
                </h1>
                <p className="text-[9.5px] font-bold uppercase tracking-[0.24em] text-[#D8D4E9]">
                  Think it. Notezy it.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-[33px] w-[33px] shrink-0 items-center justify-center rounded-[11px]"
            style={{
              background:
                mode === "dark"
                  ? "rgba(255,255,255,0.09)"
                  : "rgba(255,255,255,0.72)",
              border:
                mode === "dark"
                  ? "1px solid rgba(255,255,255,0.11)"
                  : "1px solid rgba(255,255,255,0.85)",
              boxShadow:
                mode === "dark"
                  ? "inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 18px rgba(0,0,0,0.18)"
                  : "inset 0 1px 0 rgba(255,255,255,0.95), 0 3px 10px rgba(92,83,140,0.08)",
            }}
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
            >
              {collapsed ? (
                <ChevronsRight
                  size={15}
                  strokeWidth={2.6}
                  style={{ color: mode === "dark" ? "#F1ECFF" : "#5b6786" }}
                />
              ) : (
                <ChevronsLeft
                  size={15}
                  strokeWidth={2.6}
                  style={{ color: mode === "dark" ? "#F1ECFF" : "#5b6786" }}
                />
              )}
            </motion.div>
          </button>
        </div>
      </div>

      {/* ── NEW NOTE ── */}
      <div className="relative mb-4 shrink-0" style={{ height: 48 }}>
        {/* Icon-only version */}
        <motion.button
          onClick={createNewNote}
          animate={{ opacity: collapsed ? 1 : 0, scale: collapsed ? 1 : 0.85 }}
          transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center rounded-[13px] text-white"
          style={{
            background: "linear-gradient(180deg, #c9bff2 0%, #a98ee0 100%)",
            boxShadow:
              "0 8px 20px rgba(146,124,228,0.20), inset 0 1px 0 rgba(255,255,255,0.36)",
            pointerEvents: collapsed ? "auto" : "none",
          }}
        >
          <Plus size={17} strokeWidth={2.4} />
        </motion.button>

        {/* Full label version */}
        <motion.button
          onClick={createNewNote}
          animate={{ opacity: collapsed ? 0 : 1, scale: collapsed ? 0.85 : 1 }}
          transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center gap-3 rounded-[14px] text-[15px] font-bold text-white"
          style={{
            background: "linear-gradient(180deg, #c9bff2 0%, #a98ee0 100%)",
            boxShadow:
              "0 10px 24px rgba(146,124,228,0.22), inset 0 1px 0 rgba(255,255,255,0.38)",
            pointerEvents: collapsed ? "none" : "auto",
          }}
        >
          <Plus size={15} strokeWidth={2.4} />
          New Note
        </motion.button>
      </div>

      {/* ── MAIN NAV ── */}
      <div className="shrink-0 space-y-0.5">
        {MAIN_ITEMS.map((item) => (
          <SidebarButton
            key={item.label}
            item={item}
            active={active === item.label}
            collapsed={collapsed}
            onClick={() => selectSidebarItem(item.label)}
            mode={mode}
          />
        ))}
      </div>

      {/* ── CATEGORIES ── */}
      <div
        className="min-h-0 flex-1 pr-1"
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
      <div className="mt-2 flex min-h-0 flex-1 flex-col">
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
            className="mb-1 overflow-hidden px-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#a19bc5]"
            >
              Categories
            </motion.p>
          )}
        </AnimatePresence>
        <div
          className="min-h-0 flex-1 space-y-0.5 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {CATEGORY_ITEMS.map((item) => (
            <SidebarButton
              key={item.label}
              item={item}
              active={active === item.label}
              collapsed={collapsed}
              onClick={() => selectCategory(item.label)}
              mode={mode}
            />
          ))}
          {customCategories.map((category) => (
            <CustomCategoryRow
              key={category}
              category={category}
              active={active === category}
              collapsed={collapsed}
              mode={mode}
              isRenaming={renamingCategory === category}
              renameValue={renameValue}
              onSelect={() => selectCategory(category)}
              onRenameValueChange={setRenameValue}
              onRename={() => startRenameCategory(category)}
              onRenameSave={saveRenamedCategory}
              onRenameCancel={() => {
                setRenamingCategory("");
                setRenameValue("");
              }}
              onDelete={() => {
                setCategoryToDelete(category);
              }}
            />
          ))}
        </div>
        {!collapsed && (
          <div className="shrink-0 pt-1.5">
              <AnimatePresence initial={false}>
              {addingCategory ? (
                <motion.div
                  key="category-input"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16 }}
                  className="flex h-[35px] items-center gap-2 rounded-[13px] px-[13px]"
                  style={{
                    background:
                      mode === "dark"
                        ? "rgba(255,255,255,0.075)"
                        : "rgba(255,255,255,0.50)",
                    boxShadow:
                      mode === "dark"
                        ? "inset 0 1px 0 rgba(255,255,255,0.10)"
                        : "inset 0 1px 0 rgba(255,255,255,0.74)",
                  }}
                >
                  <Plus
                    size={15}
                    strokeWidth={2.4}
                    style={{
                      color: mode === "dark" ? "#AAB6CC" : "#8B5CF6",
                      flexShrink: 0,
                    }}
                  />
                  <input
                    autoFocus
                    value={categoryName}
                    placeholder="Category name"
                    onChange={(event) => setCategoryName(event.target.value)}
                    onBlur={addCategory}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        addCategory();
                      }

                      if (event.key === "Escape") {
                        setCategoryName("");
                        setAddingCategory(false);
                      }
                    }}
                    className="min-w-0 flex-1 bg-transparent outline-none"
                    style={{
                      color: mode === "dark" ? "#E8EEFC" : "#4c5676",
                      fontSize: 13,
                      fontWeight: 650,
                      letterSpacing: 0,
                    }}
                  />
                </motion.div>
              ) : (
                <motion.button
                  key="category-add"
                  type="button"
                  onClick={() => setAddingCategory(true)}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16 }}
                  className="flex h-[35px] w-full items-center rounded-[13px] px-[13px]"
                  style={{
                    gap: 11,
                    border:
                      mode === "dark"
                        ? "1px solid rgba(255,255,255,0.08)"
                        : "1px solid rgba(255,255,255,0.58)",
                    background:
                      mode === "dark"
                        ? "rgba(255,255,255,0.045)"
                        : "rgba(255,255,255,0.34)",
                    color: mode === "dark" ? "#AAB6CC" : "#67718D",
                    cursor: "pointer",
                    boxShadow:
                      mode === "dark"
                        ? "inset 0 1px 0 rgba(255,255,255,0.07)"
                        : "inset 0 1px 0 rgba(255,255,255,0.68)",
                  }}
                >
                  <Plus size={15} strokeWidth={2.2} />
                  <span className="whitespace-nowrap text-[13px] font-semibold leading-none">
                    Add Category
                  </span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── SPACER ── */}
      </div>

      <div className="shrink-0 pt-1">

      {/* ── DIVIDER above Trash ── */}
      <div
        className="mb-1.5 mt-1.5 h-px shrink-0"
        style={{
          background:
            mode === "dark"
              ? "rgba(196,205,232,0.18)"
              : "#dfdbef",
        }}
      />

      {/* ── TRASH ── */}
      <div className="shrink-0">
        <SidebarButton
          item={{ label: "Trash", icon: Trash2 }}
          active={active === "Trash"}
          collapsed={collapsed}
          onClick={() => {
            setActive("Trash");
            window.dispatchEvent(
              new CustomEvent(NOTE_FILTER_EVENT, {
                detail: { filter: "trash" },
              }),
            );
          }}
          mode={mode}
        />
      </div>

      {/* ── DIVIDER below Trash ── */}
      <div
        className="mb-1 mt-1.5 h-px shrink-0"
        style={{
          background:
            mode === "dark"
              ? "rgba(196,205,232,0.18)"
              : "#dfdbef",
        }}
      />

      <div style={{ position: "relative" }}>
        <button
          type="button"
          onClick={toggleProfileMenu}
          className="mb-1.5 flex w-full shrink-0 items-center border-0 bg-transparent px-1"
          style={{
            gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? "center" : "flex-start",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #C4B5FD, #7C3AED)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 10,
              fontWeight: 700,
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.48), 0 8px 18px rgba(103,72,190,0.22)",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>

          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
                className="min-w-0 overflow-hidden text-left"
              >
                <p
                  className="m-0 truncate text-[12px] font-black leading-tight"
                  style={{ color: mode === "dark" ? "#F7F1EA" : "#1f2b56" }}
                >
                  {profileName}
                </p>
                <p
                  className="m-0 truncate text-[10px] font-semibold leading-tight"
                  style={{ color: mode === "dark" ? "#8F9AB8" : "#7D7895" }}
                >
                  {isLoggedIn ? "Free Plan" : "Email account"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <AnimatePresence>
          {profileMenuOpen && !collapsed && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 4, scale: 0.96, filter: "blur(5px)" }}
              transition={{ duration: 0.15, ease: [0.22, 0.61, 0.36, 1] }}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 32,
                zIndex: 150,
                padding: 8,
                borderRadius: 16,
                background: "#FFFCF6",
                border: "1px solid rgba(231,224,214,0.96)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,1), 0 18px 36px rgba(50,42,78,0.18), 0 3px 10px rgba(50,42,78,0.10)",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 18,
                  bottom: -6,
                  width: 12,
                  height: 12,
                  transform: "rotate(45deg)",
                  background: "#FFFCF6",
                  borderRight: "1px solid rgba(231,224,214,0.96)",
                  borderBottom: "1px solid rgba(231,224,214,0.96)",
                }}
              />
              {isLoggedIn && profileMenuView === "menu" ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "5px 6px 9px",
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #C4B5FD, #7C3AED)",
                        display: "grid",
                        placeItems: "center",
                        color: "white",
                        fontSize: 10,
                        fontWeight: 800,
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
                    label="Profile"
                    onClick={() => setProfileMenuView("profile")}
                  />
                  <ProfileMenuButton
                    label="Settings"
                    onClick={() => setProfileMenuView("settings")}
                  />
                  <ProfileMenuButton
                    danger
                    label="Logout"
                    onClick={() => setProfileMenuView("logout")}
                  />
                </>
              ) : isLoggedIn && profileMenuView === "profile" ? (
                <>
                  <ProfileMenuButton
                    label="← Back"
                    onClick={() => setProfileMenuView("menu")}
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
              ) : isLoggedIn && profileMenuView === "settings" ? (
                <>
                  <ProfileMenuButton
                    label="← Back"
                    onClick={() => setProfileMenuView("menu")}
                  />
                  <div
                    style={{
                      height: 1,
                      margin: "4px 2px 6px",
                      background: "rgba(223,219,239,0.92)",
                    }}
                  />
                  <ProfileInfoRow label="Theme" value={mode === "dark" ? "Dark" : "Light"} />
                  <ProfileInfoRow label="Brightness" value={`${Math.round(brightness * 100)}%`} />
                  <ProfileInfoRow label="Default Color" value="Classic Paper" />
                  <ProfileInfoRow label="Font Size" value="16 px" />
                  <ProfileInfoRow label="Auto Save" value="On" />
                </>
              ) : isLoggedIn && profileMenuView === "logout" ? (
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
                      onClick={() => setProfileMenuView("menu")}
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
                    onClick={() => router.push("/login")}
                  />
                  <ProfileMenuButton
                    label="Create account"
                    onClick={() => router.push("/signup")}
                  />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── BRIGHTNESS SLIDER ── */}
      <div
        className="shrink-0 flex items-center px-1"
        style={{
          gap: collapsed ? 0 : 9,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <Sun
          size={14}
          strokeWidth={2}
          style={{ color: mode === "dark" ? "#A7B3D0" : "#5b6786", flexShrink: 0 }}
        />

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
              className="flex flex-1 items-center gap-2 overflow-hidden"
            >
              {/* Track */}
              <div
                className="relative flex-1 rounded-full"
                style={{ height: 6, background: "rgba(180,175,215,0.35)" }}
              >
                {/* Fill */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${brightness * 100}%`,
                    background: "linear-gradient(90deg, #b59deb, #9880d8)",
                  }}
                />
                {/* Thumb */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 rounded-full border-2 border-white"
                  style={{
                    width: 16,
                    height: 16,
                    left: `calc(${brightness * 100}% - 8px)`,
                    background: "#a088d8",
                    boxShadow: "0 2px 8px rgba(120,96,200,0.36)",
                  }}
                />
                {/* Range input */}
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="absolute inset-0 w-full cursor-pointer opacity-0"
                />
              </div>
              <span
                className="w-8 shrink-0 text-right text-[11.5px] font-bold"
                style={{ color: mode === "dark" ? "#8F9AB8" : "#6b6a94" }}
              >
                {Math.round(brightness * 100)}%
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      </div>

      <AnimatePresence>
        {categoryToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 220,
              display: "grid",
              placeItems: "center",
              padding: 22,
              background: "rgba(24,24,42,0.16)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
              style={{
                width: "100%",
                maxWidth: 286,
                borderRadius: 22,
                padding: 20,
                background: "#FFFCF6",
                border: "1px solid rgba(255,255,255,0.84)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,1), 0 24px 50px rgba(50,42,78,0.22)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 7px",
                  color: "#18254B",
                  fontSize: 16,
                  fontWeight: 850,
                  letterSpacing: 0,
                }}
              >
                Delete category?
              </h3>
              <p
                style={{
                  margin: 0,
                  color: "rgba(67,75,119,0.68)",
                  fontSize: 12.5,
                  fontWeight: 600,
                  lineHeight: 1.5,
                }}
              >
                Notes in &quot;{categoryToDelete}&quot; will stay safe and move
                back to Personal.
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  marginTop: 18,
                }}
              >
                <button
                  type="button"
                  onClick={() => setCategoryToDelete("")}
                  style={{
                    height: 32,
                    padding: "0 12px",
                    border: "1px solid rgba(226,219,210,0.92)",
                    borderRadius: 11,
                    background: "rgba(255,255,255,0.72)",
                    color: "#4C5676",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteCategory}
                  style={{
                    height: 32,
                    padding: "0 12px",
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
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
