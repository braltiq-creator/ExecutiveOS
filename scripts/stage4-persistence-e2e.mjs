/**
 * Stage 4 verification — Playwright E2E for decision record + refresh + persistence banner.
 * Does not require authenticated Supabase; proves UI-cache path honesty + recorded artefacts.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.env.EOS_BASE_URL ?? "http://127.0.0.1:3012";
const OUT = resolve("/opt/cursor/artifacts");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await context.newPage();
const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});

const report = {
  persistenceMode: null,
  willAttemptServerWrite: null,
  recordedBeforeRefresh: false,
  recordedAfterRefresh: false,
  briefingRecorded: false,
  evidenceIdsVisible: false,
  lifecycleDistinct: false,
  consoleErrorsSample: [],
  screenshots: [],
};

async function shot(name) {
  const path = resolve(OUT, name);
  await page.screenshot({ path, fullPage: false });
  report.screenshots.push(path);
  return path;
}

await page.goto(`${BASE}/dev/phase2-preview?tab=decisions`, {
  waitUntil: "networkidle",
  timeout: 120_000,
});
await page.waitForSelector("[data-decision-intelligence-immersion]", {
  timeout: 60_000,
});

const banner = page.locator("[data-persistence-mode]");
await banner.first().waitFor({ timeout: 15_000 });
report.persistenceMode = await banner.first().getAttribute("data-persistence-mode");
report.willAttemptServerWrite = await banner
  .first()
  .getAttribute("data-will-attempt-server-write");
await shot("stage4_verify_persistence_banner.png");

// Clear prior UI-cache recording so this run exercises a fresh write.
await page.evaluate(() => {
  try {
    localStorage.removeItem("executiveos.portfolio.v1");
  } catch {
    /* ignore */
  }
});
await page.reload({ waitUntil: "networkidle", timeout: 120_000 });
await page.waitForSelector("[data-decision-intelligence-immersion]", {
  timeout: 60_000,
});
await page.waitForSelector("[data-persistence-mode]", { timeout: 15_000 });
report.persistenceMode = await page
  .locator("[data-persistence-mode]")
  .first()
  .getAttribute("data-persistence-mode");

{
  const rationale = page.locator("#decision-record textarea").first();
  await rationale.fill(
    "Protect Model H demand given evidenced QLD and NSW acceleration and Plant 2 load pressure. Stage 4 verification record.",
  );
  const owner = page.locator('#decision-record input[type="text"]').first();
  if ((await owner.count()) > 0) {
    await owner.fill("Executive Verification");
  }
  const checks = page.locator("#decision-record input[type=checkbox]");
  const n = await checks.count();
  for (let i = 0; i < Math.min(n, 2); i++) {
    await checks.nth(i).check({ force: true }).catch(() => {});
  }
  await page.locator("[data-decision-record-commit]").click();
  await page.waitForSelector("[data-decision-recorded-state]", {
    timeout: 20_000,
  });
}

report.recordedBeforeRefresh =
  (await page.locator("[data-decision-recorded-state]").count()) > 0;
const recordedText = await page
  .locator("[data-decision-recorded-state]")
  .innerText();
report.evidenceIdsVisible = /Evidence IDs frozen/i.test(recordedText);
report.lifecycleDistinct =
  /Lifecycle/i.test(recordedText) && /Execution status/i.test(recordedText);
await shot("stage4_verify_recorded_state.png");

await page.reload({ waitUntil: "networkidle", timeout: 120_000 });
await page.goto(`${BASE}/dev/phase2-preview?tab=decisions`, {
  waitUntil: "networkidle",
  timeout: 120_000,
});
await page.waitForSelector("[data-decision-intelligence-immersion]", {
  timeout: 60_000,
});
report.recordedAfterRefresh =
  (await page.locator("[data-decision-recorded-state]").count()) > 0 ||
  (await page.locator('[data-decision-recorded="true"]').count()) > 0;
await shot("stage4_verify_after_refresh.png");

await page.goto(`${BASE}/dev/phase2-preview?tab=briefing`, {
  waitUntil: "networkidle",
  timeout: 120_000,
});
await page.waitForTimeout(1500);
const briefingBody = await page.locator("body").innerText();
report.briefingRecorded = /recorded/i.test(briefingBody);
await shot("stage4_verify_briefing_recorded.png");

// Load map to exercise MapLibre sprite path
await page.goto(`${BASE}/dev/phase2-preview?tab=map`, {
  waitUntil: "networkidle",
  timeout: 120_000,
}).catch(() => {});
await page.waitForTimeout(5000);
await shot("stage4_verify_map_loaded.png");

report.consoleErrorsSample = consoleErrors
  .filter((t) => /circle-11|styleimagemissing|Image/i.test(t))
  .slice(0, 10);
report.otherConsoleErrors = consoleErrors
  .filter((t) => !/circle-11|Download the React DevTools|favicon/i.test(t))
  .slice(0, 15);

console.log(JSON.stringify(report, null, 2));
await browser.close();
process.exit(report.recordedAfterRefresh ? 0 : 1);
