// categoryTheme.ts

export const categoryTheme = {
  GRO: { color: "#31B84A", bg: "rgba(49, 184, 74, 0.12)" },
  HIM: { color: "#8E5CD9", bg: "rgba(142, 92, 217, 0.12)" },
  PT: { color: "#F2C300", bg: "rgba(242, 195, 0, 0.16)" },
  HR: { color: "#8B5E3C", bg: "rgba(139, 94, 60, 0.12)" },
  UB: { color: "#F59E0B", bg: "rgba(245, 158, 11, 0.14)" },
  HLT: { color: "#2EC4B6", bg: "rgba(46, 196, 182, 0.12)" },
  EDU: { color: "#3B82F6", bg: "rgba(59, 130, 246, 0.12)" },
  CLT: { color: "#EC4899", bg: "rgba(236, 72, 153, 0.12)" },
  ENT: { color: "#F05A9D", bg: "rgba(240, 90, 157, 0.12)" },
  TRV: { color: "#14B8A6", bg: "rgba(20, 184, 166, 0.12)" },
  SPT: { color: "#2DA8E8", bg: "rgba(45, 168, 232, 0.13)" },
  BTY: { color: "#D946EF", bg: "rgba(217, 70, 239, 0.12)" },
  GFT: { color: "#EF4444", bg: "rgba(239, 68, 68, 0.12)" },
  REP: { color: "#64748B", bg: "rgba(100, 116, 139, 0.14)" },
  HOB: { color: "#FF7A3D", bg: "rgba(255, 122, 61, 0.13)" },
  PTS: { color: "#A16207", bg: "rgba(161, 98, 7, 0.13)" },
  INS: { color: "#0EA5E9", bg: "rgba(14, 165, 233, 0.12)" },
  TX: { color: "#475569", bg: "rgba(71, 85, 105, 0.14)" },
  FUE: { color: "#F97316", bg: "rgba(249, 115, 22, 0.13)" },
  INV: { color: "#16A34A", bg: "rgba(22, 163, 74, 0.12)" },
  CHY: { color: "#E11D48", bg: "rgba(225, 29, 72, 0.11)" },
  IC: { color: "#6366F1", bg: "rgba(99, 102, 241, 0.12)" },
  CG: { color: "#FB7185", bg: "rgba(251, 113, 133, 0.13)" },
  VD: { color: "#2563EB", bg: "rgba(37, 99, 235, 0.12)" },
  SUB: { color: "#7C3AED", bg: "rgba(124, 58, 237, 0.12)" },
  CRE: { color: "#DC2626", bg: "rgba(220, 38, 38, 0.11)" },
} as const;

export type CategoryCode = keyof typeof categoryTheme;
