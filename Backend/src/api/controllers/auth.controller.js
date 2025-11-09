//! PACKAGES
const bcryptjs = require("bcryptjs");
const validator = require("validator");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

//! HELPERS
const generate = require("../helpers/generateRandom.js");
const { generateAccessToken, generateRefreshToken } = require("../helpers/generateJWT.js");
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
      
      const accessToken = generateAccessToken(newUser);
      const refreshToken = generateRefreshToken(newUser);

      res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      const { password: pass, ...rest } = newUser._doc;
      return res.status(201).json({ 
        message: "User created successfully!", 
        user: rest,
      });
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
      const validPassword = await bcryptjs.compare(password, validUser.password);
      
      if (!validPassword) {
        return res.status(401).json({ message: "Email or password is incorrect!" });
      } 
      else {
        const { password: pass, ...rest } = validUser._doc;
        
        res
        .cookie("access_token", generateAccessToken(validUser), { 
          httpOnly: true,                   // Hide cookie from JS
          secure: process.env.NODE_ENV === "production",            // Only HTTPS sends cookies
          sameSite: "strict",                   // Block cross-site cookie sending
        })
        .cookie("refresh_token", generateRefreshToken(validUser), {
          httpOnly: true,                   
          secure: process.env.NODE_ENV === "production",            
          sameSite: "strict", 
        }).status(200).json(rest);
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while logging in!" });
  }
};

//< [POST] /api/auth/users/logout
module.exports.logout = async (req, res) => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,                   
      secure: process.env.NODE_ENV === "production",            
      sameSite: "strict", 
    });
    res.clearCookie("refresh_token", {
      httpOnly: true,                   
      secure: process.env.NODE_ENV === "production",            
      sameSite: "strict", 
    });

    return res.status(200).json({ message: "Logged out successfully!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Logout failed due to server error!" });
  }
};

//< [POST] /api/auth/users/refresh-token
module.exports.refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing or used!" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const newAccessToken = generateAccessToken({
      id: decoded.sub,
      username: decoded.username
    });

    res.cookie("access_token", newAccessToken, {
      httpOnly: true,                   
      secure: process.env.NODE_ENV === "production",            
      sameSite: "strict", 
    });

    return res.status(200).json({ message: "Access token refreshed!" });
  } catch (error) {
    console.error(error);
    return res.status(403).json({ message: "Invalid or expired refresh token!" });
  }
};

//< [POST] /api/auth/google
module.exports.google = async (req, res) => {
  try {
    const { email, name, picture } = req.googleUser;

    const user = await User.findOne({ email });

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
        username: name.split(" ").join("").toLowerCase() + generate.generateRandomString(7), 
        email, 
        password: hashedPassword,
        avatar: picture, 
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
      expireAt: Date.now() + minutesExpire * 60 * 1000,
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

      //> Generate a short-lived reset token, which proves you completed verification and have permission to change password once.
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
  
      //> Store token hash and expiry in ForgotPassword record
      record.resetToken = resetTokenHash;
      record.resetTokenExpires = Date.now() + 10 * 60 * 1000;
      await record.save();

      //> Return reset token to FE
      return res.status(200).json({
        message: "OTP verified successfully",
        reset_token: resetToken,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while verifying OTP code!" });
  }
};

//< [POST] /api/auth/users/reset-password
module.exports.resetPassword = async (req, res) => {
  try {
    const { reset_token, new_password } = req.body;
    if (!reset_token || !new_password) {
      return res.status(400).json({ message: "Reset token and new password are required!" });
    }

    const hashedToken = crypto.createHash("sha256").update(reset_token).digest("hex");

    const record = await ForgotPassword.findOne({
      resetToken: hashedToken,
      resetTokenExpires: { $gt: Date.now() },
    });
    if (!record) {
      return res.status(401).json({ message: "Invalid or expired reset token!" });
    }

    const user = await User.findOne({ email: record.email });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    
    const samePassword = await bcryptjs.compare(new_password, user.password);
    
    if (samePassword) {
      return res.status(400).json({ message: "New password cannot be the same as your old password!" });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(new_password, salt);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while resetting password!" });
  }
};