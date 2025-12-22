const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// 1. Test Route (Open this in your browser to see if it works)
app.get("/", (req, res) => {
    res.send("Server is ALIVE!");
});

// 2. The AI Route
app.post("/api/refine", async (req, res) => {
    try {
        const { text } = req.body;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Professionalize: " + text }] }]
            })
        });
        const data = await response.json();
        const result = data.candidates[0].content.parts[0].text;
        res.json({ refinedText: result });
    } catch (err) {
        res.status(500).json({ error: "Backend error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on " + PORT));
