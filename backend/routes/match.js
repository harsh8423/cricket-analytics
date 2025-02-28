const express = require("express");
const router = express.Router();
const {Match} = require("../models/match");

// Add Match API
router.post("/matches", async (req, res) => {
    try {
      const match = new Match(req.body);
      await match.save();
      res.status(201).send("Match added successfully!");
    } catch (err) {
        console.log(err);
      res.status(400).send(err.message);
    }
  });


  // API to fetch upcoming matches
router.get('/matches/upcoming', async (req, res) => {
    try {
        console.log("upcoming matches");
      const upcomingMatches = await Match.find({ state: 'Upcoming' }).select('_id team1 team2 venue matchStartTimestamp');
      res.status(200).json(upcomingMatches);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch matches' });
    }
  });

  // API to fetch match by id
router.get('/matches/:match_id', async (req, res) => {
    try {
      const match = await Match.findById(req.params.match_id);
      res.status(200).json(match);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch match' });
    }
  });

module.exports = router;