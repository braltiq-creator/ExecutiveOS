"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { clampConfidence, EXDS_TONE_VAR } from "../colour";
import type { ExdsCouncilSeat } from "../types";
import { ConfidenceBand } from "./micro/ConfidenceBand";

type CouncilExperienceProps = {
  seats: ExdsCouncilSeat[];
  framing?: string;
  /** Dark deliberation band — executive visual language. */
  variant?: "light" | "dark";
  className?: string;
};

function agreementTone(value: number) {
  if (value >= 75) return EXDS_TONE_VAR.improving;
  if (value >= 45) return EXDS_TONE_VAR.watching;
  return EXDS_TONE_VAR.attention;
}

/**
 * Council deliberation surface — five permanent seats, never manufactured consensus.
 */
export function CouncilExperience({
  seats,
  framing,
  variant = "light",
  className,
}: CouncilExperienceProps) {
  const [activeId, setActiveId] = useState(seats[0]?.id ?? null);
  const active = seats.find((s) => s.id === activeId) ?? seats[0];
  const dark = variant === "dark";

  if (!active) return null;

  const ceo = seats.find((s) => /ceo/i.test(s.role));
  const others = seats.filter((s) => s.id !== ceo?.id);
  const ordered = ceo ? [ceo, ...others] : seats;

  return (
    <section
      className={cn(
        "exds-reveal-up overflow-hidden rounded-[calc(var(--exds-card-radius)+4px)] p-[var(--eos-space-xl)]",
        dark
          ? "border border-[var(--exds-judgement-border)] bg-[var(--exds-dark-band-bg)] text-[var(--exds-dark-band-fg)]"
          : "border border-[var(--exds-card-border)] bg-[var(--exds-card-bg)]",
        className,
      )}
      aria-label="Executive Council"
      data-exds-council={variant}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p
            className="exds-editorial-label"
            style={dark ? { color: EXDS_TONE_VAR.decision } : undefined}
          >
            Executive Council
          </p>
          <p
            className={cn(
              "mt-3 max-w-3xl text-[length:1.2rem] font-semibold leading-snug tracking-[-0.015em]",
              dark ? "text-[var(--exds-dark-band-fg)]" : "text-[var(--eos-color-text)]",
            )}
          >
            {framing ?? "Council position not yet established."}
          </p>
        </div>
        <p
          className="eos-type-caption"
          style={dark ? { color: "var(--exds-dark-band-muted)" } : undefined}
        >
          {seats.length} seats · CEO · CFO · COO · CRO · CSO
        </p>
      </div>

      {/* Deliberation composition */}
      <div
        className="mt-[var(--eos-space-xl)] flex flex-col items-center gap-3"
        role="tablist"
        aria-label="Council seats"
      >
        {ceo ? (
          <SeatButton
            seat={ceo}
            selected={ceo.id === active.id}
            dark={dark}
            onSelect={() => setActiveId(ceo.id)}
            wide
          />
        ) : null}
        <div className="grid w-full gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {(ceo ? others : ordered).map((seat) => (
            <SeatButton
              key={seat.id}
              seat={seat}
              selected={seat.id === active.id}
              dark={dark}
              onSelect={() => setActiveId(seat.id)}
            />
          ))}
        </div>
      </div>

      <div
        className={cn(
          "mt-[var(--eos-space-xl)] grid gap-[var(--eos-space-lg)] border-t pt-[var(--eos-space-lg)] lg:grid-cols-[1.1fr_0.9fr]",
        )}
        style={{
          borderColor: dark
            ? "var(--exds-judgement-border)"
            : "var(--eos-color-divider)",
        }}
        role="tabpanel"
      >
        <div className="space-y-4">
          <div>
            <p
              className="exds-editorial-label"
              style={dark ? { color: "var(--exds-dark-band-muted)" } : undefined}
            >
              Enterprise position
            </p>
            <p
              className={cn(
                "mt-2 eos-type-body",
                dark
                  ? "text-[var(--exds-dark-band-fg)]"
                  : "text-[var(--eos-color-text)]",
              )}
            >
              {active.reasoning}
            </p>
          </div>
          <ConfidenceBand
            value={active.confidence}
            tone="decision"
            className={
              dark
                ? "[&_.eos-type-caption]:text-[var(--exds-dark-band-muted)]"
                : undefined
            }
          />
        </div>

        <div className="space-y-4">
          {active.challenges && active.challenges.length > 0 ? (
            <div>
              <p
                className="exds-editorial-label"
                style={{ color: EXDS_TONE_VAR.watching }}
              >
                Dissent
              </p>
              <ul className="mt-2 space-y-1.5">
                {active.challenges.map((item) => (
                  <li
                    key={item}
                    className="eos-type-supporting border-l-2 pl-2.5"
                    style={{
                      borderColor: EXDS_TONE_VAR.watching,
                      color: dark
                        ? "var(--exds-dark-band-fg)"
                        : "var(--eos-color-text-secondary)",
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div>
              <p
                className="exds-editorial-label"
                style={
                  dark ? { color: "var(--exds-dark-band-muted)" } : undefined
                }
              >
                Unresolved questions
              </p>
              <p
                className="eos-type-supporting mt-2"
                style={
                  dark
                    ? { color: "var(--exds-dark-band-muted)" }
                    : undefined
                }
              >
                Seat-level dissent has not been established for this snapshot.
              </p>
            </div>
          )}
          {active.evidence && active.evidence.length > 0 ? (
            <div>
              <p
                className="exds-editorial-label"
                style={{ color: EXDS_TONE_VAR.intelligence }}
              >
                Evidence
              </p>
              <ul className="mt-2 space-y-1.5">
                {active.evidence.map((item) => (
                  <li
                    key={item}
                    className="eos-type-supporting border-l-2 pl-2.5"
                    style={{
                      borderColor: EXDS_TONE_VAR.intelligence,
                      color: dark
                        ? "var(--exds-dark-band-fg)"
                        : "var(--eos-color-text-secondary)",
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function SeatButton({
  seat,
  selected,
  dark,
  onSelect,
  wide,
}: {
  seat: ExdsCouncilSeat;
  selected: boolean;
  dark: boolean;
  onSelect: () => void;
  wide?: boolean;
}) {
  const conf = clampConfidence(seat.confidence);
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        "exds-focus-ring exds-interactive text-left",
        "rounded-[var(--eos-radius-md)] border px-4 py-3.5",
        wide && "w-full max-w-md",
        selected
          ? dark
            ? "border-[var(--exds-decision)]"
            : "border-[var(--exds-intelligence)] bg-[var(--exds-intelligence-soft)]"
          : dark
            ? "border-[var(--exds-judgement-border)] bg-transparent"
            : "border-[var(--exds-card-border)] bg-transparent",
      )}
      style={
        selected && dark
          ? { background: "rgba(215, 122, 58, 0.14)" }
          : undefined
      }    >
      <p
        className="exds-editorial-label"
        style={{
          color: selected
            ? EXDS_TONE_VAR.decision
            : dark
              ? "var(--exds-dark-band-muted)"
              : EXDS_TONE_VAR.intelligence,
        }}
      >
        {seat.role}
      </p>
      <p
        className={cn(
          "mt-1.5 line-clamp-2 text-[length:0.9rem] font-medium",
          dark ? "text-[var(--exds-dark-band-fg)]" : "text-[var(--eos-color-text)]",
        )}
      >
        {seat.position}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span
          className="eos-type-caption tabular-nums"
          style={dark ? { color: "var(--exds-dark-band-muted)" } : undefined}
        >
          {conf}%
        </span>
        {seat.agreement > 0 ? (
          <span
            className="eos-type-caption tabular-nums"
            style={{ color: agreementTone(seat.agreement) }}
          >
            {clampConfidence(seat.agreement)}% align
          </span>
        ) : null}
      </div>
    </button>
  );
}
