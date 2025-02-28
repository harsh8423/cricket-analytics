const express = require('express');
const router = express.Router();
const { Match, Scorecard } = require('../models/match');
const { Player } = require('../models/match');

router.get('/head2head/:team1/:team2', async (req, res) => {
  try {
    const { team1, team2 } = req.params;

    // Find last 5 matches between these teams
    const matches = await Match.find({
      $or: [
        { 'team1.name': team1, 'team2.name': team2 },
        { 'team1.name': team2, 'team2.name': team1 }
      ]
    })
    .sort({ matchStartTimestamp: -1 })
    .limit(5);
    
    const formattedMatches = await Promise.all(matches.map(async match => {
      try {
        const scorecard = await Scorecard.findById(match.scorecard);
        if (!scorecard) {
          throw new Error('Scorecard not found');
        }

        // Calculate fantasy points and find top performers
        const players = {};
        
        // Process first innings
        scorecard.firstInnings.forEach(player => {
          if (!player || !player.playerId) return; // Skip if player data is invalid

          if (!players[player.playerId]) {
            players[player.playerId] = {
              name: player.name || 'Unknown Player',
              points: 0,
              performance: ''
            };
          }
          
          if (player.type === 'Batting') {
            const points = ((player.runs || 0) * 1) + ((player.sixes || 0) * 2) + ((player.fours || 0) * 1);
            players[player.playerId].points += points;
            if (player.runs > 0) {
              players[player.playerId].performance = `${player.runs}(${player.balls})`;
            }
          } else if (player.type === 'Bowling') {
            const points = (player.wickets || 0) * 25;
            players[player.playerId].points += points;
            if (player.wickets > 0) {
              players[player.playerId].performance = `${player.wickets}/${player.runs}`;
            }
          }
        });

        // Process second innings
        scorecard.secondInnings.forEach(player => {
          if (!player || !player.playerId) return;

          if (!players[player.playerId]) {
            players[player.playerId] = {
              name: player.name || 'Unknown Player',
              points: 0,
              performance: ''
            };
          }
          
          if (player.type === 'Batting') {
            const points = ((player.runs || 0) * 1) + ((player.sixes || 0) * 2) + ((player.fours || 0) * 1);
            players[player.playerId].points += points;
            if (player.runs > 0) {
              players[player.playerId].performance = `${player.runs}(${player.balls})`;
            }
          } else if (player.type === 'Bowling') {
            const points = (player.wickets || 0) * 25;
            players[player.playerId].points += points;
            if (player.wickets > 0) {
              players[player.playerId].performance = `${player.wickets}/${player.runs}`;
            }
          }
        });

        // Find top performers from each team
        const team1Players = Object.values(players).filter(p => 
          scorecard.firstInnings.some(sp => sp && sp.name === p.name)
        );
        
        const team2Players = Object.values(players).filter(p => 
          scorecard.secondInnings.some(sp => sp && sp.name === p.name)
        );

        const topPerformerTeam1 = team1Players.length ? 
          team1Players.reduce((max, p) => p.points > max.points ? p : max, team1Players[0]) :
          { name: 'No performer', performance: '-' };
        
        const topPerformerTeam2 = team2Players.length ? 
          team2Players.reduce((max, p) => p.points > max.points ? p : max, team2Players[0]) :
          { name: 'No performer', performance: '-' };

        // Format match data
        const matchDate = new Date(match.matchStartTimestamp)
          .toISOString().split('T')[0];

        const result = match.result?.winningTeam === match.team1?.name ? 
          `${match.team1?.shortName || 'Team 1'} won by ${match.result?.winningMargin || 0} ${match.result?.winByRuns ? 'runs' : 'wickets'}` :
          `${match.team2?.shortName || 'Team 2'} won by ${match.result?.winningMargin || 0} ${match.result?.winByRuns ? 'runs' : 'wickets'}`;

        const team1Score = `${match.team1?.shortName || 'Team 1'}: ${
          scorecard.firstInnings.reduce((total, p) => 
            p?.type === 'Batting' ? total + (p.runs || 0) : total, 0
          )}/${
          scorecard.firstInnings.filter(p => 
            p?.type === 'Batting' && p.dismissal
          ).length
        }`;

        const team2Score = `${match.team2?.shortName || 'Team 2'}: ${
          scorecard.secondInnings.reduce((total, p) => 
            p?.type === 'Batting' ? total + (p.runs || 0) : total, 0
          )}/${
          scorecard.secondInnings.filter(p => 
            p?.type === 'Batting' && p.dismissal
          ).length
        }`;

        return {
          date: matchDate,
          result,
          score: `${team1Score} vs ${team2Score}`,
          topPerformerTeam1,
          topPerformerTeam2
        };
      } catch (err) {
        console.error('Error processing match:', err);
        return null;
      }
    }));

    // Filter out any null results from errors
    const validMatches = formattedMatches.filter(match => match !== null);

    res.json(validMatches);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/team-performance/:teamname', async (req, res) => {
  try {
    const { teamname } = req.params;

    // Find last 5 matches for the team
    const matches = await Match.find({
      $or: [
        { 'team1.name': teamname },
        { 'team2.name': teamname }
      ]
    })
    .sort({ matchStartTimestamp: -1 })
    .limit(5);

    const formattedMatches = await Promise.all(matches.map(async match => {
      try {
        const scorecard = await Scorecard.findById(match.scorecard);
        if (!scorecard) {
          throw new Error('Scorecard not found');
        }

        // Determine which innings the team played
        const isTeam1 = match.team1.name === teamname;
        const teamInnings = isTeam1 ? scorecard.firstInnings : scorecard.secondInnings;
        const oppositionInnings = isTeam1 ? scorecard.secondInnings : scorecard.firstInnings;
        const oppositionTeam = isTeam1 ? match.team2.name : match.team1.name;

        // Calculate fantasy points for team players
        const players = {};
        
        teamInnings.forEach(player => {
          if (!player || !player.playerId) return;

          if (!players[player.playerId]) {
            players[player.playerId] = {
              name: player.name || 'Unknown Player',
              points: 0,
              performance: '',
              role: player.type
            };
          }
          
          if (player.type === 'Batting') {
            const points = ((player.runs || 0) * 1) + ((player.sixes || 0) * 2) + ((player.fours || 0) * 1);
            players[player.playerId].points += points;
            if (player.runs > 0) {
              players[player.playerId].performance = `${player.runs}(${player.balls})`;
            }
          } else if (player.type === 'Bowling') {
            const points = (player.wickets || 0) * 25;
            players[player.playerId].points += points;
            if (player.wickets > 0) {
              players[player.playerId].performance = `${player.wickets}/${player.runs}`;
            }
          }
        });

        // Find top performers
        const topPerformers = Object.values(players)
          .sort((a, b) => b.points - a.points)
          .slice(0, 2)
          .map(player => ({
            name: player.name,
            performance: player.performance,
            role: player.role
          }));

        // Format match data
        const matchDate = new Date(match.matchStartTimestamp)
          .toLocaleDateString('en-US', { 
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });

        const teamScore = `${
          teamInnings.reduce((total, p) => 
            p?.type === 'Batting' ? total + (p.runs || 0) : total, 0
          )}/${
          teamInnings.filter(p => 
            p?.type === 'Batting' && p.dismissal
          ).length
        }`;

        const oppScore = `${
          oppositionInnings.reduce((total, p) => 
            p?.type === 'Batting' ? total + (p.runs || 0) : total, 0
          )}/${
          oppositionInnings.filter(p => 
            p?.type === 'Batting' && p.dismissal
          ).length
        }`;

        const result = match.result.winningTeam === teamname ? 'Won' : 'Lost';

        return {
          date: matchDate,
          opponent: oppositionTeam,
          result,
          score: `${teamname} ${teamScore} vs ${oppositionTeam} ${oppScore}`,
          venue: match.venue.name,
          topPerformers
        };
      } catch (err) {
        console.error('Error processing match:', err);
        return null;
      }
    }));

    // Filter out any null results from errors
    const validMatches = formattedMatches.filter(match => match !== null);

    res.json(validMatches);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get match insights including probable XI and weather
router.get('/insights/:matchId', async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Get player names for probable XI
    const team1XI = await Promise.all(
      (match.probablePlaying11?.team1 || []).map(async (player) => {
        try {
          const playerDoc = await Player.findById(player.playerId);
          return {
            id: player.playerId,
            name: playerDoc ? playerDoc.name : `Player ${player.playerId}`,
            salePercentage: player.salePercentage || 0
          };
        } catch (error) {
          console.error(`Error fetching player ${player.playerId}:`, error);
          return {
            id: player.playerId,
            name: `Player ${player.playerId}`,
            salePercentage: player.salePercentage || 0
          };
        }
      })
    );

    const team2XI = await Promise.all(
      (match.probablePlaying11?.team2 || []).map(async (player) => {
        try {
          const playerDoc = await Player.findById(player.playerId);
          return {
            id: player.playerId,
            name: playerDoc ? playerDoc.name : `Player ${player.playerId}`,
            salePercentage: player.salePercentage || 0
          };
        } catch (error) {
          console.error(`Error fetching player ${player.playerId}:`, error);
          return {
            id: player.playerId,
            name: `Player ${player.playerId}`,
            salePercentage: player.salePercentage || 0
          };
        }
      })
    );

    const matchInsights = {
      probablePlaying11: {
        team1: {
          name: match.team1.team_name,
          players: team1XI
        },
        team2: {
          name: match.team2.team_name,
          players: team2XI
        }
      },
      weather: match.weather || {
        temperature: "N/A",
        chanceOfRain: "N/A",
        windSpeed: "N/A",
        humidity: "N/A",
        dewFactor: "N/A"
      }
    };

    res.json(matchInsights);
  } catch (error) {
    console.error('Error fetching match insights:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get win predictions for head to head
router.get('/predictions/:team1/:team2', async (req, res) => {
  try {
    const { team1, team2 } = req.params;
    const match = await Match.findOne({
      $or: [
        { 'team1.team_name': team1, 'team2.team_name': team2 },
        { 'team1.team_name': team2, 'team2.team_name': team1 }
      ]
    }).sort({ matchStartTimestamp: -1 });

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const predictions = {
      team1: {
        name: team1,
        prediction: match.team1.team_name === team1 ? 
          match.team1.winPrediction : 
          match.team2.winPrediction
      },
      team2: {
        name: team2,
        prediction: match.team2.team_name === team2 ? 
          match.team2.winPrediction : 
          match.team1.winPrediction
      }
    };

    res.json(predictions);
  } catch (error) {
    console.error('Error fetching predictions:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 