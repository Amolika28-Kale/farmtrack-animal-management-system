const MilkRecord = require("../models/MilkRecord");

// Get all milk records for an animal
exports.getMilkRecords = async (req, res) => {
  try {
    const records = await MilkRecord.find({ 
      animalId: req.params.animalId 
    }).sort({ date: -1 });
    res.json(records);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Get single milk record by ID
exports.getMilkRecordById = async (req, res) => {
  try {
    const record = await MilkRecord.findById(req.params.id);
    
    if (!record) {
      return res.status(404).json({ message: "Milk record not found" });
    }
    
    res.json(record);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Add new milk record
exports.addMilkRecord = async (req, res) => {
  try {
    const { animalId, date, morningMilk, eveningMilk, totalMilk } = req.body;
    
    // Check if record already exists for this date
    const existingRecord = await MilkRecord.findOne({
      animalId,
      date: new Date(date).setHours(0, 0, 0, 0)
    });
    
    if (existingRecord) {
      return res.status(400).json({ 
        message: "Milk record already exists for this date" 
      });
    }
    
    const record = await MilkRecord.create({ 
      animalId, 
      date, 
      morningMilk: morningMilk || 0, 
      eveningMilk: eveningMilk || 0, 
      totalMilk: totalMilk || (morningMilk + eveningMilk) 
    });
    
    res.status(201).json(record);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Update milk record
exports.updateMilkRecord = async (req, res) => {
  try {
    const { morningMilk, eveningMilk, totalMilk } = req.body;
    
    const updated = await MilkRecord.findByIdAndUpdate(
      req.params.id,
      {
        morningMilk,
        eveningMilk,
        totalMilk: totalMilk || (morningMilk + eveningMilk)
      },
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: "Milk record not found" });
    }
    
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Delete milk record
exports.deleteMilkRecord = async (req, res) => {
  try {
    const deleted = await MilkRecord.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Milk record not found" });
    }
    
    res.json({ message: "Milk record deleted successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Get milk statistics for an animal
exports.getMilkStats = async (req, res) => {
  try {
    const records = await MilkRecord.find({ 
      animalId: req.params.animalId 
    }).sort({ date: -1 });
    
    const total = records.reduce((sum, r) => sum + r.totalMilk, 0);
    const average = records.length > 0 ? total / records.length : 0;
    const last7Days = records.slice(0, 7);
    
    res.json({
      total,
      average: average.toFixed(2),
      count: records.length,
      last7Days
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};