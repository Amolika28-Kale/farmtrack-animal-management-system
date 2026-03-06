const mongoose = require("mongoose");

const PregnancyRecordSchema = new mongoose.Schema({
  animalId: { type: mongoose.Schema.Types.ObjectId, ref: "Animal", required: true },
  pregnancyStartDate: { type: Date, required: true },
  expectedDeliveryDate: { type: Date, required: true },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("PregnancyRecord", PregnancyRecordSchema);