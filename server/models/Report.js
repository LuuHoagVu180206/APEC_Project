const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    targetType: { 
        type: String, 
        enum: ['QuestionSet', 'Question'], 
        default: 'QuestionSet',
        required: true 
    },
    targetId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        refPath: 'targetType'
    },
    targetTitle: { 
        type: String, 
        default: '' 
    },
    targetAuthor: { 
        type: String, 
        default: '' 
    },
    reporter: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        default: null 
    },
    reporterName: { 
        type: String, 
        default: 'Người dùng ẩn danh' 
    },
    reporterEmail: {
        type: String,
        default: ''
    },
    reason: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        default: '' 
    },
    status: { 
        type: String, 
        enum: ['pending', 'resolved', 'dismissed'], 
        default: 'pending' 
    },
    resolvedAction: { 
        type: String, 
        default: '' // 'deleted_content' | 'dismissed'
    },
    resolvedReason: { 
        type: String, 
        default: '' 
    },
    resolvedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        default: null 
    },
    resolvedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);

