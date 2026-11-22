/**
 * Stage 5a — Authenticated durable persistence E2E (staging Supabase).
 *
 * Requires real auth + MOCK=false. Does not use /dev/phase2-preview as SoT.
 * Fails fast with a clear report when staging secrets are absent.
 *
 * Env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 *   NEXT_PUBLIC_EXECUTIVEOS_MOCK=false
 *   STAGE5A_USER_A_EMAIL / STAGE5A_USER_A_PASSWORD
 *   STAGE5A_USER_B_EMAIL / STAGE5A_USER_B_PASSWORD
 *   STAGE5A_STAGING_APP_URL (default http://127.0.0.1:3013)
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const OUT = resolve("/opt/cursor/artifacts");
mkdirSync(OUT, { recursive: true });

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "STAGE5A_USER_A_EMAIL",
  "STAGE5A_USER_A_PASSWORD",
  "STAGE5A_USER_B_EMAIL",
  "STAGE5A_USER_B_PASSWORD",
];

const report = {
  stage: "5a",
  startedAt: new Date().toISOString(),
  baseUrl: process.env.STAGE5A_STAGING_APP_URL ?? "http://127.0.0.1:3013",
  mockFlag: process.env.NEXT_PUBLIC_EXECUTIVEOS_MOCK ?? null,
  missingSecrets: required.filter((k) => !process.env[k]?.trim()),
  scenarios: {
    authenticatedWrite: null,
    refreshAfterCacheClear: null,
    logoutLogin: null,
    separateBrowser: null,
    orgIsolation: null,
  },
  persistenceMode: null,
  decisionMarker: null,
  screenshots: [],
  blocked: false,
  notes: [],
};

function shotPath(name) {
  return resolve(OUT, name);
}

async function shot(page, name) {
  const path = shotPath(name);
  await page.screenshot({ path, fullPage: false });
  report.screenshots.push(path);
}

function finish(code) {
  report.finishedAt = new Date().toISOString();
  const jsonPath = shotPath("stage5a_acceptance_report.json");
  report.reportPath = jsonPath;
  writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  process.exit(code);
}

if (report.missingSecrets.length > 0) {
  report.blocked = true;
  report.notes.push(
    "Stage 5a blocked: staging Supabase / auth secrets are not available in this environment.",
  );
  finish(2);
}

if (process.env.NEXT_PUBLIC_EXECUTIVEOS_MOCK !== "false") {
  report.blocked = true;
  report.notes.push(
    "Stage 5a blocked: NEXT_PUBLIC_EXECUTIVEOS_MOCK must be exactly 'false' for durable Supabase path.",
  );
  finish(2);
}

const BASE = report.baseUrl;
const MARKER = `Stage5a durable ${new Date().toISOString()}`;

async function signIn(page, email, password) {
  await page.goto(`${BASE}/sign-in`, { waitUntil: "networkidle", timeout: 120_000 });
  await page.locator('input[type="email"], input[name="email"]').first().fill(email);
  await page.locator('input[type="password"], input[name="password"]').first().fill(password);
  await page.getByRole("button", { name: /sign in|log in/i }).first().click();
  await page.waitForTimeout(2500);
}

async function signOut(page) {
  // Prefer account menu if present; fall back to navigating sign-in after logout action
  const logout = page.getByRole("button", { name: /sign out|log out/i });
  if ((await logout.count()) > 0) {
    await logout.first().click();
    await page.waitForTimeout(1500);
    return;
  }
  const link = page.getByRole("link", { name: /sign out|log out/i });
  if ((await link.count()) > 0) {
    await link.first().click();
    await page.waitForTimeout(1500);
  }
}

async function openDecisionsSurface(page) {
  // Prefer Command Centre / decisions — not phase2-preview
  for (const path of ["/today", "/decisions", "/onboarding/snapshot"]) {
    await page.goto(`${BASE}${path}`, {
      waitUntil: "networkidle",
      timeout: 120_000,
    }).catch(() => {});
    await page.waitForTimeout(1000);
    if (page.url().includes("/sign-in")) continue;
    if ((await page.locator("[data-persistence-mode], [data-decision-intelligence-immersion], [data-command-centre]").count()) > 0) {
      return path;
    }
  }
  return null;
}

async function recordIfPossible(page) {
  const mode = await page
    .locator("[data-persistence-mode]")
    .first()
    .getAttribute("data-persistence-mode")
    .catch(() => null);
  report.persistenceMode = mode;

  const commit = page.locator("[data-decision-record-commit]");
  if ((await commit.count()) === 0) {
    report.notes.push(
      "No decision-record commit control found. Ensure User A has an activated manufacturing snapshot and open Decision Intelligence on /today (not phase2-preview).",
    );
    return false;
  }

  if (mode === "ui_cache_only") {
    report.notes.push(
      "Persistence mode is ui_cache_only — activated organisation snapshot required for Stage 5a.",
    );
    return false;
  }

  const rationale = page.locator("textarea").first();
  if ((await rationale.count()) > 0) {
    await rationale.fill(
      `${MARKER}. Protect strategic demand given evidenced capacity pressure. Staging durable persistence proof.`,
    );
  }
  const checks = page.locator("input[type=checkbox]");
  const n = Math.min(await checks.count(), 2);
  for (let i = 0; i < n; i++) {
    await checks.nth(i).check({ force: true }).catch(() => {});
  }
  await commit.first().click();
  await page.waitForSelector("[data-decision-recorded-state], [data-decision-recorded='true']", {
    timeout: 30_000,
  }).catch(() => {});
  const recorded =
    (await page.locator("[data-decision-recorded-state]").count()) > 0 ||
    (await page.locator("[data-decision-recorded='true']").count()) > 0 ||
    (await page.locator("body").innerText()).includes(MARKER);
  report.decisionMarker = MARKER;
  return recorded;
}

async function bodyHasMarker(page) {
  const text = await page.locator("body").innerText();
  return text.includes(MARKER) || /executive decision recorded|decision recorded/i.test(text);
}

const browser = await chromium.launch({ headless: true });

try {
  // --- User A: write ---
  const ctxA = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pageA = await ctxA.newPage();
  await signIn(pageA, process.env.STAGE5A_USER_A_EMAIL, process.env.STAGE5A_USER_A_PASSWORD);
  if (pageA.url().includes("/sign-in")) {
    report.scenarios.authenticatedWrite = false;
    report.notes.push("User A sign-in failed — check staging credentials / email confirmation.");
    await shot(pageA, "stage5a_sign_in_failed.png");
    await browser.close();
    finish(1);
  }

  const surface = await openDecisionsSurface(pageA);
  report.notes.push(`Opened surface: ${surface ?? "none"}`);
  const wrote = await recordIfPossible(pageA);
  report.scenarios.authenticatedWrite = wrote;
  await shot(pageA, "stage5a_after_record.png");

  if (!wrote) {
    await browser.close();
    finish(1);
  }

  // --- Refresh with UI cache cleared ---
  await pageA.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      /* ignore */
    }
  });
  await pageA.reload({ waitUntil: "networkidle", timeout: 120_000 });
  await openDecisionsSurface(pageA);
  report.scenarios.refreshAfterCacheClear = await bodyHasMarker(pageA);
  await shot(pageA, "stage5a_after_refresh_cache_cleared.png");

  // --- Logout / login ---
  await signOut(pageA);
  await signIn(pageA, process.env.STAGE5A_USER_A_EMAIL, process.env.STAGE5A_USER_A_PASSWORD);
  await openDecisionsSurface(pageA);
  report.scenarios.logoutLogin = await bodyHasMarker(pageA);
  await shot(pageA, "stage5a_after_relogin.png");
  await ctxA.close();

  // --- Separate browser ---
  const ctxA2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pageA2 = await ctxA2.newPage();
  await signIn(pageA2, process.env.STAGE5A_USER_A_EMAIL, process.env.STAGE5A_USER_A_PASSWORD);
  await openDecisionsSurface(pageA2);
  report.scenarios.separateBrowser = await bodyHasMarker(pageA2);
  await shot(pageA2, "stage5a_second_browser.png");
  await ctxA2.close();

  // --- Org isolation: User B must not see User A marker ---
  const ctxB = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pageB = await ctxB.newPage();
  await signIn(pageB, process.env.STAGE5A_USER_B_EMAIL, process.env.STAGE5A_USER_B_PASSWORD);
  await openDecisionsSurface(pageB);
  const bSeesA = await bodyHasMarker(pageB);
  report.scenarios.orgIsolation = bSeesA === false;
  if (bSeesA) {
    report.notes.push("ISOLATION FAILURE: User B page text contained User A decision marker.");
  }
  await shot(pageB, "stage5a_org_b_isolation.png");
  await ctxB.close();

  await browser.close();

  const allPass = Object.values(report.scenarios).every((v) => v === true);
  report.notes.push(
    allPass
      ? "Stage 5a ACCEPT — all durable scenarios passed."
      : "Stage 5a FAIL — one or more scenarios did not pass.",
  );
  finish(allPass ? 0 : 1);
} catch (error) {
  report.blocked = false;
  report.notes.push(`Harness error: ${error instanceof Error ? error.message : String(error)}`);
  await browser.close().catch(() => {});
  finish(1);
}
