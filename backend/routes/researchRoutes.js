
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resultsPath = path.join(
  __dirname,
  "../data/research_results.json"
);

router.get("/results", (req, res) => {
  try {
    const results = JSON.parse(
      fs.readFileSync(resultsPath, "utf8")
    );

    res.json(results);
  } catch (error) {
    console.error("Research results error:", error);

    res.status(500).json({
      message: "Unable to load research results"
    });
  }
});

export default router;
