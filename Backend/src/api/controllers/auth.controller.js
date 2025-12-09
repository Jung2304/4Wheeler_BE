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
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid or missing email format!" });
    }

    const existingUser = await User.findOne({         // return an object of {username, email}
      $or: [{ username }, { email }],
      deleted: false
    });

    if (existingUser) {
      const field = existingUser.username === username ? "Username" : "Email";
      return res.status(409).json({ message: `${field} already exists!` });
    } else {
      const hashedPassword = bcryptjs.hashSync(password, 10);

      const newUser = new User({ username, email, password: hashedPassword });
      await newUser.save();
      
      const accessToken = generateAccessToken(newUser);
      const refreshToken = generateRefreshToken(newUser);

      res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });
      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
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
      return res.status(409).json({ message: "Email or username already exists!" });
    }
    
    return res.status(500).json({ message: "Sign-up failed", error: error.message }); 
  }
};

//< [POST] /api/auth/users/login
module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid or missing email format!" });
    }

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
          secure: true,            // Only HTTPS sends cookies
          sameSite: "none",                   // Allow cross-site cookie sending
          path: "/",
        })
        .cookie("refresh_token", generateRefreshToken(validUser), {
          httpOnly: true,                   
          secure: true,            
          sameSite: "none",
          path: "/", 
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
      secure: true,            
      sameSite: "none",
      path: "/",
    });
    res.clearCookie("refresh_token", {
      httpOnly: true,                   
      secure: true,            
      sameSite: "none",
      path: "/", 
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
    const refreshToken = req.cookies.refresh_token || req.body.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing or used!" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Create a user object from decoded token, preserving role and other fields
    const userObject = {
      _id: decoded.sub,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role || "user"
    };

    const newAccessToken = generateAccessToken(userObject);

    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    
    return res.status(200).json({ 
      message: "Access token refreshed!",
      accessToken: newAccessToken  // Also return token in body for SPA apps
    });
  } catch (error) {
    console.error("Refresh token error:", error.message);
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
      
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      
      res.cookie("access_token", accessToken, { 
        httpOnly: true,                   
        secure: true,            
        sameSite: "none",
        path: "/",
      })
      .cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      })
      .status(200).json({ 
        message: "Login successful!",
        user: rest,
        accessToken,
        refreshToken
      });
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
      
      const accessToken = generateAccessToken(newUser);
      const refreshToken = generateRefreshToken(newUser);
      
      res.cookie("access_token", accessToken, { 
        httpOnly: true,                   
        secure: true,            
        sameSite: "none",
        path: "/",
      })
      .cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      })
      .status(201).json({ 
        message: "User created and logged in successfully!",
        user: rest,
        accessToken,
        refreshToken
      });
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
    const subject = "Password Reset Request - 4Wheeler";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
        </div>
        
        <div style="padding: 40px 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
          <p style="color: #1f2937; font-size: 16px; margin-bottom: 20px;">Hello,</p>
          
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
            We received a request to reset your password for your 4Wheeler account. 
            Use the verification code below to proceed with resetting your password.
          </p>
          
          <div style="background-color: #ffffff; border: 2px dashed #2563eb; border-radius: 8px; padding: 25px; text-align: center; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
            <p style="font-size: 36px; font-weight: bold; color: #2563eb; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
              ${otp}
            </p>
          </div>
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0; border-radius: 4px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>⚠️ Security Notice:</strong>
            </p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #92400e; font-size: 14px;">
              <li>This code is valid for <strong>${minutesExpire} minutes</strong> only</li>
              <li>Never share this code with anyone</li>
              <li>4Wheeler staff will never ask for your OTP</li>
            </ul>
          </div>
          
          <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-top: 25px;">
            If you didn't request a password reset, please ignore this email or contact our support team if you have concerns about your account security.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
            Best regards,<br>
            <strong style="color: #2563eb;">The 4Wheeler Team</strong>
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; background-color: #f3f4f6; border-radius: 0 0 8px 8px;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            This is an automated message. Please do not reply to this email.
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
            © 2025 4Wheeler. All rights reserved.
          </p>
        </div>
      </div>
    `;
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

//< [GET] /api/auth/users/profile
module.exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.sub;  

    const user = await User.findById(userId)
      .select("-password")
      .populate("favorites");

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    return res.status(200).json({
      message: "User profile retrieved successfully!",
      user
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while fetching user profile!" });
  }
}; 