const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// 1. System Health Check
app.get("/api/status", async (req, res) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.json({ status: "❌ Error", message: "Key missing in Render settings." });
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash?key=${key}`);
        if (response.ok) {
            res.json({ status: "✅ Connected", message: "AI Bridge is live!" });
        } else {
            const err = await response.json();
            res.json({ status: "⚠️ Issue", message: err.error.message });
        }
    } catch (err) {
        res.json({ status: "❌ Offline", message: "Cannot reach Google." });
    }
});

// 2. The Refiner Route (Fixed for UNKNOWN errors)
app.post("/api/refine", async (req, res) => {
    try {
        const { text } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Professionalize this for an office environment: " + text }] }],
                generationConfig: {
                    temperature: 0.9,
                    topP: 1,
                    topK: 1,
                    maxOutputTokens: 2048, // Higher limit fixes unexpected empty responses
                },
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
            res.json({ refinedText: `AI returned no text. Reason: ${reason}. Try a longer prompt.` });
        }
    } catch (error) {
        res.status(500).json({ error: "Server Internal Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("System Online"));
