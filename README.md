# 🚗 4Wheeler — Car Dealership Backend

A RESTful backend API for a **Car Dealership Platform**, built with Node.js, Express.js, and MongoDB. The system supports vehicle browsing, user authentication, test-drive bookings, administrative management, and AI-powered car comparisons.

## 🛠️ Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?logo=mongoose&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-DD2C00?logo=firebase&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?logo=cloudinary&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?logo=googlegemini&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?logo=swagger&logoColor=black)

## ✨ Key Features

- **Authentication & Authorization:** JWT-based authentication, Google OAuth, role-based access control, and OTP password recovery.
- **Vehicle Management:** Car listings with search, filtering, pagination, and detailed vehicle information.
- **User Features:** Favorite vehicles, user profiles, and test-drive bookings with email confirmations.
- **Admin Dashboard APIs:** Create, update, and soft-delete vehicle listings, including Cloudinary image uploads.
- **AI Integration:** Google Gemini API for intelligent vehicle comparisons.
- **API Documentation:** Interactive REST API documentation using Swagger UI.

## 🚀 Getting Started

```bash
git clone https://github.com/Jung2304/4Wheeler_BE.git
cd 4Wheeler_BE/Backend
npm install
npm start
```

Configure the required environment variables in `.env` before starting the server.

**API Base URL:** `http://localhost:8000`

**Swagger Documentation:** `http://localhost:8000/api-docs`

## 📂 API Modules

| Module | Endpoint |
|---|---|
| Authentication | `/api/auth` |
| Vehicle Listings | `/api/cars` |
| Administration | `/api/admin` |
| AI Car Comparison | `/api/gemini` |
| API Documentation | `/api-docs` |

---

**Repository:** [Jung2304/4Wheeler_BE](https://github.com/Jung2304/4Wheeler_BE)
