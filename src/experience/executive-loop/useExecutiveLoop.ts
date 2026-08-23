"use client";

import { useSyncExternalStore } from "react";
import {
  getLoopState,
  subscribeLoop,
} from "@/experience/executive-loop/store";
import type { LoopState } from "@/experience/executive-loop/types";

export function useExecutiveLoop(): LoopState {
  return useSyncExternalStore(subscribeLoop, getLoopState, getLoopState);
}
