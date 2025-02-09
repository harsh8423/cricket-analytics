const fs = require('fs');
const path = require('path');

// Load JSON data
const filePath = path.join(__dirname, 'match_analysis_claude.json');
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

// Processed data
const processedData = transformAnalysisData(parsedData);

// Save processed data to a file
const outputPath = path.join(__dirname, 'processedData.js');
const fileContent = `module.exports = ${JSON.stringify(processedData, null, 2)};`;

fs.writeFileSync(outputPath, fileContent);

console.log(`Processed data saved to ${outputPath}`);
