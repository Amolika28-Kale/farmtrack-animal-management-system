
const router = require("express").Router();
const auth = require("../middleware/auth");
const {getAnimals,addAnimal,updateAnimal,deleteAnimal} = require("../controllers/animalController");

router.get("/",auth,getAnimals);
router.post("/",auth,addAnimal);
router.put("/:id",auth,updateAnimal);
router.delete("/:id",auth,deleteAnimal);

module.exports = router;
