//! PACKAGES
const path = require("path");
const fs = require("fs");

//! MODEL
const Car = require("../models/cars.model.js");
const User = require("../models/users.model.js");

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

//< [POST] /api/admin/cars/create
module.exports.createCar = async (req, res) => {
  try {
    const {
      make, model, year, price, color, category, seats, transmission, 
      fuelType, engine, horsepower, images, description
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

    let imageFiles = images || [];
    if (req.file) {
      imageFiles = [req.file.filename];
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
      images: imageFiles,
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
    const userId = req.user._id; 

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
    const userId = req.user._id;

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
    const userId = req.user._id;

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