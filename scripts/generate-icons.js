const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const SVG_PATH = path.join(__dirname, "..", "public", "icons", "app-icon.svg");
const ICONS_DIR = path.join(__dirname, "..", "public", "icons");

const SIZES = [512, 192, 144, 96, 72, 48];

async function generateIcons() {
  console.log("Generating app icons from SVG...");
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  const svgContent = fs.readFileSync(SVG_PATH, "utf8");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body, html { margin: 0; padding: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: transparent; }
            svg { width: 100%; height: 100%; }
          </style>
        </head>
        <body>${svgContent}</body>
      </html>
    `;

    for (const size of SIZES) {
      await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
      await page.setContent(htmlContent, { waitUntil: "load" });
      const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
      await page.screenshot({ path: outputPath, omitBackground: true });
      console.log(`✔ Generated ${size}x${size} icon: ${outputPath}`);
    }

    // Also copy 512x512 to public/icon.png and public/apple-touch-icon.png
    fs.copyFileSync(path.join(ICONS_DIR, "icon-512x512.png"), path.join(__dirname, "..", "public", "icon.png"));
    fs.copyFileSync(path.join(ICONS_DIR, "icon-192x192.png"), path.join(__dirname, "..", "public", "apple-touch-icon.png"));
    console.log("✔ Icons generated successfully!");
  } catch (err) {
    console.error("Error generating icons:", err);
  } finally {
    await browser.close();
  }
}

generateIcons();
