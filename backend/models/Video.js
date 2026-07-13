const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  course:      { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  videoUrl:    { type: String, default: '' },
  pdfUrl:      { type: String, default: '' },
  durationMins:{ type: Number, default: 0 },
  isFree:      { type: Boolean, default: false },
  order:       { type: Number, default: 0 },
  watched:     { type: Boolean, default: false },
  contentUrl: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Video', VideoSchema);