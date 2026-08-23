"use server";

import { askChiefOfStaff } from "@/lib/ai/service";
import type {
  ChiefOfStaffResponse,
  ConversationTurn,
} from "@/lib/ai/types";

export async function sendChiefOfStaffMessage(
  message: string,
  history: ConversationTurn[],
): Promise<ChiefOfStaffResponse> {
  return askChiefOfStaff({ message, history });
}
