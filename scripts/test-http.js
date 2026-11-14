const http = require("http");

http.get("http://127.0.0.1:3000/api/tables", (res) => {
  console.log("Status:", res.statusCode);
  let d = "";
  res.on("data", c => d += c);
  res.on("end", () => console.log("Body length:", d.length));
}).on("error", (e) => {
  console.error("HTTP GET ERROR:", e.message);
});
