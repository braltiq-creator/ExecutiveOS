import { describe, expect, it } from "vitest";
import {
  EXECUTIVE_ICONS,
  moduleIconForPath,
  openActionLabel,
} from "@/experience/icons";

describe("EXS icon language", () => {
  it("maps modules and KPIs to permanent icons", () => {
    expect(EXECUTIVE_ICONS.organisation_health).toBeTruthy();
    expect(EXECUTIVE_ICONS.priorities).toBeTruthy();
    expect(EXECUTIVE_ICONS.activity).toBeTruthy();
    expect(EXECUTIVE_ICONS.pulse).toBeTruthy();
    expect(moduleIconForPath("/strategy")).toBe(EXECUTIVE_ICONS.strategy);
    expect(moduleIconForPath("/decisions")).toBe(EXECUTIVE_ICONS.decisions);
    expect(moduleIconForPath("/knowledge")).toBe(EXECUTIVE_ICONS.knowledge);
  });

  it("keeps consistent Open action language", () => {
    expect(openActionLabel("/strategy")).toBe("Open Strategy →");
    expect(openActionLabel("/calendar")).toBe("Open →");
  });
});
