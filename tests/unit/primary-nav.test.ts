import { describe, expect, it } from "vitest";
import {
  PRIMARY_NAV,
  isPrimaryNavActive,
} from "@/lib/navigation/primary-nav";

describe("primary navigation", () => {
  it("defines Experience 2.0 primary items including Data & Sources", () => {
    expect(PRIMARY_NAV.map((item) => item.label)).toEqual([
      "Today",
      "Strategy",
      "Decisions",
      "Knowledge",
      "Reports",
      "Data & Sources",
      "Administration",
    ]);
  });

  it("treats dashboard and today as the Today destination", () => {
    expect(isPrimaryNavActive("/today", "/today")).toBe(true);
    expect(isPrimaryNavActive("/dashboard", "/today")).toBe(true);
  });

  it("maps intent to Strategy", () => {
    expect(isPrimaryNavActive("/strategy", "/strategy")).toBe(true);
    expect(isPrimaryNavActive("/intent", "/strategy")).toBe(true);
  });

  it("maps settings and organisation to Administration", () => {
    expect(isPrimaryNavActive("/administration", "/administration")).toBe(
      true,
    );
    expect(isPrimaryNavActive("/settings/billing", "/administration")).toBe(
      true,
    );
    expect(isPrimaryNavActive("/organization", "/administration")).toBe(true);
  });

  it("maps legacy graph path to Knowledge", () => {
    expect(isPrimaryNavActive("/knowledge", "/knowledge")).toBe(true);
    expect(isPrimaryNavActive("/graph", "/knowledge")).toBe(true);
  });
});
