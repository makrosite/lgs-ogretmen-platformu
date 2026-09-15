const fs = require("fs");
const path = require("path");

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);
fs.writeFileSync(path.join(__dirname, "../public/icon-192.png"), png);
fs.writeFileSync(path.join(__dirname, "../public/icon-512.png"), png);
console.log("icons ok");
