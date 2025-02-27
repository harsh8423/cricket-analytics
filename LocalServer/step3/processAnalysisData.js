const fs = require('fs');
const path = require('path');

// Load match_id from match_id.json
const matchData = JSON.parse(fs.readFileSync('LocalServer/match_id.json', 'utf8'));
const match_id = matchData.match_id; // Extract match_id

// Load JSON data
const filePath = path.join(__dirname, `../step1/${match_id}_match_analysis.json`);
const rawData = fs.readFileSync(filePath);
const parsedData = JSON.parse(rawData);

// Transform JSON data
const transformAnalysisData = (data) => {
    const bowler_analysis = Object.entries(data.bowler_analysis).map(([bowler_id, bowler]) => ({
        bowler_id: Number(bowler_id),
        ...bowler,
        variation_frequency: bowler.variation_frequency
            ? Object.entries(bowler.variation_frequency).map(([variation, frequency]) => ({
                variation,
                frequency
            }))
            : []
    }));

    const batsman_analysis = Object.entries(data.batting_analysis).map(([batsman_id, batsman]) => ({
        batsman_id: Number(batsman_id),
        ...batsman,
        scoring_zone: batsman.scoring_zone
            ? Object.entries(batsman.scoring_zone).map(([zone, runs]) => ({
                zone,
                runs
            }))
            : []
    }));

    return {
        ...data,
        bowler_analysis,
        batsman_analysis
    };
};

// Process data
const processedData = transformAnalysisData(parsedData);

// Save as JavaScript module
const jsOutputPath = path.join(__dirname, `./${match_id}_processedData.js`);
const jsContent = `module.exports = ${JSON.stringify(processedData, null, 2)};`;
fs.writeFileSync(jsOutputPath, jsContent);

// Save as JSON file
const jsonOutputPath = path.join(__dirname, `./${match_id}_processedData.json`);
fs.writeFileSync(jsonOutputPath, JSON.stringify(processedData, null, 2));


