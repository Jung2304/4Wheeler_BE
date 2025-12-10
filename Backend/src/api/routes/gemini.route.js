//! PACKAGES
const express = require("express");
const router = express.Router();

//< [GET] /api/gemini/models - List available models
router.get("/models", async (req, res) => {
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiKey) {
      return res.status(500).json({ message: "Gemini API key not configured!" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to list models:", errorText);
      return res.status(response.status).json({ 
        message: "Failed to list models",
        error: errorText.substring(0, 500)
      });
    }

    const data = await response.json();
    
    // Filter only models that support generateContent
    const generateContentModels = data.models?.filter(model => 
      model.supportedGenerationMethods?.includes("generateContent")
    ) || [];

    return res.json({
      total: data.models?.length || 0,
      generateContentModels: generateContentModels.map(m => ({
        name: m.name,
        displayName: m.displayName,
        description: m.description,
        supportedMethods: m.supportedGenerationMethods
      })),
      allModels: data.models
    });
  } catch (err) {
    console.error("Error listing models:", err);
    return res.status(500).json({ 
      message: "Failed to list models",
      error: err.message 
    });
  }
});

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

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
    
    // Retry logic for 503 errors (server overload)
    const maxRetries = 2;
    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`🔄 Retry attempt ${attempt}/${maxRetries}...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Wait 1s, 2s
        } else {
          console.log("🔍 Calling Gemini API...");
        }

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
          
          // Try to parse as JSON if possible
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText.substring(0, 500) }; // Truncate HTML
          }

          // Retry on 503 (server overload)
          if (response.status === 503 && attempt < maxRetries) {
            console.error(`⚠️ Gemini overloaded (attempt ${attempt + 1}/${maxRetries + 1})`);
            lastError = errorData;
            continue; // Try again
          }

          console.error("Gemini API error response:", errorData);
          return res.status(response.status).json({ 
            message: "Failed to get response from Gemini", 
            error: errorData,
            statusCode: response.status
          });
        }

        // Success! Parse and return
        const data = await response.json();
        
        // Extract the text from Gemini response structure
        const comparisonText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No comparison available";
        
        console.log("✅ Gemini API success!");
        return res.status(200).json({ 
          comparison: comparisonText,
          fullResponse: data 
        });

      } catch (fetchError) {
        lastError = fetchError;
        if (attempt < maxRetries) {
          console.error(`⚠️ Fetch error (attempt ${attempt + 1}/${maxRetries + 1}):`, fetchError.message);
          continue; // Try again
        }
      }
    }

    // All retries failed
    throw lastError || new Error("Failed after retries");
    
  } catch (err) {
    console.error("Gemini backend error:", err);
    return res.status(500).json({ 
      message: "Failed to compare cars after multiple attempts", 
      error: err.message 
    });
  }
});

module.exports = router;
