// shared/theme/DesignSystem.ts

export const designSystem = {
  radius: {
    xs: 8,
    sm: 12,
    md: 18,
    lg: 24,
    xl: 30,
    full: 999,
  },

  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 22,
    xl: 30,
    "2xl": 40,
    "3xl": 54,
  },

  typography: {
    hero: "38px",
    title: "30px",
    heading: "20px",
    body: "15px",
    caption: "13px",
    tiny: "11px",

    weights: {
      regular: 500,
      medium: 600,
      bold: 700,
      black: 800,
    },
  },

  glass: {
    light: {
      primary: {
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.58), rgba(245,245,250,0.30))",
        border: "1px solid rgba(255,255,255,0.72)",
        boxShadow: `
          inset 0 1px 0 rgba(255,255,255,0.88),
          0 10px 30px rgba(95,100,140,0.08)
        `,
        backdropFilter: "blur(22px) saturate(180%)",
        WebkitBackdropFilter: "blur(22px) saturate(180%)",
      },

      secondary: {
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.42), rgba(240,242,248,0.18))",
        border: "1px solid rgba(255,255,255,0.55)",
        boxShadow: `
          inset 0 1px 0 rgba(255,255,255,0.7),
          0 6px 24px rgba(95,100,140,0.05)
        `,
        backdropFilter: "blur(18px) saturate(160%)",
        WebkitBackdropFilter: "blur(18px) saturate(160%)",
      },
    },

    dark: {
      primary: {
        background:
          "linear-gradient(180deg, rgba(30,41,59,0.78), rgba(15,23,42,0.68))",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: `
          inset 0 1px 0 rgba(255,255,255,0.04),
          0 14px 40px rgba(0,0,0,0.42)
        `,
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
      },

      secondary: {
        background:
          "linear-gradient(180deg, rgba(30,41,59,0.62), rgba(15,23,42,0.52))",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: `
          inset 0 1px 0 rgba(255,255,255,0.03),
          0 8px 28px rgba(0,0,0,0.35)
        `,
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
      },
    },
  },

  shadows: {
    light: {
      soft: "0 10px 30px rgba(15,23,42,0.08)",
      medium: "0 18px 40px rgba(15,23,42,0.12)",
      strong: "0 24px 60px rgba(15,23,42,0.18)",
    },

    dark: {
      soft: "0 10px 30px rgba(0,0,0,0.25)",
      medium: "0 18px 50px rgba(0,0,0,0.35)",
      strong: "0 24px 70px rgba(0,0,0,0.50)",
    },
  },

  components: {
    appLayout: {
      outerRadius: 34,

      sidebarWidth: {
        expanded: 250,
        collapsed: 86,
      },

      gap: 20,
      padding: 20,
      contentRadius: 32,
    },

    sidebar: {
      width: 290,
      radius: 34,

      expandedWidth: 290,
      collapsedWidth: 84,
      padding: 12,
      itemHeight: 44,
      itemRadius: 14,
      sectionGap: 18,
      iconSize: 17,
      titleSize: "22px",
      subtitleSize: "10px",
      newButtonHeight: 46,
      collapseButton: 34,

      dividerOpacityLight: "rgba(210,214,228,0.9)",
      dividerOpacityDark: "rgba(255,255,255,0.08)",
    },

    navbar: {
      height: 56,
      radius: 22,
      actionSize: 52,
    },

    noteCard: {
      radius: 28,
      padding: 22,
      shadowBlur: 40,
    },

    editor: {
      radius: 36,
      padding: 34,
    },

    floatingPanel: {
      radius: 30,
    },
  },
  paper: {
  editor: {
    radius: 22,
    aspectRatio: "1 / 1",
    maxWidth: 700,
    minSize: 440,
    outerPadding: "38px 42px 36px",

    stack: {
      leftRotate: "-5deg",
      rightRotate: "4.2deg",
      leftOffset: {
        top: -22,
        left: -48,
        right: 56,
        bottom: 30,
      },
      rightOffset: {
        top: -20,
        left: 58,
        right: -48,
        bottom: 32,
      },
    },

    texture: {
      backgroundRepeat: "repeat, repeat, no-repeat",
      backgroundSize: "36px 36px, 48px 48px, 100% 100%",
      backgroundPosition: "0 0, 0 0, center",
    },

    ruledLines: {
      top: 124,
      side: 58,
      bottom: 86,
      gap: 42,
      count: 13,
    },

    content: {
      padding: "82px 64px 106px",
      titleSize: 42,
      bodySize: 28,
      bodyLineHeight: "42px",
    },

    shadows: {
      main:
        "0 30px 44px rgba(58,61,96,0.18), 0 10px 18px rgba(58,61,96,0.10), inset 0 1px 0 rgba(255,255,255,0.94)",
      stack:
        "0 20px 28px rgba(30,40,90,0.13), inset 0 1px 0 rgba(255,255,255,0.62)",
      curl:
        "drop-shadow(-10px -10px 16px rgba(46,42,78,0.16))",
      pin:
        "drop-shadow(0 10px 16px rgba(40,10,90,0.28))",
    },
  },
},

  window: {
    traffic: {
      size: 14,
      gap: 9,
      shadow:
        "inset 0 1px 1px rgba(255,255,255,0.55), inset 0 -1px 2px rgba(0,0,0,0.24)",
      close: "#FF5F57",
      minimize: "#FEBC2E",
      maximize: "#28C840",
    },
  },
};
