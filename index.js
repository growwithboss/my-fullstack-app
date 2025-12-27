const express = require("express");
const cors = require("cors");
const Bytez = require("bytez.js"); // Make sure to use require for Node.js
const app = express();

app.use(cors({
    origin: "https://growwithboss.github.io",
    methods: ["GET", "POST"]
}));
app.use(express.json());

// 1. Initialize the Bytez SDK with your variable
const sdk = new Bytez(process.env.BYTEZ_API_KEY);

// 2. Status Route
app.get("/api/status", (req, res) => {
    res.json({ status: "✅ Connected", message: "BOSSai (SDK) is active!" });
});

// 3. Main AI Route using SDK
app.post("/api/ai", async (req, res) => {
    try {
        const { prompt, type, model: modelId } = req.body;

        // Initialize the specific model
        const model = sdk.model(modelId);

        let systemMsg = "";
        if (type === 'email') systemMsg = "Refine this for office: ";
        if (type === 'code') systemMsg = "Write clean code for: ";
        if (type === 'excel') systemMsg = "Provide Excel formula for: ";

        // Send input to model using model.run()
        const { error, output } = await model.run(systemMsg + prompt);

        if (error) {
            res.json({ result: `BOSSai error: ${error}` });
        } else {
            res.json({ result: output });
        }
    } catch (err) {
        res.status(500).json({ result: "BOSSai Backend SDK Error." });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`BOSSai SDK Mode active on port ${PORT}`);
});
