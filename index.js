const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// 1. Bytez Status Check
app.get("/api/status", async (req, res) => {
    const key = process.env.BYTEZ_API_KEY; // Change your Render variable name to this
    if (!key) return res.json({ status: "❌ Error", message: "Bytez Key missing in Render." });
    
    try {
        const response = await fetch("https://api.bytez.com/models/v2/list", {
            headers: { "Authorization": key }
        });
        if (response.ok) {
            res.json({ status: "✅ Connected", message: "BOSSai (Bytez) is ready!" });
        } else {
            res.json({ status: "⚠️ Issue", message: "Invalid Bytez Key." });
        }
    } catch (err) {
        res.json({ status: "❌ Offline", message: "Cannot reach Bytez servers." });
    }
});

// 2. The Main AI Route (Modified for Bytez)
app.post("/api/ai", async (req, res) => {
    try {
        const { prompt, type, model } = req.body;
        const BYTEZ_KEY = process.env.BYTEZ_API_KEY;

        // Bytez Chat API Structure
        let systemMsg = "You are BOSSai assistant. ";
        if (type === 'email') systemMsg += "Refine this for office: ";
        if (type === 'code') systemMsg += "Provide clean code for: ";
        if (type === 'excel') systemMsg += "Provide Excel formula for: ";

        // Bytez uses a specific URL format: api.bytez.com/models/v2/{model_id}
        const response = await fetch(`https://api.bytez.com/models/v2/${model}`, {
            method: "POST",
            headers: {
                "Authorization": BYTEZ_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: systemMsg },
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await response.json();
        
        // Handle Bytez output format
        if (data.output) {
            res.json({ result: data.output });
        } else {
            res.json({ result: "BOSSai error: " + (data.error || "Model timed out.") });
        }
    } catch (error) {
        res.status(500).json({ result: "BOSSai Backend Error." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("BOSSai Powered by Bytez"));
