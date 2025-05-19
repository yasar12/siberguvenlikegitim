const mongoose = require('mongoose');

const careerPathSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    modules: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module'
    }],
    isPopular: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Slug oluşturma middleware
careerPathSchema.pre('save', function(next) {
    if (!this.isModified('title')) return next();
    
    this.slug = this.title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    
    next();
});

// Güncelleme tarihini otomatik güncelleme
careerPathSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const CareerPath = mongoose.model('CareerPath', careerPathSchema);

module.exports = CareerPath; 