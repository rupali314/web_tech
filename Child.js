const mongoose = require('mongoose');

const VaccineSchema = new mongoose.Schema({
  name:   { type: String, required: true },
  dueAt:  { type: String },   // e.g. "At birth", "6 weeks"
  dueDate:{ type: Date },
  status: { type: String, enum: ['pending','done','overdue'], default: 'pending' },
  givenOn:{ type: Date },
});

const ChildSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:      { type: String, required: true },
  dob:       { type: Date, required: true },
  gender:    { type: String, enum: ['male','female','other'] },
  vaccines:  [VaccineSchema],
}, { timestamps: true });

module.exports = mongoose.model('Child', ChildSchema);