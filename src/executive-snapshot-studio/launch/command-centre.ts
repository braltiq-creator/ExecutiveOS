/** Command Centre launch — existing Mission Control at /today. */
export const COMMAND_CENTRE_HREF = "/today" as const;

export function launchCommandCentreHref(
  studioId?: string,
): string {
  if (!studioId) return COMMAND_CENTRE_HREF;
  return `${COMMAND_CENTRE_HREF}?studio=${encodeURIComponent(studioId)}`;
}
