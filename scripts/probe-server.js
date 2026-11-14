const http = require("http");

async function check() {
  console.log("Checking http://localhost:3000/api/tables ...");
  return new Promise((resolve, reject) => {
    http.get("http://localhost:3000/api/tables", (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          resolve(data);
        }
      });
    }).on("error", reject);
  });
}

async function main() {
  // Retry up to 5 times
  for (let i = 0; i < 6; i++) {
    try {
      const res = await check();
      console.log("SUCCESS! Received response from server:");
      console.log(`Sections count: ${res.sections?.length || 0}`);
      console.log(`Tables count: ${res.tables?.length || 0}`);
      process.exit(0);
    } catch (err) {
      console.log(`Attempt ${i + 1}: server not ready yet, waiting 2s...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  console.error("Server did not respond in time.");
  process.exit(1);
}

main();
