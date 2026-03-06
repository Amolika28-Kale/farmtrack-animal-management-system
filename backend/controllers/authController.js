
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req,res)=>{
  try{
    const {name,email,password} = req.body;
    const hash = await bcrypt.hash(password,10);
    const user = await User.create({name,email,password:hash});
    res.json(user);
  }catch(e){
    res.status(500).json({error:e.message});
  }
};

exports.login = async (req,res)=>{
  const {email,password} = req.body;
  const user = await User.findOne({email});
  if(!user) return res.status(400).json({message:"User not found"});

  const match = await bcrypt.compare(password,user.password);
  if(!match) return res.status(400).json({message:"Wrong password"});

  const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"7d"});
  res.json({token,user});
};
