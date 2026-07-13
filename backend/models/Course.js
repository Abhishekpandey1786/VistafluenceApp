const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  category:    { type: String, default: 'General' },
  level:       { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  published:   { type: Boolean, default: false },
  videos:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);