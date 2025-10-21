const User = require("../models/users.model.js");
const bcryptjs = require("bcryptjs");
const { errorHandler } = require("../utils/error.js");
const jwt = require("jsonwebtoken");

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
      const hashedPassowrd = bcryptjs.hashSync(password, 10);
      const newUser = new User({ username, email, password: hashedPassowrd });
  
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