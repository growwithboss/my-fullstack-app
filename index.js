const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// 1. Status Check: Probes the models list directly
app.get("/api/status", async (req, res) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.json({ status: "❌ Error", message: "API Key is missing in Render." });
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        
        if (response.ok) {
            // This will list all models your key can actually see
            res.json({ status: "✅ Connected", message: "AI is ready!" });
        } else {
            res.json({ status: "⚠️ Issue", message: data.error.message });
        }
    } catch (err) {
        res.json({ status: "❌ Offline", message: "Cannot reach Google." });
    }
});

// 2. Refine Route: Uses the version-specific model name
app.post("/api/refine", async (req, res) => {
    try {
        const { text } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        // Using gemini-1.5-flash-001 - the most stable, direct identifier
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Professionalize this for an office: " + text }] }],
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            res.json({ refinedText: data.candidates[0].content.parts[0].text });
        } else {
            // Check if the error is actually a 404
            const errorMsg = data.error ? data.error.message : "AI returned no text.";
            res.json({ refinedText: "System Message: " + errorMsg });
        }
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("System Operational"));
