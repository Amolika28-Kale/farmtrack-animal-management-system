const Animal = require("../models/Animal");
const PregnancyRecord = require("../models/PregnancyRecord");

// Get all pregnancy records for an animal
exports.getPregnancyRecords = async (req, res) => {
  try {
    const records = await PregnancyRecord.find({ 
      animalId: req.params.animalId 
    }).sort({ pregnancyStartDate: -1 });
    res.json(records);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Get single pregnancy record by ID
exports.getPregnancyRecordById = async (req, res) => {
  try {
    const record = await PregnancyRecord.findById(req.params.id);
    
    if (!record) {
      return res.status(404).json({ message: "Pregnancy record not found" });
    }
    
    res.json(record);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Add new pregnancy record
exports.addPregnancyRecord = async (req, res) => {
  try {
    const { animalId, pregnancyStartDate, expectedDeliveryDate, notes } = req.body;
    
    // Check if animal is already pregnant
    const activePregnancy = await PregnancyRecord.findOne({
      animalId,
      expectedDeliveryDate: { $gte: new Date() }
    });
    
    if (activePregnancy) {
      return res.status(400).json({ 
        message: "Animal already has an active pregnancy record" 
      });
    }
    
    const record = await PregnancyRecord.create({ 
      animalId, 
      pregnancyStartDate, 
      expectedDeliveryDate, 
      notes 
    });
    
    // Update animal's pregnancy status
    await Animal.findByIdAndUpdate(animalId, { 
      pregnancyStatus: "Pregnant" 
    });
    
    res.status(201).json(record);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Update pregnancy record
exports.updatePregnancyRecord = async (req, res) => {
  try {
    const updated = await PregnancyRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: "Pregnancy record not found" });
    }
    
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Delete pregnancy record
exports.deletePregnancyRecord = async (req, res) => {
  try {
    const deleted = await PregnancyRecord.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Pregnancy record not found" });
    }
    
    // Check if animal has any other active pregnancies
    const otherPregnancies = await PregnancyRecord.findOne({
      animalId: deleted.animalId,
      expectedDeliveryDate: { $gte: new Date() }
    });
    
    if (!otherPregnancies) {
      await Animal.findByIdAndUpdate(deleted.animalId, { 
        pregnancyStatus: "Not Pregnant" 
      });
    }
    
    res.json({ message: "Pregnancy record deleted successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Get active pregnancy for an animal
exports.getActivePregnancy = async (req, res) => {
  try {
    const record = await PregnancyRecord.findOne({
      animalId: req.params.animalId,
      expectedDeliveryDate: { $gte: new Date() }
    }).sort({ pregnancyStartDate: -1 });
    
    res.json(record || null);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Mark pregnancy as delivered
exports.markAsDelivered = async (req, res) => {
  try {
    const record = await PregnancyRecord.findById(req.params.id);
    
    if (!record) {
      return res.status(404).json({ message: "Pregnancy record not found" });
    }
    
    // Update animal's pregnancy status
    await Animal.findByIdAndUpdate(record.animalId, { 
      pregnancyStatus: "Not Pregnant" 
    });
    
    res.json({ message: "Marked as delivered successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};