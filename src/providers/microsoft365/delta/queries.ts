/**
 * Delta query helpers — incremental Graph synchronisation.
 */

export type DeltaQueryState = {
  resource: string;
  deltaToken: string | null;
  lastSyncedAt: string | null;
  itemsSeen: number;
};

export type DeltaPage<T> = {
  items: T[];
  deltaToken: string | null;
  nextLink: string | null;
  complete: boolean;
};

export function createDeltaState(resource: string): DeltaQueryState {
  return {
    resource,
    deltaToken: null,
    lastSyncedAt: null,
    itemsSeen: 0,
  };
}

export function applyDeltaPage<T>(
  state: DeltaQueryState,
  page: {
    items: T[];
    deltaLink: string | null;
    nextLink: string | null;
  },
  asOf: string,
): { state: DeltaQueryState; page: DeltaPage<T> } {
  const tokenFromLink = page.deltaLink
    ? extractDeltaToken(page.deltaLink)
    : state.deltaToken;

  const nextState: DeltaQueryState = {
    ...state,
    deltaToken: tokenFromLink,
    lastSyncedAt: asOf,
    itemsSeen: state.itemsSeen + page.items.length,
  };

  return {
    state: nextState,
    page: {
      items: page.items,
      deltaToken: tokenFromLink,
      nextLink: page.nextLink,
      complete: page.nextLink == null,
    },
  };
}

export function extractDeltaToken(deltaLink: string): string | null {
  try {
    const url = new URL(deltaLink);
    return (
      url.searchParams.get("$deltatoken") ??
      url.searchParams.get("token") ??
      deltaLink
    );
  } catch {
    return deltaLink;
  }
}

/** Simulate a large-tenant delta stream for tests. */
export function simulateLargeTenantDelta(input: {
  resource: string;
  pages: number;
  itemsPerPage: number;
  asOf: string;
}): { states: DeltaQueryState[]; totalItems: number } {
  let state = createDeltaState(input.resource);
  const states: DeltaQueryState[] = [];
  let totalItems = 0;

  for (let page = 0; page < input.pages; page += 1) {
    const items = Array.from({ length: input.itemsPerPage }, (_, i) => ({
      id: `${input.resource}-${page}-${i}`,
    }));
    const isLast = page === input.pages - 1;
    const applied = applyDeltaPage(
      state,
      {
        items,
        deltaLink: isLast
          ? `https://graph.microsoft.com/v1.0${input.resource}/delta?$deltatoken=final-${page}`
          : null,
        nextLink: isLast
          ? null
          : `https://graph.microsoft.com/v1.0${input.resource}/delta?$skiptoken=${page}`,
      },
      input.asOf,
    );
    state = applied.state;
    states.push(state);
    totalItems += items.length;
  }

  return { states, totalItems };
}
