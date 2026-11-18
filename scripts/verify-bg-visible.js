const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const SCREENSHOT_DIR = "C:\\Users\\Asus\\.gemini\\antigravity\\brain\\10b6f4f9-eeeb-4f17-8141-4c34642fcafb\\screenshots\\bg_check";

async function verifyBackground() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log("Navigating to http://localhost:3000 ...");
    await page.goto("http://localhost:3000", { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "landing-with-bg.png") });
    console.log("✔ Landing page screenshot saved.");

    console.log("Navigating to http://localhost:3000/login ...");
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "login-with-bg.png") });
    console.log("✔ Login page screenshot saved.");

    console.log("SUCCESS! Screenshots saved in:", SCREENSHOT_DIR);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await browser.close();
  }
}

verifyBackground();
