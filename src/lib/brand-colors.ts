export const TCPL_BRAND_RED = {
  vivid: "#ff0000",
  primary: "#dc2626",
  dark: "#991b1b",
  dashboardCard: "#b80000",
  bright: "#ef4444",
} as const;

export const TCPL_AURORA_COLORS = [
  TCPL_BRAND_RED.vivid,
  TCPL_BRAND_RED.primary,
  TCPL_BRAND_RED.dark,
  TCPL_BRAND_RED.bright,
] as const;

export const TCPL_AURORA_MUTED = [
  "#71717a",
  "#a1a1aa",
  "#52525b",
  "#3f3f46",
] as const;

export const TCPL_ACTION = {
  primary: TCPL_BRAND_RED.primary,
  primaryHover: TCPL_BRAND_RED.bright,
  success: "#16a34a",
  warning: "#d97706",
  danger: "#dc2626",
  neutral: "#71717a",
} as const;
