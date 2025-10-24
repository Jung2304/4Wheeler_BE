const User = require("../models/users.model.js");
const bcryptjs = require("bcryptjs");
const { errorHandler } = require("../utils/error.js");
const jwt = require("jsonwebtoken");
const generate = require("../helpers/generate.js");

//< [POST] /api/auth/users/register
module.exports.register = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({         // return an object of {username, email}
      $or: [{ username }, { email }],
      deleted: false
    });

    if (existingUser) {
      const field = existingUser.username === username ? "Username" : "Email";
      return res.status(400).json({ message: `${field} already exists!` });
    } else {
      const hashedPassword = bcryptjs.hashSync(password, 10);
      const newUser = new User({ username, email, password: hashedPassword });
  
      await newUser.save();
      
      return res.status(201).json({ 
        message: "User created successfully!", 
      });
    }
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(400).json({ message: "Email or username already exists!" });
    }
    
    return res.status(500).json({ message: "Signup failed", error: error.message }); 
  }
};

//< [POST] /api/auth/users/login
module.exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const validUser = await User.findOne({ email });
    
    if (!validUser) {
      return next(errorHandler(404, "User not found!"));
    } 
    else {
      const validPassword = bcryptjs.compareSync(password, validUser.password);
      
      if (!validPassword) {
        return next(errorHandler(401, "Invalid credentials!"));
      } 
      else {
        const { password: pass, ...rest } = validUser._doc;
        
        const payload = { id: validUser._id, username: validUser.username };
        const token = jwt.sign(payload, process.env.JWT_SECRET);
        res.cookie("token", token, { 
          httpOnly: true,                   // Hide cookie from JS
          secure: process.env.NODE_ENV === "production",            // Only HTTPS sends cookies
          sameSite: "strict",                   // Block cross-site cookie sending
        }).status(200).json(rest);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

//< [POST] /api/auth/google
module.exports.google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      const payload = { id: user._id, username: user.username };
      const token = jwt.sign(payload, process.env.JWT_SECRET);
      const { password: pass, ...rest } = user._doc;
      res.cookie("token", token, { 
        httpOnly: true,                   
        secure: process.env.NODE_ENV === "production",            
        sameSite: "strict",                   
      }).status(200).json(rest);
    }
    else {
      // Since in User model, password is required, so we generate a password for newly-created User (can be changed later by user)
      const generatedPassword = generate.generateRandomString(16);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      
      //> When saved, we need to make that username unique and no spacing
      const newUser = new User({ 
        username: req.body.name.split(" ").join("").toLowerCase() + generate.generateRandomString(7), 
        email: req.body.email, 
        password: hashedPassword,
        avatar: req.body.photo, 
      });
      await newUser.save();
      const payload = { id: newUser._id, username: newUser.username };
      const token = jwt.sign(payload, process.env.JWT_SECRET);
      const { password: pass, ...rest } = user._doc;
      res.cookie("token", token, { 
        httpOnly: true,                   
        secure: process.env.NODE_ENV === "production",            
        sameSite: "strict",                   
      }).status(200).json(rest);
    }
  } catch (error) {
    console.error(error);
  }
};