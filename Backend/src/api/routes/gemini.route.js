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

    const response = await fetch(
      `https://generative.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
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
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      return res.status(response.status).json({ 
        message: "Failed to get response from Gemini", 
        error: errorData 
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
