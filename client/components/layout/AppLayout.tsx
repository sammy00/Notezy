"use client";

import { ReactNode, useState } from "react";

import { DragControls, motion } from "framer-motion";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

import { useTheme } from "@/shared/theme/ThemeProvider";

import { designSystem } from "@/shared/theme/DesignSystem";

type Props = {
  children: ReactNode;

  onMinimize: () => void;

  onMaximize: (state: boolean) => void;

  onClose: () => void;

  maximized: boolean;

  dragControls: DragControls;
};

export default function AppLayout({
  children,
  onMinimize,
  onMaximize,
  onClose,
  maximized,
  dragControls,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const { mode } = useTheme();

  const glass =
    mode === "light"
      ? designSystem.glass.light.primary
      : designSystem.glass.dark.primary;

  const secondaryGlass =
    mode === "light"
      ? designSystem.glass.light.secondary
      : designSystem.glass.dark.secondary;

  const layout = designSystem.components.appLayout;

  return (
    <div
      className="
        relative
        flex
        h-full
        w-full
        overflow-hidden
        select-none
      "
      style={{
        borderRadius: maximized ? 0 : layout.outerRadius,

        border: maximized ? "none" : glass.border,

        background:
          mode === "light"
            ? `
              radial-gradient(circle at 82% 4%, rgba(169,186,197,0.34), transparent 34%),
              radial-gradient(circle at 4% 94%, rgba(207,221,249,0.44), transparent 34%),
              linear-gradient(145deg, rgba(247,248,253,0.78), rgba(231,235,248,0.64) 52%, rgba(218,225,244,0.72))
            `
            : `
              radial-gradient(circle at 74% 18%, rgba(80,104,166,0.24), transparent 32%),
              radial-gradient(circle at 16% 76%, rgba(42,74,128,0.18), transparent 34%),
              linear-gradient(145deg, rgba(18,36,67,0.98), rgba(11,27,54,0.96) 48%, rgba(24,45,84,0.98))
            `,

        boxShadow: maximized
          ? "none"
          : mode === "light"
            ? `
              0 46px 130px rgba(48,52,88,0.30),
              inset 0 1px 0 rgba(255,255,255,0.62)
            `
            : `
              0 45px 120px rgba(0,0,0,0.45),
              inset 0 1px 0 rgba(255,255,255,0.04)
            `,

        backdropFilter: "blur(40px) saturate(180%)",

        WebkitBackdropFilter: "blur(40px) saturate(180%)",
      }}
    >
      {/* AMBIENT ATMOSPHERE */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
        "
        style={{
          background:
            mode === "light"
              ? `
                radial-gradient(
                  circle at 16% 16%,
                  rgba(255,255,255,0.54),
                  transparent 20%
                ),

                radial-gradient(
                  circle at 78% 18%,
                  rgba(169,186,197,0.32),
                  transparent 28%
                ),

                radial-gradient(
                  circle at 18% 92%,
                  rgba(72,106,156,0.27),
                  transparent 32%
                ),

                radial-gradient(
                  ellipse at 48% 104%,
                  rgba(40,45,84,0.22),
                  transparent 42%
                ),

                radial-gradient(
                  ellipse at 88% 8%,
                  rgba(255,255,255,0.38),
                  transparent 32%
                ),

                radial-gradient(
                  circle at 62% 48%,
                  rgba(245,218,202,0.12),
                  transparent 30%
                ),

                radial-gradient(
                  ellipse at 50% 52%,
                  transparent 36%,
                  rgba(47,50,82,0.18) 100%
                )
              `
              : `
                radial-gradient(
                  circle at 10% 16%,
                  rgba(66,103,166,0.18),
                  transparent 26%
                ),

                radial-gradient(
                  circle at 76% 16%,
                  rgba(116,94,208,0.18),
                  transparent 30%
                ),

                radial-gradient(
                  circle at 86% 76%,
                  rgba(60,105,176,0.16),
                  transparent 32%
                ),

                radial-gradient(
                  ellipse at 48% 112%,
                  rgba(66,105,174,0.18),
                  transparent 46%
                ),

                radial-gradient(
                  ellipse at 50% 48%,
                  transparent 38%,
                  rgba(5,13,28,0.22) 100%
                )
              `,
        }}
      />

      {/* MAIN LAYOUT */}

      <div
        className="
          relative
          z-10
          flex
          h-full
          w-full
        "
        style={{
          gap: 20,

          padding: maximized ? 16 : 10,
        }}
      >
        {/* SIDEBAR */}

        <motion.div
          animate={{
            width: collapsed
              ? layout.sidebarWidth.collapsed
              : layout.sidebarWidth.expanded,
          }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 26,
          }}
          className="
            relative
            z-[80]
            h-full
            shrink-0
            overflow-visible
          "
          style={{
            borderRadius: maximized
              ? designSystem.components.sidebar.radius
              : designSystem.components.sidebar.radius,

            ...secondaryGlass,
          }}
        >
          <Sidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            onMinimize={onMinimize}
            onMaximize={onMaximize}
            onClose={onClose}
            maximized={maximized}
            dragControls={dragControls}
          />
        </motion.div>

        {/* MAIN CONTENT */}

        <section
          className="
            relative
            flex
            min-w-0
            flex-1
            flex-col
            overflow-hidden
          "
          style={{
            borderRadius: maximized
              ? layout.contentRadius
              : layout.contentRadius,

            background:
              mode === "light"
                ? `
                  radial-gradient(circle at 84% 0%, rgba(169,186,197,0.26), transparent 30%),
                  radial-gradient(circle at 12% 92%, rgba(210,224,250,0.34), transparent 32%),
                  linear-gradient(145deg, rgba(255,255,255,0.58), rgba(242,245,253,0.36))
                `
                : `
                  radial-gradient(circle at 78% 8%, rgba(86,111,180,0.16), transparent 32%),
                  radial-gradient(circle at 18% 88%, rgba(46,83,141,0.14), transparent 34%),
                  linear-gradient(145deg, rgba(32,55,101,0.72), rgba(20,39,77,0.54))
                `,
            border:
              mode === "light"
                ? "1px solid rgba(255,255,255,0.58)"
                : "1px solid rgba(135,160,210,0.13)",
            boxShadow:
              mode === "light"
                ? "inset 0 1px 0 rgba(255,255,255,0.82), 0 32px 90px rgba(92,100,145,0.16)"
                : "inset 0 1px 0 rgba(255,255,255,0.08), 0 32px 80px rgba(0,0,0,0.26)",
            backdropFilter: glass.backdropFilter,
            WebkitBackdropFilter: glass.WebkitBackdropFilter,
          }}
        >
          {/* NAVBAR */}

          <div className="px-8 pt-6">
            <Navbar />
          </div>

          {/* CONTENT */}

          <main
            className="
              min-h-0
              flex-1
              overflow-hidden
              px-8
              pb-6
              pt-3
            "
          >
            {children}
          </main>
        </section>
      </div>
    </div>
  );
}
