//! PACKAGES
const express = require("express");
const router = express.Router();

//< [POST] /api/gemini/compare-cars
router.post("/compare-cars", async (req, res) => {
  try {
    const { carA, carB } = req.body;

    if (!carA || !carB) {
      return res.status(400).json({ message: "Both carA and carB are required!" });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiKey) {
      return res.status(500).json({ message: "Gemini API key not configured!" });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`;
    console.log("🔍 Calling Gemini API...");

    const response = await fetch(
      apiUrl,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Compare these two cars concisely for a shopper. Highlight performance, fuel/energy efficiency, pricing, practicality, safety, and tech. Keep it under 200 words.

Car A: ${JSON.stringify(carA, null, 2)}

Car B: ${JSON.stringify(carB, null, 2)}`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      // Get response as text first to handle HTML error pages
      const errorText = await response.text();
      console.error("Gemini API error response:", errorText);
      
      // Try to parse as JSON if possible
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText.substring(0, 500) }; // Truncate HTML
      }
      
      return res.status(response.status).json({ 
        message: "Failed to get response from Gemini", 
        error: errorData,
        statusCode: response.status
      });
    }

    const data = await response.json();
    
    // Extract the text from Gemini response structure
    const comparisonText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No comparison available";
    
    return res.status(200).json({ 
      comparison: comparisonText,
      fullResponse: data 
    });
    
  } catch (err) {
    console.error("Gemini backend error:", err);
    return res.status(500).json({ 
      message: "Failed to compare cars", 
      error: err.message 
    });
  }
});

module.exports = router;
