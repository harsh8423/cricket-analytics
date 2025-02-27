const fs = require('fs');
const path = require('path');

// Load match_id from match_id.json
const matchData = JSON.parse(fs.readFileSync('LocalServer/match_id.json', 'utf8'));
const match_id = matchData.match_id; // Extract match_id


//Load JSON data
const filePath = path.join(__dirname, `../step1/${match_id}_match_analysis.json`);
const rawData = fs.readFileSync(filePath);
const parsedData = JSON.parse(rawData);
// Transform JSON data into player-wise structure
const restructurePlayerData = (data) => {
    const players = {};

    // Process bowler_analysis
    Object.entries(data.bowler_analysis).forEach(([bowler_id, bowler]) => {
        if (!players[bowler_id]) {
            players[bowler_id] = { 
                player_id: Number(bowler_id), 
                name: bowler.name, 
                role: bowler.role, 
                team_name: bowler.team_name, 
                batting_style: bowler.batting_style, 
                bowling_style: bowler.bowling_style, 
                bowling: {}, 
                batting: {} 
            };
        }

        players[bowler_id].bowling = {
            matches: bowler.matches || [],
            total_runs: bowler.total_runs || 0,
            total_wickets: bowler.total_wickets || 0,
            total_balls: bowler.total_balls || 0,
            runs_per_wicket: bowler.runs_per_wicket || 0,
            balls_per_wicket: bowler.balls_per_wicket || 0,
            total_fantasy_points: bowler.total_fantasy_points || 0,
            phase_stats: bowler.phase_stats || {},
            left_vs_right: bowler.left_vs_right || {},
            wicket_analysis: bowler.wicket_analysis || {},
            boundary_analysis: bowler.boundary_analysis || {},
            variation_frequency: bowler.variation_frequency
                ? Object.entries(bowler.variation_frequency).map(([variation, frequency]) => ({
                    variation,
                    frequency
                }))
                : [],
            opponent_analysis: bowler.opponent_analysis || {}
        };
    });

    // Process batsman_analysis
    Object.entries(data.batting_analysis).forEach(([batsman_id, batsman]) => {
        if (!players[batsman_id]) {
            players[batsman_id] = { 
                player_id: Number(batsman_id), 
                name: batsman.name, 
                role: batsman.role, 
                team_name: batsman.team_name, 
                batting_style: batsman.batting_style, 
                bowling_style: batsman.bowling_style, 
                batting: {}, 
                bowling: {} 
            };
        }

        players[batsman_id].batting = {
            matches: batsman.matches || [],
            total_runs: batsman.total_runs || 0,
            total_balls: batsman.total_balls || 0,
            average_runs: batsman.average_runs || 0,
            overall_strike_rate: batsman.overall_strike_rate || 0,
            total_fantasy_points: batsman.total_fantasy_points || 0,
            phase_stats: batsman.phase_stats || {},
            spin_vs_pace: batsman.spin_vs_pace || {},
            left_vs_right: batsman.left_vs_right || {},
            wicket_analysis: batsman.wicket_analysis || {},
            batting_control: batsman.batting_control || {},
            scoring_zone: batsman.scoring_zone
                ? Object.entries(batsman.scoring_zone).map(([zone, runs]) => ({
                    zone,
                    runs
                }))
                : [],
            boundary_analysis: batsman.boundary_analysis || {},
            opponent_analysis: batsman.opponent_analysis || {}
        };
    });

    return players;
};

// Restructure data
const playerWiseData = restructurePlayerData(parsedData);

// Save the restructured data to a JSON file
const outputPath = path.join(__dirname, `./${match_id}_playerWiseData.json`);
fs.writeFileSync(outputPath, JSON.stringify(playerWiseData, null, 2));

console.log(`Player-wise data saved to ${outputPath}`);
