const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Schema definition
const analysisDataSchema = new mongoose.Schema({
    _id: { type: Number, required: true }, // match_id as unique identifier
    state: { type: String, default: 'upcoming' },
    match_summary: {
        venue_analysis: [
            {
                toss_decision: String,
                winner: String
            }
        ],
        venue_stats: [
            {
                innings: String,
                bowler_type: String,
                total_runs: Number,
                total_balls: Number,
                total_wickets: Number,
                runs_per_wicket: Number,
                balls_per_wicket: Number,
                economy_rate: Number,
                strike_rate: Number
            }
        ],
        head_to_head_analysis: [String]
    },
    bowler_analysis: [
        {
            bowler_id: Number,
            name: String,
            matches: [
                {
                    runs: Number,
                    overs: Number,
                    wickets: Number,
                    economy: Number,
                    fantasy_points: Number,
                    match_id: Number,
                    stats_type: String
                }
            ],
            total_runs: Number,
            total_wickets: Number,
            total_balls: Number,
            runs_per_wicket: Number,
            balls_per_wicket: Number,
            total_fantasy_points: Number,
            phase_stats: {
                powerplay: {
                    runs: Number,
                    balls: Number,
                    wickets: Number,
                    runs_per_wicket: Number,
                    balls_per_wicket: Number,
                    economy: Number
                },
                middle: {
                    runs: Number,
                    balls: Number,
                    wickets: Number,
                    runs_per_wicket: Number,
                    balls_per_wicket: Number,
                    economy: Number
                },
                death: {
                    runs: Number,
                    balls: Number,
                    wickets: Number,
                    runs_per_wicket: Number,
                    balls_per_wicket: Number,
                    economy: Number
                }
            },
            left_vs_right: {
                left_arm: {
                    runs: Number,
                    balls: Number,
                    strike_rate: Number,
                    wickets: Number
                },
                right_arm: {
                    runs: Number,
                    balls: Number,
                    strike_rate: Number,
                    wickets: Number
                }
            },
            wicket_analysis: Object,
            boundary_analysis: {
                details: Object,
                percentage: Number
            },
            variation_frequency: [
                {
                    variation: String,
                    frequency: Number
                }
            ],
            opponent_analysis: Object
        }
    ],
    batsman_analysis: [
        {
            batsman_id: Number,
            name: String,
            matches: [
                {
                    runs: Number,
                    balls: Number,
                    strike_rate: Number,
                    fantasy_points: Number,
                    match_id: Number,
                    stats_type: String,
                    batting_position: Number
                }
            ],
            total_runs: Number,
            total_balls: Number,
            average_runs: Number,
            overall_strike_rate: Number,
            total_fantasy_points: Number,
            phase_stats: {
                powerplay: {
                    runs: Number,
                    balls: Number,
                    strike_rate: Number
                },
                middle: {
                    runs: Number,
                    balls: Number,
                    strike_rate: Number
                },
                death: {
                    runs: Number,
                    balls: Number,
                    strike_rate: Number
                }
            },
            spin_vs_pace: {
                spin: {
                    runs: Number,
                    balls: Number,
                    strike_rate: Number,
                    wickets: Number
                },
                pace: {
                    runs: Number,
                    balls: Number,
                    strike_rate: Number,
                    wickets: Number
                }
            },
            left_vs_right: {
                left_arm: {
                    runs: Number,
                    balls: Number,
                    strike_rate: Number,
                    wickets: Number
                },
                right_arm: {
                    runs: Number,
                    balls: Number,
                    strike_rate: Number,
                    wickets: Number
                }
            },
            wicket_analysis: Object,
            batting_control: {
                in_control: Number,
                no_control: Number,
                beaten: Number
            },
            scoring_zone: [
                {
                    zone: String,
                    runs: Number
                }
            ],
            boundary_analysis: {
                details: Object,
                percentage: Number
            },
            opponent_analysis: Object
        }
    ]
}, { timestamps: true });

const AnalysisData = mongoose.model('AnalysisData', analysisDataSchema);

// Connect to MongoDB
mongoose.connect('mongodb+srv://harsh8423:8423047004@cluster0.1xbklyu.mongodb.net/cricket')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Load and transform data
const filePath = path.join(__dirname, 'match_analysis_claude.json');
const rawData = fs.readFileSync(filePath);
const parsedData = JSON.parse(rawData);

// Extract and transform bowler_analysis and batsman_analysis
const transformAnalysisData = (data) => {
    const bowler_analysis = Object.entries(data.bowler_analysis).map(([bowler_id, bowler]) => ({
        bowler_id: Number(bowler_id),
        ...bowler,
        variation_frequency: bowler.variation_frequency ? Object.entries(bowler.variation_frequency).map(([variation, frequency]) => ({
            variation,
            frequency
        })) : []
        
    }));

    const batsman_analysis = Object.entries(data.batting_analysis).map(([batsman_id, batsman]) => ({
        batsman_id: Number(batsman_id),
        ...batsman,
        scoring_zone: batsman.scoring_zone 
            ? Object.entries(batsman.scoring_zone).map(([zone, runs]) => ({
                zone,
                runs
            }))
            : [] // Default to an empty array if scoring_zone is undefined or null

    }));

    return {
        _id: 66169, // Example match_id, replace with actual ID from your data
        state: data.state || 'upcoming',
        match_summary: data.match_summary,
        bowler_analysis,
        batsman_analysis
    };
};

const transformedData = transformAnalysisData(parsedData);

// Insert data into the database
const uploadData = async (data) => {
    try {
        const analysisDoc = new AnalysisData(data);
        await analysisDoc.save();
        console.log('Data uploaded successfully');
    } catch (err) {
        console.error('Error uploading data:', err);
    } finally {
        mongoose.disconnect();
    }
};

uploadData(transformedData);
