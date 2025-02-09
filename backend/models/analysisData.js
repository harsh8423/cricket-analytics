const mongoose = require('mongoose');

const analysisDataSchema = new mongoose.Schema({
    _id: { type: Number, required: true }, // match_id as unique identifier
    state:{ type: String, default:'upcoming'},
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
            bowler_id: Number, // Unique ID for the bowler
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
                    variation: String,   // Name of the variation (e.g., "slower")
                    frequency: Number    
                }
            ],
            opponent_analysis: Object
        }
    ],
    batsman_analysis: [
        {
            batsman_id: Number, // Unique ID for the batsman
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
                    zone: String,   // Name of the zone (e.g., "cover", "mid-wicket")
                    runs: Number    // Runs scored in that zone
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

const AnalysisData = mongoose.model('analysisData', analysisDataSchema);

module.exports = AnalysisData;
