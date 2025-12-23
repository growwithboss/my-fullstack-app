const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// 1. Status Check: Probes Google to see which model responds
app.get("/api/status", async (req, res) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.json({ status: "❌ Error", message: "Key missing in Render Environment." });
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        if (response.ok) {
            res.json({ status: "✅ Connected", message: "AI Bridge is active!" });
        } else {
            const err = await response.json();
            res.json({ status: "⚠️ Key Issue", message: err.error.message });
        }
    } catch (err) {
        res.json({ status: "❌ Offline", message: "Cannot reach Google servers." });
    }
});

// 2. Universal Refiner: Tries multiple model paths to ensure success
app.post("/api/refine", async (req, res) => {
    const { text } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;
    
    // We try these three versions in order. If one fails, we try the next.
    const modelPaths = [
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
        "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent",
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
    ];

    for (let path of modelPaths) {
        try {
            const response = await fetch(`${path}?key=${API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Professionalize this for an office environment: " + text }] }]
                })
            });

            const data = await response.json();
            if (response.ok && data.candidates) {
                return res.json({ refinedText: data.candidates[0].content.parts[0].text });
            }
        } catch (e) {
            continue; // Move to the next path if this one fails
        }
    }
    res.status(500).json({ error: "All AI model paths failed. Please check API Key permissions." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("System Fully Operational"));
