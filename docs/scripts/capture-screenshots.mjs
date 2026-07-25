/**
 * Capture UI screenshots for MkDocs documentation.
 * Requires: frontend running at http://localhost:3000 with NEXT_PUBLIC_MOCK_API=true
 *
 * Usage:
 *   cd frontend && npm run dev   # separate terminal
 *   node docs/scripts/capture-screenshots.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../assets/images/screenshots");
const BASE = process.env.DOCS_SCREENSHOT_BASE ?? "http://localhost:3000";

const SESSIONS = {
  ORG_ADMIN: {
    accessToken: "mock-token-org_admin",
    rememberMe: true,
    user: {
      id: 1,
      email: "admin@demo.local",
      firstName: "Grace",
      lastName: "Admin",
      role: "ORG_ADMIN",
      organizationId: 1,
    },
  },
  FINANCE_MANAGER: {
    accessToken: "mock-token-finance_manager",
    rememberMe: true,
    user: {
      id: 2,
      email: "finance@demo.local",
      firstName: "David",
      lastName: "Mwangi",
      role: "FINANCE_MANAGER",
      organizationId: 1,
    },
  },
  FUNDRAISING_MANAGER: {
    accessToken: "mock-token-fundraising_manager",
    rememberMe: true,
    user: {
      id: 3,
      email: "fundraising@demo.local",
      firstName: "Sarah",
      lastName: "Kimaro",
      role: "FUNDRAISING_MANAGER",
      organizationId: 1,
    },
  },
};

const shots = [
  { name: "login", path: "/login", session: null, wait: 1500 },
  { name: "executive-dashboard", path: "/dashboard/executive", session: "ORG_ADMIN", wait: 2500 },
  { name: "finance-dashboard", path: "/dashboard/finance", session: "FINANCE_MANAGER", wait: 2500 },
  { name: "fundraising-dashboard", path: "/dashboard/fundraising", session: "FUNDRAISING_MANAGER", wait: 2500 },
  { name: "donors-list", path: "/donors", session: "ORG_ADMIN", wait: 2000 },
  { name: "donations-list", path: "/donations", session: "ORG_ADMIN", wait: 2000 },
  { name: "record-donation", path: "/donations/new", session: "ORG_ADMIN", wait: 2000 },
  { name: "campaigns-list", path: "/campaigns", session: "ORG_ADMIN", wait: 2000 },
  { name: "funds-list", path: "/funds", session: "FINANCE_MANAGER", wait: 2000 },
  { name: "expenses-list", path: "/expenses", session: "FINANCE_MANAGER", wait: 2000 },
  { name: "budgets-list", path: "/budgets", session: "FINANCE_MANAGER", wait: 2000 },
  { name: "chart-of-accounts", path: "/accounting/chart-of-accounts", session: "FINANCE_MANAGER", wait: 2000 },
  { name: "reports-hub", path: "/reports", session: "ORG_ADMIN", wait: 2000 },
  { name: "approvals", path: "/approvals", session: "FINANCE_MANAGER", wait: 2000 },
  { name: "admin-users", path: "/admin/users", session: "ORG_ADMIN", wait: 2000 },
  { name: "notifications", path: "/notifications", session: "ORG_ADMIN", wait: 2000 },
];

async function applySession(context, sessionKey) {
  const session = SESSIONS[sessionKey];
  await context.addInitScript(
    ({ state }) => {
      window.localStorage.setItem("fundflow-auth", JSON.stringify({ state, version: 0 }));
      window.localStorage.setItem("fundflow-onboarding-complete", "true");
    },
    { state: session },
  );
}

async function capture(page, shot) {
  await page.goto(`${BASE}${shot.path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(shot.wait);

  if (shot.path.includes("/login")) {
    await page.locator('button:visible', { hasText: "Sign in" }).first().waitFor({ timeout: 10000 });
  } else {
    await page.locator("nav, aside").first().waitFor({ timeout: 10000 });
  }

  const file = path.join(OUT_DIR, `${shot.name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`✓ ${shot.name}.png`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  for (const shot of shots) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });

    if (shot.session) {
      await applySession(context, shot.session);
    } else {
      await context.addInitScript(() => {
        window.localStorage.removeItem("fundflow-auth");
      });
    }

    const page = await context.newPage();

    try {
      await capture(page, shot);
    } catch (err) {
      console.error(`✗ ${shot.name}: ${err.message}`);
    } finally {
      await context.close();
    }
  }

  await browser.close();
  console.log(`\nSaved to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
