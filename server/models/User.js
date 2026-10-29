const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    displayName: { type: String, default: "" },
    fullName: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    avatar: { type: String, default: "" },
    highScore: { type: Number, default: 0 },
    weeklyScore: { type: Number, default: 0 },
    role: { type: String, enum: ['user', 'admin', 'teacher'], default: 'user' },
    playHistory: [{ score: Number, playedAt: { type: Date, default: Date.now } }],
    weeklyHistory: [{ 
        score: Number, 
        setId: String, 
        setTitle: String, 
        playedAt: { type: Date, default: Date.now } 
    }],
    savedQuestions: { type: [String], default: []},
    savedSets: { type: [String], default: []}
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
