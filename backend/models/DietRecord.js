const mongoose = require("mongoose");

const DietRecordSchema = new mongoose.Schema({
  animalId: { type: mongoose.Schema.Types.ObjectId, ref: "Animal", required: true },
  date: { type: Date, default: Date.now },
  morningFeed: { type: String },
  afternoonFeed: { type: String },
  eveningFeed: { type: String },
  supplements: { type: String },
  waterIntake: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model("DietRecord", DietRecordSchema);