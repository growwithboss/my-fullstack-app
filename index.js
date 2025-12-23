const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// 1. Updated Status Check
app.get("/api/status", async (req, res) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.json({ status: "❌ Error", message: "Key missing in Render settings." });
    try {
        // v1beta is more compatible for 1.5-flash models
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest?key=${key}`);
        if (response.ok) {
            res.json({ status: "✅ Connected", message: "AI Bridge is live and ready!" });
        } else {
            const err = await response.json();
            res.json({ status: "⚠️ Issue", message: err.error.message });
        }
    } catch (err) {
        res.json({ status: "❌ Offline", message: "Cannot reach Google servers." });
    }
});

// 2. Updated Refiner Route (Fixed for 404 Model Not Found)
app.post("/api/refine", async (req, res) => {
    try {
        const { text } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Rewrite this message to be professional for an office environment: " + text }] }],
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
            const refined = data.candidates[0].content.parts[0].text;
            res.json({ refinedText: refined });
        } else {
            const reason = data.candidates?.[0]?.finishReason || "UNKNOWN_ERROR";
            res.json({ refinedText: `No text returned. Reason: ${reason}. Check prompt safety.` });
        }
    } catch (error) {
        res.status(500).json({ error: "Server Internal Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("System Online"));
