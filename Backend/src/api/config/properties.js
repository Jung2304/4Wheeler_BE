module.exports = {
  CORS : {
    origin: [
      'https://fourwheeler-ten.vercel.app',
      'http://localhost:5137'       // local development
    ],
    credentials: true              // Allow credentials (cookies) in cross-origin requests
  }
}
