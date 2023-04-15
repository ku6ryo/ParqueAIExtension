const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, "src");
const distDir = path.join(__dirname, "dist");

[srcDir, distDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
})

fs.copyFileSync(path.join(srcDir, "manifest.json"), path.join(distDir, "manifest.json"))