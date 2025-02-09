const playerData = require("./playerWiseData.js");
const matchData = require("./processedData.js");

const generateInsights = () => {
  let insights = {};

  // 1. Player Form and Recent Performances
  const recentPerformers = Object.values(playerData).filter(player => {
    const recentMatches = player.batting?.matches|| [];
    const recentFantasyPoints = recentMatches.reduce((sum, m) => sum + (m.fantasy_points || 0), 0);
    return recentFantasyPoints > 50;
  });

  insights.topPerformers = recentPerformers.map(player => {
    const recentMatches = player.batting?.matches|| [];
    const recentRuns = recentMatches.reduce((sum, m) => sum + (m.runs || 0), 0);
    const recentBalls = recentMatches.reduce((sum, m) => sum + (m.balls || 0), 0);
    const strikeRate = ((recentRuns / recentBalls) * 100).toFixed(2);
    return `${player.name} scored ${recentRuns} runs in the last ${recentMatches.length} matches with a strike rate of ${strikeRate}.`;
  });

  // 2. Pitch and Venue Analysis
  const venueStats = matchData.match_summary.venue_stats;
  const paceStats = venueStats.find(v => v.bowler_type === "pace" && v.innings === "Overall");
  const spinStats = venueStats.find(v => v.bowler_type === "spin" && v.innings === "Overall");

  insights.pitchBehavior = paceStats.runs_per_wicket < spinStats.runs_per_wicket
    ? "The pitch favors pacers with lower runs per wicket."
    : "The pitch favors spinners with lower runs per wicket.";

  insights.venueFavorites = Object.values(playerData).filter(player => {
    const venueMatches = player.batting?.matches|| [];
    return venueMatches.length > 0;
  }).map(player => {
    const venueMatches = player.batting.matches;
    const runs = venueMatches.reduce((sum, m) => sum + (m.runs || 0), 0);
    return `${player.name} has scored ${runs} runs at this venue.`;
  });

  // 3. Head-to-Head Statistics
  insights.headToHead = matchData.match_summary.head_to_head_analysis;

  // 4. Player Availability and Injury Updates
  insights.playerAvailability = "No injury updates available."; // Placeholder

  // 5. Powerplay and Death Over Specialists
  insights.powerplaySpecialists = Object.values(playerData).filter(player => player.bowling?.phase_stats?.powerplay?.wickets > 3).map(player => {
    return `${player.name} picked ${player.bowling.phase_stats.powerplay.wickets} wickets in the powerplay.`;
  });

  insights.deathOverSpecialists = Object.values(playerData).filter(player => player.bowling?.phase_stats?.death?.wickets > 3).map(player => {
    return `${player.name} picked ${player.bowling.phase_stats.death.wickets} wickets in the death overs.`;
  });

  // 6. Fantasy Captain and Vice-Captain Picks
  insights.captainPick = recentPerformers.length > 0 ? recentPerformers[0].name : "No captain recommendation available.";
  insights.viceCaptainPick = recentPerformers.length > 1 ? recentPerformers[1].name : "No vice-captain recommendation available.";

  // 7. Differential Picks
  insights.differentialPicks = Object.values(playerData).filter(player => {
    const recentMatches = player.batting?.matches||[];
    return recentMatches.length > 2 && player.batting?.total_fantasy_points < 50;
  }).map(player => `${player.name} could be a differential pick.`);

  // 8. Weather and Conditions
  insights.weatherConditions = "No weather updates available."; // Placeholder

  // 9. Predicted Playing XI
  insights.predictedPlayingXI = ["Team A: Player1, Player2, ...", "Team B: Player3, Player4, ..."];

  // 10. Key Fantasy Tips
  insights.fantasyTips = [
    "Pick at least one all-rounder to maximize points.",
    "Focus on bowlers who bowl in powerplay and death overs.",
    "Choose top-order batsmen for high-scoring venues."
  ];

  return insights;
};

console.log(generateInsights());
