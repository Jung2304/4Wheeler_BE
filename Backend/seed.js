require("dotenv").config();
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

// Models
const Car = require("./src/api/models/cars.model.js");
const User = require("./src/api/models/users.model.js");

const MONGODB_URL = process.env.MONGODB_URL;

const dummyCars = [
  {
    make: "BMW",
    model: "X5",
    year: 2023,
    price: 75000,
    color: "Black",
    category: "SUV",
    seats: 5,
    transmission: "Automatic",
    fuelType: "Gasoline",
    engine: "2.0L Turbo",
    horsepower: 335,
    images: ["bmw-x5-1.jpg", "bmw-x5-2.jpg"],
    description: "Premium luxury SUV with advanced features and spacious interior"
  },
  {
    make: "Mercedes-Benz",
    model: "C-Class",
    year: 2022,
    price: 65000,
    color: "Silver",
    category: "Sedan",
    seats: 5,
    transmission: "Automatic",
    fuelType: "Gasoline",
    engine: "1.5L Turbo",
    horsepower: 255,
    images: ["mercedes-c-class-1.jpg", "mercedes-c-class-2.jpg"],
    description: "Elegant sedan with cutting-edge technology and comfort"
  },
  {
    make: "Toyota",
    model: "Corolla",
    year: 2023,
    price: 35000,
    color: "White",
    category: "Sedan",
    seats: 5,
    transmission: "Automatic",
    fuelType: "Hybrid",
    engine: "1.8L Hybrid",
    horsepower: 168,
    images: ["toyota-corolla-1.jpg", "toyota-corolla-2.jpg"],
    description: "Reliable and fuel-efficient family sedan"
  },
  {
    make: "Audi",
    model: "Q7",
    year: 2023,
    price: 85000,
    color: "Red",
    category: "SUV",
    seats: 7,
    transmission: "Automatic",
    fuelType: "Gasoline",
    engine: "3.0L TFSI",
    horsepower: 335,
    images: ["audi-q7-1.jpg", "audi-q7-2.jpg"],
    description: "Luxurious 7-seater SUV with premium features"
  },
  {
    make: "Honda",
    model: "CR-V",
    year: 2022,
    price: 42000,
    color: "Blue",
    category: "SUV",
    seats: 5,
    transmission: "Automatic",
    fuelType: "Gasoline",
    engine: "1.5L Turbo",
    horsepower: 190,
    images: ["honda-crv-1.jpg", "honda-crv-2.jpg"],
    description: "Practical and spacious crossover SUV for families"
  },
  {
    make: "Volkswagen",
    model: "Golf",
    year: 2023,
    price: 38000,
    color: "Gray",
    category: "Hatchback",
    seats: 5,
    transmission: "Automatic",
    fuelType: "Gasoline",
    engine: "1.4L TSI",
    horsepower: 150,
    images: ["vw-golf-1.jpg", "vw-golf-2.jpg"],
    description: "Popular hatchback with excellent handling and efficiency"
  },
  {
    make: "Porsche",
    model: "911",
    year: 2023,
    price: 120000,
    color: "Yellow",
    category: "Sports Car",
    seats: 4,
    transmission: "Automatic",
    fuelType: "Gasoline",
    engine: "3.0L Twin-Turbo",
    horsepower: 443,
    images: ["porsche-911-1.jpg", "porsche-911-2.jpg"],
    description: "Iconic sports car with thrilling performance"
  },
  {
    make: "Tesla",
    model: "Model 3",
    year: 2023,
    price: 55000,
    color: "Pearl White",
    category: "Sedan",
    seats: 5,
    transmission: "Automatic",
    fuelType: "Electric",
    engine: "Electric Motor",
    horsepower: 358,
    images: ["tesla-model3-1.jpg", "tesla-model3-2.jpg"],
    description: "Electric sedan with advanced autonomous features"
  }
];

const dummyUsers = [
  {
    username: "admin",
    email: "admin@4wheeler.com",
    password: bcryptjs.hashSync("Admin123@", 10),
    phone: "0123456789",
    role: "admin",
    status: "active",
    favorites: []
  },
  {
    username: "testuser1",
    email: "testuser1@gmail.com",
    password: bcryptjs.hashSync("Test123@", 10),
    phone: "0123456789",
    role: "user",
    status: "active",
    favorites: []
  },
  {
    username: "testuser2",
    email: "testuser2@gmail.com",
    password: bcryptjs.hashSync("Test123@", 10),
    phone: "0987654321",
    role: "user",
    status: "active",
    favorites: []
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URL);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Car.deleteMany({});
    await User.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Insert dummy cars
    const createdCars = await Car.insertMany(dummyCars);
    console.log(`✅ Inserted ${createdCars.length} dummy cars`);

    // Add first 3 cars to user1 favorites
    dummyUsers[0].favorites = [createdCars[0]._id, createdCars[1]._id, createdCars[2]._id];
    dummyUsers[1].favorites = [createdCars[3]._id, createdCars[4]._id];

    // Insert dummy users
    const createdUsers = await User.insertMany(dummyUsers);
    console.log(`✅ Inserted ${createdUsers.length} dummy users`);

    console.log("\n📋 Dummy Data Summary:");
    console.log("------------------------");
    console.log(`Cars: ${createdCars.length}`);
    console.log(`Users: ${createdUsers.length}`);
    console.log("\nAdmin User:");
    console.log(`  Username: admin`);
    console.log(`  Email: admin@4wheeler.com`);
    console.log(`  Password: Admin123@`);
    console.log("\nRegular Users:");
    createdUsers.slice(1).forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.username} (${user.email})`);
      console.log(`     Password: Test123@`);
      console.log(`     Favorites: ${user.favorites.length} cars`);
    });
    console.log("\n✅ Database seeded successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    process.exit(1);
  }
}

seedDatabase();
