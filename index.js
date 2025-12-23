const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// 1. Universal Status Check
app.get("/api/status", async (req, res) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.json({ status: "❌ Error", message: "Key missing in Render." });
    
    try {
        // Using the 'latest' alias which is most compatible
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest?key=${key}`);
        const data = await response.json();
        
        if (response.ok) {
            res.json({ status: "✅ Connected", message: "AI is ready to work!" });
        } else {
            res.json({ status: "⚠️ Key Issue", message: data.error.message });
        }
    } catch (err) {
        res.json({ status: "❌ Offline", message: "Connection failed." });
    }
});

// 2. Universal Refine Route
app.post("/api/refine", async (req, res) => {
    try {
        const { text } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Professionalize this for an office environment: " + text }] }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            res.json({ refinedText: data.candidates[0].content.parts[0].text });
        } else {
            res.json({ refinedText: "AI Response empty. Error: " + (data.error?.message || "Check safety filters.") });
        }
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server Live"));
