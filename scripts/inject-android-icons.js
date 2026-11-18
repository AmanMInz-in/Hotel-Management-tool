const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ICONS = path.join(ROOT, "public", "icons");
const RES = path.join(ROOT, "android", "app", "src", "main", "res");

const DENSITIES = [
  { dir: "mipmap-mdpi", file: "icon-48x48.png" },
  { dir: "mipmap-hdpi", file: "icon-72x72.png" },
  { dir: "mipmap-xhdpi", file: "icon-96x96.png" },
  { dir: "mipmap-xxhdpi", file: "icon-144x144.png" },
  { dir: "mipmap-xxxhdpi", file: "icon-192x192.png" },
];

for (const { dir, file } of DENSITIES) {
  const targetDir = path.join(RES, dir);
  const srcIcon = path.join(ICONS, file);

  if (fs.existsSync(targetDir) && fs.existsSync(srcIcon)) {
    fs.copyFileSync(srcIcon, path.join(targetDir, "ic_launcher.png"));
    fs.copyFileSync(srcIcon, path.join(targetDir, "ic_launcher_round.png"));
    fs.copyFileSync(srcIcon, path.join(targetDir, "ic_launcher_foreground.png"));
    console.log(`✔ Injected custom Grand Bistro icons into ${dir}`);
  }
}

console.log("✔ Android icons successfully updated!");
