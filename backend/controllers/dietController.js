const DietRecord = require("../models/DietRecord");

// Get all diet records for an animal
exports.getDietRecords = async (req, res) => {
  try {
    const records = await DietRecord.find({ 
      animalId: req.params.animalId 
    }).sort({ date: -1 });
    res.json(records);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Get single diet record by ID
exports.getDietRecordById = async (req, res) => {
  try {
    const record = await DietRecord.findById(req.params.id);
    
    if (!record) {
      return res.status(404).json({ message: "Diet record not found" });
    }
    
    res.json(record);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Add new diet record
exports.addDietRecord = async (req, res) => {
  try {
    const { animalId, morningFeed, afternoonFeed, eveningFeed, supplements, waterIntake } = req.body;
    
    // Check if record already exists for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingRecord = await DietRecord.findOne({
      animalId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (existingRecord) {
      return res.status(400).json({ 
        message: "Diet record already exists for today" 
      });
    }
    
    const record = await DietRecord.create({ 
      animalId, 
      morningFeed, 
      afternoonFeed, 
      eveningFeed, 
      supplements, 
      waterIntake 
    });
    
    res.status(201).json(record);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Update diet record
exports.updateDietRecord = async (req, res) => {
  try {
    const updated = await DietRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: "Diet record not found" });
    }
    
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Delete diet record
exports.deleteDietRecord = async (req, res) => {
  try {
    const deleted = await DietRecord.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Diet record not found" });
    }
    
    res.json({ message: "Diet record deleted successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Get diet statistics for an animal
exports.getDietStats = async (req, res) => {
  try {
    const records = await DietRecord.find({ 
      animalId: req.params.animalId 
    }).sort({ date: -1 });
    
    const avgWater = records.length > 0 
      ? records.reduce((sum, r) => sum + (r.waterIntake || 0), 0) / records.length 
      : 0;
    
    res.json({
      count: records.length,
      averageWater: avgWater.toFixed(2),
      lastRecord: records[0] || null
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};