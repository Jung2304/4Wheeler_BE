module.exports = {
  CORS : {
    origin: [
      'https://fourwheeler-cyan.vercel.app/', // production
      'http://localhost:5137'       // local development
    ],
    credentials: true              // Allow credentials (cookies) in cross-origin requests
  }
}
