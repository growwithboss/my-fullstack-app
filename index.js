const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Main route for testing
app.get("/", (req, res) => {
    res.json({ message: "Office AI Backend is live!" });
});

// The AI Refiner Route
app.post("/api/refine", async (req, res) => {
    const { text } = req.body;
    const API_KEY = process.env.AIzaSyA3C50hjiASoWnhi0G-8Q1iozqq5Cr4Mco; // This pulls from Render's environment

    if (!text) return res.status(400).json({ error: "No text provided" });

    try {
        // We use a built-in global fetch (available in Node 18+)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Rewrite this message to be professional and polite for an office environment: " + text }] }]
            })
        });

        const data = await response.json();
        
        // Extract the AI's response text
        const refined = data.candidates[0].content.parts[0].text;
        res.json({ refinedText: refined });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "Failed to connect to AI service" });
    }
});

app.listen(PORT, () => {
    console.log("Server is listening on port " + PORT);
});
