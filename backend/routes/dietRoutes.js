const express = require("express");
const { 
  addDietRecord, 
  getDietRecords,
  getDietRecordById,
  updateDietRecord,
  deleteDietRecord,
  getDietStats
} = require("../controllers/dietController");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/", auth, addDietRecord);
router.get("/stats/:animalId", auth, getDietStats);
router.get("/:animalId", auth, getDietRecords);
router.get("/record/:id", auth, getDietRecordById);
router.put("/:id", auth, updateDietRecord);
router.delete("/:id", auth, deleteDietRecord);

module.exports = router;