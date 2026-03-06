
const Animal = require("../models/Animal");

exports.getAnimals = async (req,res)=>{
  const animals = await Animal.find({userId:req.user.id});
  res.json(animals);
};

exports.addAnimal = async (req,res)=>{
  const animal = await Animal.create({...req.body,userId:req.user.id});
  res.json(animal);
};

exports.updateAnimal = async (req,res)=>{
  const updated = await Animal.findByIdAndUpdate(req.params.id,req.body,{new:true});
  res.json(updated);
};

exports.deleteAnimal = async (req,res)=>{
  await Animal.findByIdAndDelete(req.params.id);
  res.json({message:"Deleted"});
};
