const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Main route to check if server is up
app.get("/", (req, res) => {
    res.send("Office AI Backend is live and running!");
});

// The AI Refiner Route
app.post("/api/refine", async (req, res) => {
    try {
        const { text } = req.body;
        // This looks for the "GEMINI_API_KEY" you set in Render's Environment settings
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!text) return res.status(400).json({ error: "No text provided" });

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Professionalize this for an office: " + text }] }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            const refined = data.candidates[0].content.parts[0].text;
            res.json({ refinedText: refined });
        } else {
            res.json({ refinedText: "AI could not process this. Check your API key or usage limits." });
        }
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Backend failed to process AI request" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server is running on port " + PORT));
