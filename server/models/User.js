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
    playHistory: [{
        score: { type: Number, default: 0 },
        timePlayed: { type: Number, default: 0 },
        questionsAnswered: { type: Number, default: 0 },
        setId: { type: String, default: "" },
        setTitle: { type: String, default: "Màn chơi Solo" },
        isWeekly: { type: Boolean, default: false },
        mode: { type: String, default: "solo" },
        playedAt: { type: Date, default: Date.now }
    }],
    weeklyHistory: [{ 
        score: { type: Number, default: 0 }, 
        timePlayed: { type: Number, default: 0 },
        questionsAnswered: { type: Number, default: 0 },
        setId: { type: String, default: "" }, 
        setTitle: { type: String, default: "Thử thách Tuần" }, 
        playedAt: { type: Date, default: Date.now } 
    }],
    savedQuestions: { type: [String], default: []},
    savedSets: { type: [String], default: []}
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
