const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// 1. Fixed Status Check Route
app.get("/api/status", async (req, res) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.json({ status: "❌ Error", message: "API Key is missing in Render Settings." });
    
    try {
        // Using stable v1 endpoint to check model availability
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash?key=${key}`);
        const data = await response.json();
        
        if (response.ok) {
            res.json({ status: "✅ Connected", message: "System is ready!" });
        } else {
            res.json({ status: "⚠️ Key Issue", message: data.error.message });
        }
    } catch (err) {
        res.json({ status: "❌ Offline", message: "Backend cannot reach Google." });
    }
});

// 2. Fixed Refine Route
app.post("/api/refine", async (req, res) => {
    try {
        const { text } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        // Updated to v1 stable endpoint
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Professionalize this for an office environment: " + text }] }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            const refined = data.candidates[0].content.parts[0].text;
            res.json({ refinedText: refined });
        } else {
            res.json({ refinedText: "AI returned an empty response. Error: " + (data.error?.message || "Safety Block") });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server Running"));
