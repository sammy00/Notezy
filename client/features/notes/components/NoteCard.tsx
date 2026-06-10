"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { MoreHorizontal, Scissors, Star } from "lucide-react";
import { Note } from "../types/note";
import NoteActionsMenu from "./NoteActionsMenu";
import { NOTE_THEME } from "@/shared/theme/notesThemes";

const noteCardTornBottom =
  "polygon(0 0, 100% 0, 100% calc(100% - 12px), 97% calc(100% - 10px), 93% calc(100% - 13px), 89% calc(100% - 10px), 84% calc(100% - 14px), 79% calc(100% - 10px), 74% calc(100% - 13px), 69% calc(100% - 10px), 64% calc(100% - 14px), 59% calc(100% - 10px), 54% calc(100% - 13px), 49% calc(100% - 10px), 44% calc(100% - 14px), 39% calc(100% - 10px), 34% calc(100% - 13px), 29% calc(100% - 10px), 24% calc(100% - 14px), 19% calc(100% - 10px), 14% calc(100% - 13px), 9% calc(100% - 10px), 4% calc(100% - 14px), 0 calc(100% - 12px))";

const paperVariants = [
  { x: 0, y: 0, pinX: 0, pinY: 0, grainX: 0, grainY: 0 },
  { x: -1, y: 1, pinX: 2, pinY: -1, grainX: 12, grainY: 8 },
  { x: 1, y: -1, pinX: -2, pinY: 1, grainX: 24, grainY: 4 },
  { x: 0, y: 1, pinX: 1, pinY: 2, grainX: 8, grainY: 16 },
];

const cardSpring = {
  type: "spring",
  stiffness: 125,
  damping: 22,
  mass: 0.9,
} as const;

const cardLayoutSpring = {
  type: "spring",
  stiffness: 170,
  damping: 28,
  mass: 0.85,
} as const;

type Props = {
  note: Note;
  index: number;
  isActive: boolean;
  isNew?: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onPermanentDelete: () => void;
  onDuplicate: () => void;
  onFavorite: () => void;
  onPin: () => void;
  viewMode: "list" | "grid";
  isTrashView?: boolean;
};

export default function NoteCard({
  note,
  index,
  isActive,
  isNew,
  onSelect,
  onDelete,
  onRestore,
  onPermanentDelete,
  onDuplicate,
  onFavorite,
  onPin,
  viewMode,
  isTrashView,
}: Props) {
  const t = NOTE_THEME[note.tone];
  const isGrid = viewMode === "grid";
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const actionsButtonRef = useRef<HTMLButtonElement | null>(null);
  const cardTilt = isGrid
    ? [-0.35, 0.26, -0.18, 0.32, -0.24, 0.2][index % 6]
    : [-0.28, 0.22, -0.16, 0.18][index % 4];
  const hoverTilt = cardTilt + (cardTilt >= 0 ? 0.42 : -0.42);
  const variant = paperVariants[index % paperVariants.length];

  return (
    <motion.article
      layout="position"
      onClick={onSelect}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{
        opacity: 0,
        y: isNew ? -38 : 6,
        rotate: isNew ? cardTilt - 0.85 : cardTilt,
        scale: isNew ? 0.96 : 0.998,
      }}
      animate={{
        opacity: 1,
        y: isActive ? -1 : 0,
        rotate: cardTilt,
        scale: isActive ? 1.004 : 1,
      }}
      transition={{
        ...cardSpring,
        layout: cardLayoutSpring,
        delay: isNew ? 0 : Math.min(index * 0.025, 0.12),
      }}
      whileHover={{
        y: -6,
        rotate: hoverTilt,
        scale: 1.01,
        transition: cardSpring,
      }}
      whileTap={{
        y: -2,
        scale: 0.996,
        transition: { type: "spring", stiffness: 420, damping: 28 },
      }}
      style={{
        position: "relative",
        width: "100%",
        minWidth: 0,
        maxWidth: isGrid ? "100%" : "100%",
        height: "100%",
        cursor: "pointer",
        overflow: "visible",
        paddingRight: 0,
      }}
    >
      <motion.div
        aria-hidden
        initial={false}
        animate={{
          opacity: isActive ? 0.82 : isHovered ? 0.36 : 0,
          scale: isActive || isHovered ? 1 : 0.98,
        }}
        transition={{ type: "spring", stiffness: 140, damping: 26 }}
        style={{
          position: "absolute",
          inset: isGrid ? "8px 10px -12px" : "8px 16px -14px 8px",
          zIndex: 0,
          borderRadius: 24,
          pointerEvents: "none",
          background: `radial-gradient(ellipse at 50% 24%, ${t.dot}44 0%, ${t.shadow} 42%, transparent 76%)`,
          filter: "blur(20px)",
        }}
      />

      <span
        aria-hidden
        style={{
          position: "absolute",
          left: isGrid ? 18 : 18,
          right: isGrid ? 18 : 20,
          bottom: -8,
          height: 24,
          zIndex: 0,
          borderRadius: "50%",
          pointerEvents: "none",
          background: `radial-gradient(ellipse at 50% 50%, ${t.shadow} 0%, rgba(54,48,86,0.09) 45%, transparent 74%)`,
          filter: "blur(7px)",
          opacity: isActive ? 0.96 : isHovered ? 0.82 : 0.66,
        }}
      />

      <motion.div
        style={{
          height: "100%",
          minWidth: 0,
          borderRadius: 18,
          overflow: "visible",
          backgroundColor: "transparent",
        }}
      >
        <motion.div
          initial={false}
          animate={{
            boxShadow: isGrid
              ? isActive
                ? `0 20px 40px ${t.dot}24, 0 0 0 4px ${t.dot}14, 0 12px 32px rgba(0,0,0,0.08), 0 28px 48px ${t.shadow}, inset 0 1px 0 rgba(255,255,255,0.92), inset 0 -1px 0 rgba(74,63,95,0.07)`
                : isHovered
                  ? `0 24px 50px rgba(0,0,0,0.13), 0 34px 58px ${t.shadow}, 0 0 0 1px ${t.dot}28, inset 0 1px 0 rgba(255,255,255,0.90), inset 0 -1px 0 rgba(74,63,95,0.065)`
                  : `0 12px 32px rgba(0,0,0,0.08), 0 22px 38px ${t.shadow}, inset 0 1px 0 rgba(255,255,255,0.82), inset 0 -1px 0 rgba(74,63,95,0.055)`
              : isActive
                ? `0 20px 40px ${t.dot}24, 0 0 0 4px ${t.dot}14, 0 12px 32px rgba(0,0,0,0.08), 0 28px 46px ${t.shadow}, inset 0 1px 0 rgba(255,255,255,0.92), inset 0 -1px 0 rgba(74,63,95,0.07)`
                : isHovered
                  ? `0 24px 50px rgba(0,0,0,0.13), 0 32px 56px ${t.shadow}, 0 0 0 1px ${t.dot}28, inset 0 1px 0 rgba(255,255,255,0.90), inset 0 -1px 0 rgba(74,63,95,0.065)`
                  : `0 12px 32px rgba(0,0,0,0.08), 0 20px 34px ${t.shadow}, inset 0 1px 0 rgba(255,255,255,0.82), inset 0 -1px 0 rgba(74,63,95,0.055)`,
          }}
          transition={{ type: "spring", stiffness: 130, damping: 24 }}
          style={{
            height: "100%",
            minWidth: 0,
            position: "relative",
            overflow: "hidden",
            zIndex: 1,
            transform: `translate(${variant.x}px, ${variant.y}px)`,
            width: "100%",
            borderRadius: "18px 18px 8px 8px",
            backgroundColor: t.bg,
            border: isActive
              ? `1px solid ${t.dot}B8`
              : "1px solid rgba(255,255,255,0.68)",
            transition:
              "background-color 240ms ease, border-color 220ms ease",
            padding: isGrid ? "22px 24px 36px" : "26px 28px 40px",
              backgroundImage: `
                radial-gradient(circle at 18% 20%, rgba(255,255,255,0.32) 0 0.8px, transparent 1.1px),
                radial-gradient(circle at 72% 42%, rgba(80,60,120,0.045) 0 0.9px, transparent 1.2px),
                radial-gradient(circle at 42% 68%, rgba(255,255,255,0.20) 0 0.7px, transparent 1px),
                radial-gradient(circle at 30% 78%, rgba(80,60,120,0.026) 0 0.7px, transparent 1px),
                linear-gradient(135deg, rgba(255,255,255,0.24), transparent 58%),
                linear-gradient(0deg, rgba(73,61,95,0.035), transparent 24%)
              `,
            backgroundSize: "74px 74px, 106px 106px, 58px 58px, 46px 46px, 100% 100%, 100% 100%",
            backgroundPosition: `${variant.grainX}px ${variant.grainY}px, ${variant.grainX + 18}px ${variant.grainY + 7}px, ${variant.grainX / 2}px ${variant.grainY}px, center, center`,
            clipPath: noteCardTornBottom,
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              opacity: 0.12,
              backgroundImage: `
                radial-gradient(circle at 18% 20%, rgba(255,255,255,0.45) 0 1px, transparent 1px),
                radial-gradient(circle at 72% 42%, rgba(80,60,120,0.035) 0 1px, transparent 1px),
                repeating-linear-gradient(9deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 21px),
                repeating-linear-gradient(98deg, rgba(68,55,96,0.012) 0 1px, transparent 1px 30px),
                linear-gradient(135deg, rgba(255,255,255,0.22), transparent 55%)
              `,
              backgroundBlendMode: "soft-light, soft-light, soft-light, soft-light, normal",
              backgroundSize:
                "48px 48px, 72px 72px, 100% 100%, 100% 100%, 100% 100%",
            }}
          />

          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 5,
              height: isGrid ? 22 : 20,
              zIndex: 2,
              pointerEvents: "none",
              opacity: 0.18,
              backgroundImage: `
                linear-gradient(to bottom, transparent, rgba(57,50,92,0.10)),
                linear-gradient(to top, rgba(255,255,255,0.26), transparent 40%),
                radial-gradient(ellipse at 12% 100%, rgba(255,255,255,0.52) 0 7px, transparent 13px),
                radial-gradient(ellipse at 31% 96%, rgba(57,50,92,0.09) 0 5px, transparent 11px),
                radial-gradient(ellipse at 49% 102%, rgba(255,255,255,0.44) 0 8px, transparent 14px),
                radial-gradient(ellipse at 72% 96%, rgba(57,50,92,0.08) 0 6px, transparent 12px),
                radial-gradient(ellipse at 91% 102%, rgba(255,255,255,0.46) 0 7px, transparent 13px)
              `,
              backgroundRepeat: "no-repeat",
            }}
          />

          <div
            aria-hidden
            style={{
              position: "absolute",
              top: -1,
              left: 20 + variant.pinX,
              width: 25,
              height: 27,
              zIndex: 7,
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: 2,
                top: 2 + variant.pinY,
                width: 18,
                height: 18,
                borderRadius: "50%",
                backgroundImage: `
                  radial-gradient(circle at 30% 24%, rgba(255,255,255,1) 0 10%, rgba(255,255,255,0.62) 11% 20%, transparent 21%),
                  radial-gradient(circle at 35% 30%, rgba(255,255,255,0.40), transparent 34%),
                  radial-gradient(circle at 58% 72%, rgba(22,18,50,0.24), transparent 45%),
                  radial-gradient(circle at 48% 45%, color-mix(in srgb, ${t.dot}, white 22%), ${t.dot} 58%, color-mix(in srgb, ${t.dot}, black 20%) 100%)
                `,
                boxShadow: `
                  0 1px 0 rgba(255,255,255,0.82) inset,
                  -3px -3px 7px rgba(255,255,255,0.30) inset,
                  2px 4px 6px rgba(39,34,78,0.25),
                  5px 9px 12px rgba(39,34,78,0.20),
                  0 0 0 2px rgba(255,255,255,0.24),
                  0 0 18px ${isActive || isHovered ? t.dot + "66" : "rgba(255,255,255,0)"}
                `,
                transition: "box-shadow 220ms ease",
              }}
            />
            <span
              style={{
                position: "absolute",
                left: -4,
                top: -3,
                width: 29,
                height: 29,
                borderRadius: "50%",
                background: `radial-gradient(circle at 48% 44%, ${t.dot}30, transparent 64%)`,
                filter: "blur(4px)",
                opacity: isActive || isHovered ? 0.92 : 0.72,
                transition: "opacity 220ms ease",
              }}
            />
          </div>

          <div
            style={{
              position: "absolute",
              top: isGrid ? 20 : 20,
              right: isGrid ? 24 : 22,
              zIndex: 24,
              display: "flex",
              alignItems: "center",
              gap: isGrid ? 16 : 8,
              color: "rgba(42,50,92,0.78)",
            }}
          >
            {isGrid && (
              <FavoriteButton
                starred={Boolean(note.starred)}
                size={16}
                onClick={onFavorite}
              />
            )}
            <button
              ref={actionsButtonRef}
              type="button"
              aria-label="Note actions"
              title="Note actions"
              onClick={(event) => {
                event.stopPropagation();
                setMenuOpen((open) => !open);
              }}
              style={{
                width: 26,
                height: 26,
                border: "none",
                borderRadius: 9,
                display: "grid",
                placeItems: "center",
                color: "currentColor",
                background: menuOpen ? "rgba(255,255,255,0.48)" : "transparent",
                cursor: "pointer",
                boxShadow: menuOpen
                  ? "inset 0 1px 0 rgba(255,255,255,0.70), 0 6px 14px rgba(69,58,108,0.10)"
                  : "none",
              }}
            >
              <MoreHorizontal
                size={18}
                strokeWidth={2.4}
                color="currentColor"
                style={{ flexShrink: 0 }}
              />
            </button>
          </div>

          <div
              style={{
              position: "relative",
              zIndex: 3,
              height: "100%",
              paddingRight: isGrid ? 84 : 44,
            }}
          >
            <h3
              style={{
                margin: "0 0 9px",
                fontFamily: "var(--font-ui)",
                fontSize: isGrid ? 17 : 18,
                fontWeight: 700,
                lineHeight: 1.16,
                color: t.title,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {note.title}
            </h3>

            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-ui)",
                fontSize: isGrid ? 13 : 14,
                fontWeight: 400,
                lineHeight: isGrid ? 1.48 : 1.45,
                color: t.body,
                opacity: 0.82,
                whiteSpace: "pre-line",
                maxHeight: isGrid ? 58 : 44,
                overflow: "hidden",
                textOverflow: "clip",
              }}
            >
              {note.preview}
            </p>
          </div>

          <div
            style={{
              position: "absolute",
              left: 28,
              right: isGrid ? 104 : 24,
              bottom: isGrid ? 48 : 31,
              zIndex: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 560,
                lineHeight: 1.1,
                letterSpacing: 0.08,
                color: "rgba(54,63,103,0.55)",
                backgroundColor: "transparent",
                borderRadius: 0,
                padding: 0,
                textShadow: "0 1px 0 rgba(255,255,255,0.46)",
                whiteSpace: "nowrap",
              }}
            >
              {note.date}
            </p>

            {!isGrid && (
              <FavoriteButton
                starred={Boolean(note.starred)}
                size={18}
                onClick={onFavorite}
              />
            )}
          </div>

          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 28,
              right: 74,
              bottom: isGrid ? 16 : 12,
              zIndex: 5,
              display: "flex",
              alignItems: "center",
              gap: 9,
              color: t.dot,
              opacity: 0.58,
            }}
          >
            <Scissors
              size={isGrid ? 17 : 19}
              strokeWidth={1.7}
              style={{ flexShrink: 0 }}
            />
            <span
              style={{
                flex: 1,
                borderTop: `1.5px dashed ${t.dot}`,
                opacity: 0.32,
              }}
            />
          </div>

          {isGrid && (
            <div
              aria-hidden
              style={{
                position: "absolute",
                right: 0,
                bottom: -2,
                width: 68,
                height: 68,
                zIndex: 6,
                pointerEvents: "none",
                filter: "drop-shadow(-8px -8px 14px rgba(60,60,90,0.14))",
              }}
            >
              <svg viewBox="0 0 68 68" width={68} height={68}>
                <defs>
                  <linearGradient id={`fold-fill-${note.id}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor={t.bg} stopOpacity="0.98" />
                    <stop offset="0.58" stopColor={t.edge} stopOpacity="0.96" />
                    <stop offset="1" stopColor={t.bg} stopOpacity="0.86" />
                  </linearGradient>
                </defs>
                <path
                  d="M68 68H0C34 65 62 36 68 0V68Z"
                  fill="rgba(0,0,0,0.08)"
                />
                <path
                  d="M68 68V0C62 36 34 65 0 68H68Z"
                  fill={`url(#fold-fill-${note.id})`}
                />
                <path
                  d="M0 68C34 65 62 36 68 0"
                  fill="none"
                  stroke="rgba(255,255,255,0.42)"
                  strokeWidth="1"
                />
              </svg>
            </div>
          )}
        </motion.div>
      </motion.div>

      <NoteActionsMenu
        open={menuOpen}
        anchorRef={actionsButtonRef}
        onDelete={onDelete}
        onRestore={onRestore}
        onPermanentDelete={onPermanentDelete}
        onDuplicate={onDuplicate}
        onPin={onPin}
        pinned={Boolean(note.pinned)}
        isTrashView={Boolean(isTrashView || note.trashed)}
        onClose={() => setMenuOpen(false)}
      />
    </motion.article>
  );
}

function FavoriteButton({
  starred,
  size,
  onClick,
}: {
  starred: boolean;
  size: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      aria-label={starred ? "Remove from favorites" : "Add to favorites"}
      title={starred ? "Remove from favorites" : "Add to favorites"}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      whileHover={{ y: -1, scale: 1.08 }}
      whileTap={{ scale: 0.9 }}
      animate={{ scale: starred ? 1.08 : 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      style={{
        width: size + 12,
        height: size + 12,
        border: "none",
        borderRadius: 10,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        color: starred ? "#F4A51C" : "rgba(52,62,105,0.55)",
        background: starred ? "rgba(255,255,255,0.34)" : "transparent",
        cursor: "pointer",
        boxShadow: starred
          ? "inset 0 1px 0 rgba(255,255,255,0.72), 0 7px 14px rgba(244,165,28,0.16)"
          : "none",
        filter: "drop-shadow(0 1px 0 rgba(255,255,255,0.65))",
      }}
    >
      <Star
        size={size}
        strokeWidth={2.1}
        color="currentColor"
        fill={starred ? "currentColor" : "none"}
      />
    </motion.button>
  );
}
