//! PACKAGES

//! MODEL
const Car = require("../models/cars.model.js");

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