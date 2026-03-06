const express = require("express");
const { 
  addMilkRecord, 
  getMilkRecords,
  getMilkRecordById,
  updateMilkRecord,
  deleteMilkRecord,
  getMilkStats
} = require("../controllers/milkController");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/", auth, addMilkRecord);
router.get("/stats/:animalId", auth, getMilkStats);
router.get("/:animalId", auth, getMilkRecords);
router.get("/record/:id", auth, getMilkRecordById);
router.put("/:id", auth, updateMilkRecord);
router.delete("/:id", auth, deleteMilkRecord);

module.exports = router;