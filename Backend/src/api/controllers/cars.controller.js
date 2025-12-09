//! PACKAGES
const path = require("path");
const fs = require("fs");

//! HELPERS
const { uploadToCloudinary, deleteFromCloudinary } = require("../helpers/uploadHelper.js");
const sendMailHelper = require("../helpers/sendMail.js");

//! MODEL
const Car = require("../models/cars.model.js");
const User = require("../models/users.model.js");
const TestDrive = require("../models/test-drive.model.js");

//< [GET] /api/cars/listing
module.exports.getCars = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const search = req.query.search || "";
    const category = req.query.category || "";
    const status = req.query.status || "";

    const query = { deleted: false };
    if (search) {
      query.$or = [
        { make: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } }
      ];
    }
    if (category) {
      query.category = category;
    }
    if (status) {
      query.status = status;
    }

    const total = await Car.countDocuments(query);
    const cars = await Car.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 }); 
    
    res.json({
      page,
      pages: Math.ceil(total / limit),
      total,
      cars
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch cars due to server error!" });
  }
}

//< [GET] /api/cars/:id
module.exports.getCarDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const car = await Car.findOne({ _id: id, deleted: false });
    
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    
    res.json(car);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch car details" });
  }
}

//< [GET] /api/admin/cars
module.exports.getAllCars = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const search = req.query.search || "";
    const category = req.query.category || "";
    const status = req.query.status || "";

      // Admin can see all cars including deleted
    const query = {};
    if (search) {
      query.$or = [
        { make: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } }
      ];
    }
    if (category) {
      query.category = category;
    }
    if (status) {
      query.status = status;
    }

    const total = await Car.countDocuments(query);
    const cars = await Car.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 }); 
    
    res.json({
      page,
      pages: Math.ceil(total / limit),
      total,
      cars
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch cars due to server error!" });
  }
}

//< [GET] /api/admin/cars/:id
module.exports.getCarDetailAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Admin can see all cars including deleted
    const car = await Car.findOne({ _id: id });
    
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    
    res.json(car);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch car details" });
  }
}

//< [POST] /api/admin/cars/create
module.exports.createCar = async (req, res) => {
  try {
    const {
      make, model, year, price, color, category, seats, transmission, 
      fuelType, engine, horsepower, description, images
    } = req.body;

    if (!make || !model || !year || !price) {
      return res.status(400).json({ message: "Make, model, year and price are required!" });
    }

    const existingCar = await Car.findOne({
      make, model, deleted: false
    });

    if (existingCar) {
      return res.status(409).json({ message: `Brand ${make} with model ${model} already exists!` });
    }

    // Handle images from two sources:
    // 1. Uploaded files via multipart/form-data
    // 2. Image URLs passed in JSON body
    let imageUrls = [];

    // First, process uploaded files (multipart/form-data)
    if (req.files && req.files.length > 0) {
      try {
        for (let file of req.files) {
          const fileName = `${make}-${model}-${Date.now()}-${Math.random()}`;
          const imageUrl = await uploadToCloudinary(file.buffer, fileName);
          imageUrls.push(imageUrl);
        }
      } catch (uploadError) {
        return res.status(500).json({ message: `Image upload failed: ${uploadError.message}` });
      }
    }

    // Then, add image URLs from JSON body if provided
    if (images && Array.isArray(images) && images.length > 0) {
      // Validate URLs
      const validUrls = images.filter(url => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      });
      imageUrls = [...imageUrls, ...validUrls];
    }

    const car = new Car({
      make, 
      model, 
      year: Number(year),
      price: Number(price),
      color: color || "",
      category: category || "Sedan",
      seats: seats ? Number(seats) : 4,
      transmission: transmission || "Automatic",
      fuelType: fuelType || "Gasoline",
      engine: engine || "",
      horsepower: horsepower ? Number(horsepower) : undefined,
      images: imageUrls,
      description: description || "",
    });
    await car.save();

    return res.status(201).json({ message: "New car created successfully!", car });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed due to server error!" });
  }
}

//< [PUT] /api/admin/cars/:id
module.exports.updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const { make, model, year, price, color, category, seats, transmission, 
            fuelType, engine, horsepower, images, description } = req.body;

    const car = await Car.findOne({ _id: id, deleted: false });
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Update fields if provided
    if (make) car.make = make;
    if (model) car.model = model;
    if (year) car.year = Number(year);
    if (price) car.price = Number(price);
    if (color) car.color = color;
    if (category) car.category = category;
    if (seats) car.seats = Number(seats);
    if (transmission) car.transmission = transmission;
    if (fuelType) car.fuelType = fuelType;
    if (engine) car.engine = engine;
    if (horsepower) car.horsepower = Number(horsepower);
    if (images) car.images = images;
    if (description) car.description = description;

    await car.save();

    return res.json({ message: "Car updated successfully!", car });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update car!" });
  }
}

//< [DELETE] /api/admin/cars/:id
module.exports.deleteCar = async (req, res) => {
  try {
    const { id } = req.params;

    const car = await Car.findByIdAndUpdate(
      id,
      { deleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    return res.json({ message: "Car deleted successfully!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete car!" });
  }
}

//< [POST] /api/cars/favorites/:carId
module.exports.addToFavorites = async (req, res) => {
  try {
    const { carId } = req.params;
    const userId = req.user.sub;  

    // Check if car exists
    const car = await Car.findOne({ _id: carId, deleted: false });
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Add to favorites if not already there
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favorites: carId } },
      { new: true }
    ).populate("favorites");

    res.json({
      message: "Car added to favorites",
      favorites: user.favorites
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add to favorites" });
  }
}

//< [DELETE] /api/cars/favorites/:carId
module.exports.removeFromFavorites = async (req, res) => {
  try {
    const { carId } = req.params;
    const userId = req.user.sub;  

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { favorites: carId } },
      { new: true }
    ).populate("favorites");

    res.json({
      message: "Car removed from favorites",
      favorites: user.favorites
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to remove from favorites" });
  }
}

//< [GET] /api/cars/user/favorites
module.exports.getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.sub;  

    const user = await User.findById(userId).populate("favorites");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      total: user.favorites.length,
      favorites: user.favorites
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch favorites" });
  }
}

//< [POST] /api/cars/test-drive/:carId
module.exports.bookTestDrive = async (req, res) => {
  try {
    const { carId } = req.params;
    const { name, phone, preferredDate, message } = req.body;
    const userId = req.user.sub;

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone number are required!" });
    }

    // Get user email from JWT token
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Check if car exists
    const car = await Car.findOne({ _id: carId, deleted: false });
    if (!car) {
      return res.status(404).json({ message: "Car not found!" });
    }

    // Create test drive booking
    const testDrive = new TestDrive({
      name,
      phone,
      email: user.email,
      car: carId,
      preferredDate: preferredDate ? new Date(preferredDate) : undefined,
      message: message || ""
    });
    await testDrive.save();

    // Calculate test drive date (2 days from now)
    const testDriveDate = new Date();
    testDriveDate.setDate(testDriveDate.getDate() + 2);
    const formattedDate = testDriveDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Send confirmation email
    const subject = "Test Drive Booking Confirmation - 4Wheeler";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🎉 Test Drive Booking Confirmed!</h2>
        
        <p>Dear <strong>${name}</strong>,</p>
        
        <p>Thank you for booking a test drive with 4Wheeler! Your booking has been successfully confirmed.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">Booking Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>🚗 Vehicle:</strong> ${car.make} ${car.model} (${car.year})</li>
            <li><strong>💰 Price:</strong> $${car.price.toLocaleString()}</li>
            <li><strong>📅 Scheduled Date:</strong> ${formattedDate}</li>
            <li><strong>📞 Contact Number:</strong> ${phone}</li>
            <li><strong>📧 Email:</strong> ${user.email}</li>
          </ul>
        </div>
        
        <div style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
          <p style="margin: 0;"><strong>⏰ Important:</strong> Please arrive at our showroom at least 15 minutes before your scheduled time. Don't forget to bring your valid driver's license!</p>
        </div>
        
        <p><strong>Showroom Address:</strong><br>
        4Wheeler Showroom<br>
        123 Auto Drive, Car City<br>
        Phone: (555) 123-4567</p>
        
        <p>If you need to reschedule or have any questions, please don't hesitate to contact us.</p>
        
        <p>We look forward to seeing you!</p>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Best regards,<br>
          <strong>The 4Wheeler Team</strong>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `;

    await sendMailHelper.sendMail(user.email, subject, html);

    return res.status(201).json({
      message: "Test drive booked successfully! Confirmation email sent.",
      booking: {
        id: testDrive._id,
        carName: `${car.make} ${car.model}`,
        testDriveDate: formattedDate,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to book test drive!" });
  }
} 