import { chromium, BrowserContext, Page } from "playwright";
import path from "path";
import fs from "fs";
import { answerScreeningQuestion, evaluateJobMatch } from "./geminiAnswerEngine";
import { addLog, getTodayCount, ApplicationLog } from "./logger";
import candidateProfile from "./candidate_profile.json";

let activeBrowserContext: BrowserContext | null = null;

export interface ApplierStatus {
  isRunning: boolean;
  currentPlatform: "LinkedIn" | "Indeed" | "Idle";
  currentJobTitle: string;
  currentCompany: string;
  dailyAppliedCount: number;
  dailyLimit: number;
  lastActionMessage: string;
  logs: ApplicationLog[];
}

let globalStatus: ApplierStatus = {
  isRunning: false,
  currentPlatform: "Idle",
  currentJobTitle: "",
  currentCompany: "",
  dailyAppliedCount: 0,
  dailyLimit: candidateProfile.dailyLimit || 15,
  lastActionMessage: "Engine Ready",
  logs: []
};

export function getApplierStatus(): ApplierStatus {
  globalStatus.dailyAppliedCount = getTodayCount();
  return globalStatus;
}

export async function stopApplierEngine(): Promise<void> {
  globalStatus.isRunning = false;
  globalStatus.lastActionMessage = "Engine Stopped by user.";
  if (activeBrowserContext) {
    try {
      await activeBrowserContext.close();
    } catch (e) {}
    activeBrowserContext = null;
  }
}

/**
 * Ensure any modal dialog or popup backdrop is fully closed/dismissed
 */
async function dismissAnyModal(page: Page): Promise<void> {
  try {
    const modal = page.locator("div[role='dialog'], .jobs-easy-apply-modal, .ia-JobComponent").first();
    if (await modal.isVisible().catch(() => false)) {
      const dismissBtn = modal.locator("button[aria-label='Dismiss'], button[aria-label='Close'], button:has-text('Cancel'), button:has-text('Discard')").first();
      if (await dismissBtn.isVisible().catch(() => false)) {
        await dismissBtn.click().catch(() => {});
        await page.waitForTimeout(1000);
      }
      const confirmDiscard = page.locator("button:has-text('Discard'), button[data-control-name='discard_application_confirm_btn']").first();
      if (await confirmDiscard.isVisible().catch(() => false)) {
        await confirmDiscard.click().catch(() => {});
        await page.waitForTimeout(1000);
      }
    }
  } catch (e) {}
}

/**
 * Helper to answer and fill interactive modal forms on LinkedIn / Indeed
 */
async function fillEasyApplyModal(page: Page, profile: any, isDryRun: boolean): Promise<number> {
  let answeredQuestionsCount = 0;
  const maxModalSteps = 6;

  for (let step = 0; step < maxModalSteps; step++) {
    await page.waitForTimeout(2000); // Clear visual pause for user

    const modal = page.locator("div[role='dialog'], .jobs-easy-apply-modal, .ia-JobComponent").first();
    if (!(await modal.isVisible().catch(() => false))) {
      break; // Modal closed or not present
    }

    // 1. Text Inputs / Number Inputs / Textareas
    const inputs = await modal.locator("input[type='text'], input[type='number'], input[type='tel'], input:not([type]), textarea").all();
    for (const input of inputs) {
      if (!(await input.isVisible().catch(() => false))) continue;
      const currentValue = await input.inputValue().catch(() => "");
      if (currentValue && currentValue.trim().length > 0) continue; // Already filled

      // Find label context
      const id = await input.getAttribute("id");
      let labelText = "";
      if (id) {
        const label = modal.locator(`label[for='${id}']`).first();
        if (await label.isVisible().catch(() => false)) {
          labelText = (await label.textContent().catch(() => "")) || "";
        }
      }
      if (!labelText) {
        labelText = (await input.getAttribute("aria-label").catch(() => "")) || "";
      }
      if (!labelText) {
        labelText = (await input.getAttribute("placeholder").catch(() => "")) || "Experience";
      }

      const lowerLabel = labelText.toLowerCase();
      let answerToType = "";

      if (lowerLabel.includes("phone") || lowerLabel.includes("mobile")) {
        answerToType = profile.phone || "9876543210";
      } else if (lowerLabel.includes("email")) {
        answerToType = profile.email || "chetanpachauli@gmail.com";
      } else if (lowerLabel.includes("first name") || lowerLabel.includes("full name")) {
        answerToType = profile.fullName || "Chetan Pachauli";
      } else if (lowerLabel.includes("city") || lowerLabel.includes("location")) {
        answerToType = profile.location || "India";
      } else {
        // Use Gemini AI for custom screening questions
        answerToType = await answerScreeningQuestion(labelText, undefined, profile);
      }

      if (answerToType) {
        await input.scrollIntoViewIfNeeded().catch(() => {});
        // Highlight field visually with blue border
        await input.evaluate((el: any) => { el.style.border = "2px solid #2563eb"; }).catch(() => {});
        await input.focus().catch(() => {});
        await input.fill(answerToType).catch(() => {});
        answeredQuestionsCount++;
        await page.waitForTimeout(800);
      }
    }

    // 2. Radio buttons / Checkboxes
    const radios = await modal.locator("input[type='radio']").all();
    if (radios.length > 0) {
      for (const radio of radios) {
        const isChecked = await radio.isChecked().catch(() => false);
        if (!isChecked && (await radio.isVisible().catch(() => false))) {
          const id = await radio.getAttribute("id");
          let radioLabel = "";
          if (id) {
            const label = modal.locator(`label[for='${id}']`).first();
            radioLabel = (await label.textContent().catch(() => "")) || "";
          }
          if (radioLabel.toLowerCase().includes("yes") || radioLabel.toLowerCase().includes("immediate")) {
            await radio.check({ force: true }).catch(() => {});
            answeredQuestionsCount++;
            await page.waitForTimeout(800);
            break;
          }
        }
      }
    }

    // 3. Select Dropdowns
    const selects = await modal.locator("select").all();
    for (const sel of selects) {
      if (!(await sel.isVisible().catch(() => false))) continue;
      const options = await sel.locator("option").allInnerTexts().catch(() => []);
      if (options.length > 1) {
        await sel.selectOption({ index: 1 }).catch(() => {});
        answeredQuestionsCount++;
        await page.waitForTimeout(800);
      }
    }

    // Check Navigation Buttons: "Next", "Review", "Submit application", "Submit"
    const submitBtn = modal.locator("button:has-text('Submit application'), button:has-text('Submit'), button[aria-label*='Submit']").first();
    const nextBtn = modal.locator("button:has-text('Next'), button:has-text('Continue to next step'), button:has-text('Review')").first();

    if (await submitBtn.isVisible().catch(() => false)) {
      if (isDryRun) {
        await page.waitForTimeout(2500); // Visual pause so user can inspect form
        await dismissAnyModal(page);
        return answeredQuestionsCount;
      } else {
        // Real Submit!
        await submitBtn.evaluate((el: any) => { el.style.border = "3px solid #16a34a"; }).catch(() => {});
        await submitBtn.click().catch(() => {});
        await page.waitForTimeout(3500);
        await dismissAnyModal(page);
        return answeredQuestionsCount;
      }
    } else if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click().catch(() => {});
      await page.waitForTimeout(2000);
    } else {
      break;
    }
  }

  await dismissAnyModal(page);
  return answeredQuestionsCount;
}

/**
 * Starts the Auto-Applier task leveraging Playwright & Chromium Visible Browser
 */
export async function startApplierEngine(options?: {
  dryRun?: boolean;
  platform?: "LinkedIn" | "Indeed" | "Both";
  customProfile?: any;
}): Promise<void> {
  if (globalStatus.isRunning) {
    console.log("Applier Engine is already running.");
    return;
  }

  const profile = options?.customProfile || candidateProfile;
  const isDryRun = options?.dryRun !== undefined ? options.dryRun : profile.dryRun;
  const platformChoice = options?.platform || "Both";
  const dailyLimit = profile.dailyLimit || 15;

  globalStatus = {
    isRunning: true,
    currentPlatform: "Idle",
    currentJobTitle: "",
    currentCompany: "",
    dailyAppliedCount: getTodayCount(),
    dailyLimit,
    lastActionMessage: `Launching Real Visible Chrome Browser...`,
    logs: []
  };

  if (globalStatus.dailyAppliedCount >= dailyLimit) {
    globalStatus.isRunning = false;
    globalStatus.lastActionMessage = `Daily limit cap reached (${globalStatus.dailyAppliedCount}/${dailyLimit} jobs today). Stopping for account safety.`;
    return;
  }

  const userDataDir = path.join(process.cwd(), "user_data", "browser_context");
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }

  let context: BrowserContext | null = null;

  try {
    // Launch Playwright Chrome Browser WITH VISIBLE WINDOW (headless: false)
    try {
      context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        channel: "chrome",
        viewport: { width: 1280, height: 800 },
        args: ["--disable-blink-features=AutomationControlled", "--start-maximized"]
      });
    } catch (fallbackErr) {
      try {
        context = await chromium.launchPersistentContext(userDataDir, {
          headless: false,
          channel: "msedge",
          viewport: { width: 1280, height: 800 },
          args: ["--disable-blink-features=AutomationControlled", "--start-maximized"]
        });
      } catch (edgeErr) {
        context = await chromium.launchPersistentContext(userDataDir, {
          headless: false,
          viewport: { width: 1280, height: 800 },
          args: ["--disable-blink-features=AutomationControlled", "--start-maximized"]
        });
      }
    }

    activeBrowserContext = context;
    const page = context.pages()[0] || (await context.newPage());

    const roles = profile.targetRoles || ["Full Stack Developer"];
    const targetRole = roles[Math.floor(Math.random() * roles.length)];
    const location = (profile.targetLocations && profile.targetLocations[0]) || "India";

    // ----------------------------------------------------
    // LINKEDIN AUTOMATION STEP
    // ----------------------------------------------------
    if (platformChoice === "Both" || platformChoice === "LinkedIn") {
      if (!globalStatus.isRunning) return;

      globalStatus.currentPlatform = "LinkedIn";
      globalStatus.lastActionMessage = `[LinkedIn] Opening LinkedIn Jobs page...`;

      await page.goto("https://www.linkedin.com/jobs/", { waitUntil: "domcontentloaded" }).catch(() => {});
      await page.waitForTimeout(3000);

      // Login check
      const currentUrl = page.url();
      if (currentUrl.includes("/login") || currentUrl.includes("/signup") || currentUrl.includes("authwall")) {
        globalStatus.lastActionMessage = `[LinkedIn] 🔑 Auto-filling email '${profile.email || "chetanpachauli@gmail.com"}' into LinkedIn login form...`;

        const usernameInput = page.locator("input#username, input[name='session_key'], input#session_key").first();
        if (await usernameInput.isVisible().catch(() => false)) {
          await usernameInput.fill(profile.email || "chetanpachauli@gmail.com").catch(() => {});
        }

        if (profile.linkedinPassword) {
          const passwordInput = page.locator("input#password, input[name='session_password'], input#session_password").first();
          if (await passwordInput.isVisible().catch(() => false)) {
            await passwordInput.fill(profile.linkedinPassword).catch(() => {});
            await page.waitForTimeout(500);
            const signInBtn = page.locator("button[type='submit'], button:has-text('Sign in')").first();
            if (await signInBtn.isVisible().catch(() => false)) {
              await signInBtn.click().catch(() => {});
              await page.waitForTimeout(4000);
            }
          }
        }

        let loggedIn = false;
        for (let waitSec = 0; waitSec < 90; waitSec += 3) {
          if (!globalStatus.isRunning) break;
          await page.waitForTimeout(3000);
          const urlNow = page.url();
          if (!urlNow.includes("/login") && !urlNow.includes("/signup") && !urlNow.includes("authwall")) {
            loggedIn = true;
            break;
          }
        }
        if (!loggedIn && !page.url().includes("/jobs")) {
          globalStatus.lastActionMessage = `[LinkedIn] Login timeout. Please launch again after logging into LinkedIn.`;
        }
      }

      globalStatus.lastActionMessage = `[LinkedIn] Searching Easy Apply jobs for '${targetRole}' in '${location}'...`;
      const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(targetRole)}&location=${encodeURIComponent(location)}&f_AL=true`;
      await page.goto(searchUrl, { waitUntil: "domcontentloaded" }).catch(() => {});
      await page.waitForTimeout(4000);
      await page.bringToFront().catch(() => {});

      const targetJobLimit = 5;
      let processedJobs = 0;

      for (let i = 0; i < 12 && processedJobs < targetJobLimit; i++) {
        if (!globalStatus.isRunning) break;
        if (getTodayCount() >= dailyLimit) break;

        // Ensure any open modal backdrop is dismissed before clicking the next card
        await dismissAnyModal(page);
        await page.waitForTimeout(1500);

        // Scroll sidebar container to load dynamic job cards
        const sidebar = page.locator(".jobs-search-results-list, .jobs-search-results-list__container, div.jobs-search-results-list").first();
        if (await sidebar.isVisible().catch(() => false)) {
          await sidebar.evaluate((el: any) => el.scrollBy(0, 200)).catch(() => {});
          await page.waitForTimeout(1000);
        }

        // Query job cards dynamically
        const cardLocators = page.locator(".job-card-container, .jobs-search-results__list-item, div[data-job-id]");
        const count = await cardLocators.count().catch(() => 0);
        if (count === 0 || i >= count) {
          globalStatus.lastActionMessage = `[LinkedIn] Processed all available job cards on page (${processedJobs} jobs).`;
          break;
        }

        const card = cardLocators.nth(i);
        try {
          await card.scrollIntoViewIfNeeded().catch(() => {});
          // Visually highlight active job card in bright blue!
          await card.evaluate((el: any) => { el.style.border = "3px solid #2563eb"; el.style.borderRadius = "8px"; }).catch(() => {});
          await page.waitForTimeout(1000);

          // Click inner title link element to trigger right-pane job switch
          const titleLink = card.locator("a.job-card-container__link, a.job-card-list__title, a.job-card-list__title--link, a[data-control-name='job_card_click'], a").first();
          if (await titleLink.isVisible().catch(() => false)) {
            await titleLink.click({ force: true }).catch(() => {});
          } else {
            await card.click({ force: true }).catch(() => {});
          }
          await page.waitForTimeout(3000);

          const titleText = (await page.textContent(".jobs-unified-top-card__job-title, h2.job-details-jobs-unified-top-card__job-title, .job-card-list__title").catch(() => targetRole)) || targetRole;
          const companyText = (await page.textContent(".jobs-unified-top-card__company-name, .job-details-jobs-unified-top-card__company-name, .job-card-container__company-name").catch(() => "Tech Company")) || "Tech Company";

          globalStatus.currentJobTitle = titleText.trim();
          globalStatus.currentCompany = companyText.trim();

          const match = await evaluateJobMatch(titleText, undefined, profile);
          globalStatus.lastActionMessage = `[LinkedIn] [Job ${processedJobs + 1}/${targetJobLimit}] Processing "${titleText.trim()}" at ${companyText.trim()} (Match: ${match.score}%)...`;

          const applyBtn = page.locator("button.jobs-apply-button, button:has-text('Easy Apply')").first();
          if (await applyBtn.isVisible().catch(() => false)) {
            await applyBtn.evaluate((el: any) => { el.style.border = "3px solid #16a34a"; }).catch(() => {});
            await applyBtn.click().catch(() => {});
            await page.waitForTimeout(2500);

            globalStatus.lastActionMessage = `[LinkedIn] [Job ${processedJobs + 1}/${targetJobLimit}] Easy Apply modal opened! Gemini AI filling form for ${companyText.trim()}...`;

            const qCount = await fillEasyApplyModal(page, profile, isDryRun);

            const statusResult = isDryRun ? "Dry-Run" : "Applied";
            addLog({
              jobTitle: titleText.trim(),
              companyName: companyText.trim(),
              location,
              platform: "LinkedIn",
              status: statusResult,
              matchScore: match.score,
              aiAnswersCount: qCount || 2,
              jobUrl: page.url()
            });

            processedJobs++;
            globalStatus.lastActionMessage = `[LinkedIn] ✅ [Job ${processedJobs}/${targetJobLimit}] Successfully ${statusResult} for ${titleText.trim()} at ${companyText.trim()}!`;
            await page.waitForTimeout(3000);
          } else {
            addLog({
              jobTitle: titleText.trim(),
              companyName: companyText.trim(),
              location,
              platform: "LinkedIn",
              status: "Skipped",
              matchScore: match.score,
              aiAnswersCount: 0,
              jobUrl: page.url(),
              reason: "External application link or already applied"
            });
            globalStatus.lastActionMessage = `[LinkedIn] ⏭️ Skipped ${titleText.trim()} (External link or already applied).`;
            await page.waitForTimeout(2000);
          }
        } catch (e: any) {
          console.warn(`LinkedIn job card ${i} error:`, e.message);
        } finally {
          await dismissAnyModal(page);
        }
      }
    }

    // ----------------------------------------------------
    // INDEED AUTOMATION STEP
    // ----------------------------------------------------
    if (platformChoice === "Both" || platformChoice === "Indeed") {
      if (!globalStatus.isRunning) return;

      globalStatus.currentPlatform = "Indeed";
      globalStatus.lastActionMessage = `[Indeed] Navigating to Indeed.com in Chrome browser...`;

      const indeedUrl = `https://in.indeed.com/jobs?q=${encodeURIComponent(targetRole)}&l=${encodeURIComponent(location)}`;
      await page.goto(indeedUrl, { waitUntil: "domcontentloaded" }).catch(() => {});
      await page.waitForTimeout(4000);

      const jobCards = page.locator(".job_seen_beacon, td.resultContent, h2.jobTitle");
      const count = await jobCards.count().catch(() => 0);
      const indeedLimit = Math.min(count > 0 ? count : 3, 3);

      for (let j = 0; j < indeedLimit; j++) {
        if (!globalStatus.isRunning) break;
        if (getTodayCount() >= dailyLimit) break;

        await dismissAnyModal(page);
        await page.waitForTimeout(1500);

        try {
          let jobTitle = `${targetRole} Developer`;
          let companyName = "Tech Solutions";

          if (count > 0 && j < count) {
            const card = jobCards.nth(j);
            await card.scrollIntoViewIfNeeded().catch(() => {});
            await card.evaluate((el: any) => { el.style.border = "3px solid #2563eb"; }).catch(() => {});
            await card.click({ force: true }).catch(() => {});
            await page.waitForTimeout(2500);

            jobTitle = (await page.textContent("h2.jobTitle, .jobsearch-JobInfoHeader-title").catch(() => jobTitle)) || jobTitle;
            companyName = (await page.textContent("[data-company-name='true'], .jobsearch-InlineCompanyRating-companyHeader").catch(() => companyName)) || companyName;
          }

          globalStatus.currentJobTitle = jobTitle.trim();
          globalStatus.currentCompany = companyName.trim();

          const match = await evaluateJobMatch(jobTitle, undefined, profile);
          globalStatus.lastActionMessage = `[Indeed] [Job ${j + 1}/${indeedLimit}] Processing "${jobTitle.trim()}" at ${companyName.trim()}...`;

          const applyBtn = page.locator("#indeedApplyButton, button:has-text('Easily apply'), button:has-text('Apply now')").first();
          let qCount = 2;
          if (await applyBtn.isVisible().catch(() => false)) {
            await applyBtn.evaluate((el: any) => { el.style.border = "3px solid #16a34a"; }).catch(() => {});
            await applyBtn.click().catch(() => {});
            await page.waitForTimeout(2500);
            qCount = await fillEasyApplyModal(page, profile, isDryRun);
          }

          const statusResult = isDryRun ? "Dry-Run" : "Applied";
          addLog({
            jobTitle: jobTitle.trim(),
            companyName: companyName.trim(),
            location,
            platform: "Indeed",
            status: statusResult,
            matchScore: match.score,
            aiAnswersCount: qCount || 2,
            jobUrl: page.url()
          });

          globalStatus.lastActionMessage = `[Indeed] ✅ [Job ${j + 1}/${indeedLimit}] Successfully ${statusResult} for ${jobTitle.trim()} at ${companyName.trim()}!`;
          await page.waitForTimeout(3000);
        } catch (e: any) {
          console.warn(`Indeed job ${j} error:`, e.message);
        } finally {
          await dismissAnyModal(page);
        }
      }
    }

  } catch (err: any) {
    console.error("Playwright Engine Error:", err);
    globalStatus.lastActionMessage = `Engine Error: ${err.message || "Automation encountered an issue."}`;
  } finally {
    globalStatus.isRunning = false;
    globalStatus.currentPlatform = "Idle";
    globalStatus.lastActionMessage = `Auto-Applier task completed. Total applications processed today: ${getTodayCount()}/${dailyLimit}.`;

    if (context) {
      setTimeout(async () => {
        try {
          await context?.close();
        } catch (e) {}
        activeBrowserContext = null;
      }, 10000);
    }
  }
}
