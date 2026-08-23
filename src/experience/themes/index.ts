/** Experience 2.0 theme contract — CSS imported via globals. */
export const experienceTheme = {
  canvas: "#F7F8FA",
  surface: "#FFFFFF",
  text: "#1A1F2E",
  accent: "#3B6EA5",
  success: "#2F8F68",
  attention: "#C08A3E",
  critical: "#B84545",
} as const;

export type ExperienceTheme = typeof experienceTheme;
