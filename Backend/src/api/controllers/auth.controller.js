//! PACKAGES
const bcryptjs = require("bcryptjs");
const validator = require("validator");

//! HELPERS
const generate = require("../helpers/generateRandom.js");
const { generateJWT } = require("../helpers/generateJWT.js");
const sendMailHelper = require("../helpers/sendMail.js");

//! MODELS
const User = require("../models/users.model.js");
const ForgotPassword = require("../models/forgot-password.model.js");

//< [POST] /api/auth/users/register
module.exports.register = async (req, res) => {
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
      
      return res.status(201).json({ message: "User created successfully!" });
    }
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(400).json({ message: "Email or username already exists!" });
    }
    
    return res.status(500).json({ message: "Sign-up failed", error: error.message }); 
  }
};

//< [POST] /api/auth/users/login
module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const validUser = await User.findOne({ email });
    
    if (!validUser) {
      return res.status(404).json({ message: "Email not found!" }); 
    } 
    else {
      const validPassword = bcryptjs.compareSync(password, validUser.password);
      
      if (!validPassword) {
        return res.status(401).json({ message: "Email or password is incorrect!" });
      } 
      else {
        const { password: pass, ...rest } = validUser._doc;
        
        res.cookie("access_token", generateJWT(validUser), { 
          httpOnly: true,                   // Hide cookie from JS
          secure: process.env.NODE_ENV === "production",            // Only HTTPS sends cookies
          sameSite: "strict",                   // Block cross-site cookie sending
        }).status(200).json(rest);
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while logging in!" });
  }
};

//< [POST] /api/auth/google
module.exports.google = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      const { password: pass, ...rest } = user._doc;
      res.cookie("access_token", generateJWT(user), { 
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

      const { password: pass, ...rest } = newUser._doc;
      res.cookie("access_token", generateJWT(newUser), { 
        httpOnly: true,                   
        secure: process.env.NODE_ENV === "production",            
        sameSite: "strict",                   
      }).status(200).json(rest);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while logging in with Google!" });
  }
};

//< [POST] /api/auth/users/forgot-password
module.exports.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid or missing email format!" });
    }   

    const user = await User.findOne({ 
      email: email,
      deleted: false, 
    });

    if (!user) {
      return res.status(404).json({ message: "Email not found!" });    
    };

    //> Save data to database
    const otp = generate.generateRandomNumber(6);

    const minutesExpire = 5;

    const objectForgotPassword = {
      email: email,
      otp: otp,
      expireAt: Date.now() + minutesExpire * 60,
    };

    const forgotPassword = new ForgotPassword(objectForgotPassword);
    await forgotPassword.save();

    //> Send OTP through email
    const subject = "OTP code to verify password recovery";
    const html = `
      The OTP code to retrieve your password is: <b>${otp}</b> (Valid for a period of <b>${minutesExpire}</b> minutes).
      Please do not share this OTP code with anyone.
    `
    sendMailHelper.sendMail(email, subject, html);

    return res.status(200).json({ message: "OTP code sent via email!" });  
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while generating or sending OTP!" });
  }
};

//< [POST] /api/auth/users/otp-password
module.exports.otpPassword = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await ForgotPassword.findOne({ email, otp });

    if (!record) {
      return res.status(401).json({ message: "Invalid or expired OTP code!" });
    }
    else {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }

      const { password: pass, ...rest } = user._doc;
      res.cookie("access_token", generateJWT(user), { 
        httpOnly: true,                   
        secure: process.env.NODE_ENV === "production",            
        sameSite: "strict",                   
      })
      .status(200)
      .json({ 
        message: "OTP verified successfully!",
        user: { id: user._id, email: user.email },
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while verifying OTP code!" });
  }
};