const express = require("express");
const cors = require("cors");
const app = express();

// 1. CORS: Ensure your GitHub Pages domain is allowed
app.use(cors({
    origin: "https://growwithboss.github.io",
    methods: ["GET", "POST"]
}));
app.use(express.json());

// 2. STATUS ROUTE: Fixed to work with /api/status
app.get("/api/status", (req, res) => {
    res.json({ status: "✅ Connected", message: "BOSSai (Bytez) is active!" });
});

// 3. MAIN AI ROUTE: Handles Bytez requests
app.post("/api/ai", async (req, res) => {
    try {
        const { prompt, type, model } = req.body;
        const BYTEZ_KEY = process.env.BYTEZ_API_KEY;

        const response = await fetch(`https://api.bytez.com/models/v2/${model}`, {
            method: "POST",
            headers: {
                "Authorization": BYTEZ_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [{ role: "user", content: prompt }]
            })
        });

        const data = await response.json();
        
        // Bytez returns the output in the 'output' field
        if (data && data.output) {
            res.json({ result: data.output });
        } else {
            res.json({ result: `BOSSai error: ${data.error || "Model returned no output."}` });
        }
    } catch (error) {
        res.status(500).json({ result: "BOSSai Backend Connection Failed." });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`BOSSai Live on port ${PORT}`);
});
