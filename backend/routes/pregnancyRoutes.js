const express = require("express");
const { 
  addPregnancyRecord, 
  getPregnancyRecords,
  getPregnancyRecordById,
  updatePregnancyRecord,
  deletePregnancyRecord,
  getActivePregnancy,
  markAsDelivered
} = require("../controllers/pregnancyController");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/", auth, addPregnancyRecord);
router.get("/active/:animalId", auth, getActivePregnancy);
router.get("/:animalId", auth, getPregnancyRecords);
router.get("/record/:id", auth, getPregnancyRecordById);
router.put("/:id", auth, updatePregnancyRecord);
router.delete("/:id", auth, deletePregnancyRecord);
router.patch("/:id/delivered", auth, markAsDelivered);

module.exports = router;