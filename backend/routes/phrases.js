const express = require("express");
const router = express.Router();
const phrases = require("../data/phrases");

// GET /scenarios — returns all unique scenarios
router.get("/scenarios", (req, res) => {
  const scenarios = [...new Set(phrases.map(p => p.scenario))];
  res.json(scenarios);
});

// GET /phrases?scenario=cashier — returns phrases for a scenario
router.get("/phrases", (req, res) => {
  const { scenario } = req.query;

  if (!scenario) {
    return res.status(400).json({ error: "scenario query param is required" });
  }

  const result = phrases.filter(p => p.scenario === scenario);

  if (result.length === 0) {
    return res.status(404).json({ error: "No phrases found for this scenario" });
  }

  res.json(result);
});

module.exports = router;
