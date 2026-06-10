import { ReactNode, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bold,
  CheckSquare,
  ChevronDown,
  Expand,
  FileText,
  Highlighter,
  Image as ImageIcon,
  Italic,
  List,
  ListOrdered,
  Paperclip,
  Redo2,
  Underline,
  Undo2,
} from "lucide-react";

export type ToolbarFormat =
  | "bold"
  | "italic"
  | "underline"
  | "highlight-yellow"
  | "highlight-pink"
  | "highlight-mint"
  | "highlight-blue"
  | "highlight-lavender"
  | "highlight-clear"
  | "list-bullet"
  | "list-numbered"
  | "list-checklist"
  | "attachment-image"
  | "attachment-file";

type Props = {
  onFormat: (format: ToolbarFormat) => void;
  onUndo: () => void;
  onRedo: () => void;
  onFullscreen: () => void;
  ink: string;
};

const highlightOptions = [
  { label: "Yellow", format: "highlight-yellow" as const, color: "#FFF1A8" },
  { label: "Pink", format: "highlight-pink" as const, color: "#FFD6E0" },
  { label: "Mint", format: "highlight-mint" as const, color: "#D9F3DC" },
  { label: "Blue", format: "highlight-blue" as const, color: "#DDEBFF" },
  { label: "Lavender", format: "highlight-lavender" as const, color: "#E9DDFF" },
  { label: "Clear", format: "highlight-clear" as const, color: "#FFFFFF" },
];

const listOptions = [
  { label: "Bullets", format: "list-bullet" as const, icon: <List size={16} strokeWidth={2.05} /> },
  { label: "Numbered", format: "list-numbered" as const, icon: <ListOrdered size={16} strokeWidth={2.05} /> },
  { label: "Checklist", format: "list-checklist" as const, icon: <CheckSquare size={16} strokeWidth={2.05} /> },
];

const attachmentOptions = [
  { label: "Image", format: "attachment-image" as const, icon: <ImageIcon size={16} strokeWidth={2.05} /> },
  { label: "File", format: "attachment-file" as const, icon: <FileText size={16} strokeWidth={2.05} /> },
];

export default function SideToolbar({
  onFormat,
  onUndo,
  onRedo,
  onFullscreen,
  ink,
}: Props) {
  const [openMenu, setOpenMenu] = useState<
    "highlight" | "list" | "attachment" | null
  >(null);

  const closeMenu = () => setOpenMenu(null);

  return (
    <div
      aria-label="Editor floating toolbar"
      style={{
        position: "absolute",
        left: 35,
        right: 35,
        bottom: 26,
        zIndex: 7,
        height: 34,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        padding: 0,
        color: ink,
        borderRadius: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <SideToolbarButton
          label="Bold"
          icon={<Bold size={18} strokeWidth={2.15} />}
          onClick={() => {
            closeMenu();
            onFormat("bold");
          }}
        />
        <SideToolbarButton
          label="Italic"
          icon={<Italic size={18} strokeWidth={2.05} />}
          onClick={() => {
            closeMenu();
            onFormat("italic");
          }}
        />
        <SideToolbarButton
          label="Underline"
          icon={<Underline size={18} strokeWidth={2.05} />}
          onClick={() => {
            closeMenu();
            onFormat("underline");
          }}
        />

        <ToolbarGroup>
          <SideToolbarButton
            label="Highlight"
            icon={<Highlighter size={18} strokeWidth={2.05} />}
            trailing={<ChevronDown size={12} strokeWidth={2.3} />}
            active={openMenu === "highlight"}
            onClick={() =>
              setOpenMenu((menu) => (menu === "highlight" ? null : "highlight"))
            }
          />
          <AnimatePresence>
            {openMenu === "highlight" && (
              <ToolbarPopover width={184}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(6, 1fr)",
                    gap: 8,
                  }}
                >
                  {highlightOptions.map((option) => (
                    <button
                      key={option.format}
                      type="button"
                      aria-label={option.label}
                      title={option.label}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        onFormat(option.format);
                        closeMenu();
                      }}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 8,
                        border:
                          option.format === "highlight-clear"
                            ? "1px dashed rgba(70,66,104,0.34)"
                            : "1px solid rgba(255,255,255,0.88)",
                        background: option.color,
                        cursor: "pointer",
                        boxShadow:
                          "inset 0 1px 0 rgba(255,255,255,0.78), 0 5px 10px rgba(58,46,92,0.10)",
                      }}
                    />
                  ))}
                </div>
              </ToolbarPopover>
            )}
          </AnimatePresence>
        </ToolbarGroup>

        <ToolbarGroup>
          <SideToolbarButton
            label="List options"
            icon={<List size={18} strokeWidth={2.05} />}
            trailing={<ChevronDown size={12} strokeWidth={2.3} />}
            active={openMenu === "list"}
            onClick={() =>
              setOpenMenu((menu) => (menu === "list" ? null : "list"))
            }
          />
          <AnimatePresence>
            {openMenu === "list" && (
              <ToolbarPopover width={142}>
                {listOptions.map((option) => (
                  <button
                    key={option.format}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onFormat(option.format);
                      closeMenu();
                    }}
                    style={{
                      width: "100%",
                      height: 30,
                      border: "none",
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "0 8px",
                      background: "transparent",
                      color: ink,
                      fontSize: 12,
                      fontWeight: 620,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </ToolbarPopover>
            )}
          </AnimatePresence>
        </ToolbarGroup>

        <ToolbarGroup>
          <SideToolbarButton
            label="Attachment options"
            icon={<Paperclip size={18} strokeWidth={2.05} />}
            trailing={<ChevronDown size={12} strokeWidth={2.3} />}
            active={openMenu === "attachment"}
            onClick={() =>
              setOpenMenu((menu) =>
                menu === "attachment" ? null : "attachment",
              )
            }
          />
          <AnimatePresence>
            {openMenu === "attachment" && (
              <ToolbarPopover width={132}>
                {attachmentOptions.map((option) => (
                  <button
                    key={option.format}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onFormat(option.format);
                      closeMenu();
                    }}
                    style={{
                      width: "100%",
                      height: 30,
                      border: "none",
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "0 8px",
                      background: "transparent",
                      color: ink,
                      fontSize: 12,
                      fontWeight: 620,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </ToolbarPopover>
            )}
          </AnimatePresence>
        </ToolbarGroup>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginLeft: "auto",
        }}
      >
        <SideToolbarButton
          label="Undo"
          icon={<Undo2 size={18} strokeWidth={2.05} />}
          onClick={() => {
            closeMenu();
            onUndo();
          }}
        />
        <SideToolbarButton
          label="Redo"
          icon={<Redo2 size={18} strokeWidth={2.05} />}
          onClick={() => {
            closeMenu();
            onRedo();
          }}
        />
        <SideToolbarButton
          label="Fullscreen"
          icon={<Expand size={18} strokeWidth={2.05} />}
          onClick={() => {
            closeMenu();
            onFullscreen();
          }}
        />
      </div>
    </div>
  );
}

function ToolbarGroup({ children }: { children: ReactNode }) {
  return <div style={{ position: "relative" }}>{children}</div>;
}

function ToolbarPopover({
  children,
  width,
}: {
  children: ReactNode;
  width: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 6, scale: 0.96, filter: "blur(6px)" }}
      transition={{ duration: 0.16, ease: [0.22, 0.61, 0.36, 1] }}
      style={{
        position: "absolute",
        left: 0,
        bottom: 40,
        width,
        padding: 8,
        borderRadius: 14,
        zIndex: 35,
        background: "#FFFCF6",
        border: "1px solid rgba(231,224,214,0.96)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,1), 0 16px 34px rgba(50,42,78,0.18), 0 3px 10px rgba(50,42,78,0.10)",
      }}
    >
      {children}
    </motion.div>
  );
}

function SideToolbarButton({
  label,
  icon,
  active,
  trailing,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  active?: boolean;
  trailing?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      whileHover={{ y: -1, scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      style={{
        width: trailing ? 40 : 32,
        height: 32,
        border: "none",
        borderRadius: 11,
        display: "grid",
        gridTemplateColumns: trailing ? "1fr 10px" : "1fr",
        alignItems: "center",
        justifyItems: "center",
        cursor: "pointer",
        color: active ? "#7C3AED" : "rgba(58,46,92,0.74)",
        background: active
          ? "linear-gradient(180deg, rgba(252,249,242,0.92), rgba(246,241,232,0.72))"
          : "transparent",
        boxShadow: active
          ? "inset 0 1px 0 rgba(255,255,255,0.78), 0 7px 16px rgba(92,72,48,0.10), 0 0 0 1px rgba(139,92,246,0.10)"
          : "none",
      }}
    >
      {icon}
      {trailing}
    </motion.button>
  );
}
