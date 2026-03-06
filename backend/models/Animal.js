
const mongoose = require("mongoose");

const AnimalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ["Cow", "Buffalo"], required: true },
  breed: { type: String, required: true },
  age: { type: Number, required: true },
  weight: { type: Number, required: true },
  color: { type: String, required: true },
  purchaseDate: { type: Date, required: true },
  tagNumber: { type: String, required: true, unique: true },
  milkPerDay: { type: Number, default: 0 },
  pregnancyStatus: { type: String, enum: ["Not Pregnant", "Pregnant"], default: "Not Pregnant" },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Animal", AnimalSchema);
