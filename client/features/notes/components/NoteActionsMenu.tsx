"use client";

import { ReactNode, RefObject, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Pin, RotateCcw, Trash2 } from "lucide-react";

type Props = {
  open: boolean;
  anchorRef: RefObject<HTMLButtonElement | null>;
  onDelete: () => void;
  onRestore: () => void;
  onPermanentDelete: () => void;
  onDuplicate: () => void;
  onPin: () => void;
  pinned: boolean;
  isTrashView?: boolean;
  onClose: () => void;
};

export default function NoteActionsMenu({
  open,
  anchorRef,
  onDelete,
  onRestore,
  onPermanentDelete,
  onDuplicate,
  onPin,
  pinned,
  isTrashView,
  onClose,
}: Props) {
  const [position, setPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const updatePosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      const menuWidth = 166;
      const menuHeight = 132;
      const viewportPadding = 12;
      const left = Math.max(
        viewportPadding,
        Math.min(rect.right + 8, window.innerWidth - menuWidth - viewportPadding),
      );
      const top = Math.max(
        viewportPadding,
        Math.min(rect.top - 10, window.innerHeight - menuHeight - viewportPadding),
      );

      setPosition({ left, top });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [anchorRef, open]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open && position && (
        <>
          <button
            type="button"
            aria-label="Close note actions"
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9998,
              border: "none",
              background: "transparent",
              cursor: "default",
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 6, scale: 0.96, filter: "blur(6px)" }}
            transition={{ duration: 0.16, ease: [0.22, 0.61, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              zIndex: 9999,
              width: 166,
              padding: 7,
              borderRadius: 14,
              background: "#FFFCF6",
              border: "1px solid rgba(231,224,214,0.96)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,1), 0 18px 36px rgba(50,42,78,0.18), 0 3px 10px rgba(50,42,78,0.10)",
            }}
          >
            {isTrashView ? (
              <>
                <MenuButton
                  icon={<RotateCcw size={15} strokeWidth={2} />}
                  label="Restore"
                  onClick={() => {
                    onRestore();
                    onClose();
                  }}
                />
                <MenuButton
                  danger
                  icon={<Trash2 size={15} strokeWidth={2} />}
                  label="Delete Forever"
                  onClick={() => {
                    onPermanentDelete();
                    onClose();
                  }}
                />
              </>
            ) : (
              <>
                <MenuButton
                  icon={<Pin size={15} strokeWidth={2} />}
                  label={pinned ? "Unpin Note" : "Pin Note"}
                  onClick={() => {
                    onPin();
                    onClose();
                  }}
                />
                <MenuButton
                  icon={<Copy size={15} strokeWidth={2} />}
                  label="Duplicate"
                  onClick={() => {
                    onDuplicate();
                    onClose();
                  }}
                />
                <MenuButton
                  danger
                  icon={<Trash2 size={15} strokeWidth={2} />}
                  label="Move to Trash"
                  onClick={() => {
                    onDelete();
                    onClose();
                  }}
                />
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function MenuButton({
  icon,
  label,
  danger,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
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
        display: "grid",
        gridTemplateColumns: "18px minmax(0, 1fr)",
        alignItems: "center",
        gap: 8,
        padding: "0 9px",
        background: "transparent",
        color: danger ? "#D94D5B" : "rgba(32,40,77,0.82)",
        fontSize: 12,
        fontWeight: 800,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
