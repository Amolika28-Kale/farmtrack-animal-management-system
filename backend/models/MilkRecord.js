const mongoose = require("mongoose");

const MilkRecordSchema = new mongoose.Schema({
  animalId: { type: mongoose.Schema.Types.ObjectId, ref: "Animal", required: true },
  date: { type: Date, required: true },
  morningMilk: { type: Number, default: 0 },
  eveningMilk: { type: Number, default: 0 },
  totalMilk: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model("MilkRecord", MilkRecordSchema);