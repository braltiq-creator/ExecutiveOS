/**
 * Executive Agenda
 * Leadership strategic priorities — coordination, not project management.
 */

export type * from "@/agenda/models/types";
export { AGENDA_PRIORITIES } from "@/agenda/models/types";

export { buildExecutiveAgenda } from "@/agenda/build";
export { applyExecutiveAgenda } from "@/agenda/apply";
export { toExecutiveAgendaView } from "@/agenda/to-view";
