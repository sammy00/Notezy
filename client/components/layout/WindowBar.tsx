
"use client";

import { Minus, Square, X } from "lucide-react";
import { DragControls } from "framer-motion";

import { designSystem } from "@/shared/theme/DesignSystem";

interface WindowBarProps {
  onMinimize?: () => void;

  onMaximize?: (
    maximized: boolean
  ) => void;

  onClose?: () => void;

  dragControls?: DragControls;

  maximized?: boolean;
}

function TrafficButton({
  color,
  icon,
  onClick,
}: {
  color: string;

  icon: React.ReactNode;

  onClick?: () => void;
}) {
  const traffic =
    designSystem.window.traffic;

  return (
    <button
      onClick={onClick}
      className="
        group
        relative
        grid
        place-items-center
        rounded-full
        transition-all
        duration-200
        hover:scale-110
        active:scale-95
      "
      style={{
        width: traffic.size,

        height: traffic.size,

        background: color,

        boxShadow: traffic.shadow,
      }}
    >
      <span
        className="
          opacity-0
          transition-opacity
          duration-200
          group-hover:opacity-100
        "
      >
        {icon}
      </span>
    </button>
  );
}

export default function WindowBar({
  onMinimize,
  onMaximize,
  onClose,
  dragControls,
  maximized = false,
}: WindowBarProps) {
  const traffic =
    designSystem.window.traffic;

  return (
    <div
      onPointerDown={(e) =>
        !maximized &&
        dragControls?.start(e)
      }
      className={`
        flex
        items-center
        ${
          maximized
            ? "cursor-default"
            : "cursor-grab active:cursor-grabbing"
        }
      `}
      style={{
        gap: traffic.gap,
      }}
    >
      {/* CLOSE */}
      <TrafficButton
        color={traffic.close}
        onClick={onClose}
        icon={
          <X
            size={9}
            color="#5F130E"
            strokeWidth={3}
          />
        }
      />

      {/* MINIMIZE */}
      <TrafficButton
        color={traffic.minimize}
        onClick={onMinimize}
        icon={
          <Minus
            size={10}
            color="#6B4700"
            strokeWidth={3}
          />
        }
      />

      {/* MAXIMIZE */}
      <TrafficButton
        color={traffic.maximize}
        onClick={() =>
          onMaximize?.(!maximized)
        }
        icon={
          <Square
            size={8}
            color="#0D4F19"
            strokeWidth={3}
          />
        }
      />
    </div>
  );
}
