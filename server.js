// Simple Express server for the InnoState site.
// Serves the static frontend and one small API route for property data.

const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

// the properties page fetches its listings from here instead of
// hardcoding them in the HTML - keeps the data in one place
app.get("/api/properties", (req, res) => {
  fs.readFile(path.join(__dirname, "data", "properties.json"), "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Could not load property data" });
    }
    res.json(JSON.parse(data));
  });
});

app.listen(PORT, () => {
  console.log(`InnoState server running at http://localhost:${PORT}`);
});
