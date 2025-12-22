const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // This is vital to "read" data you send

// This is our temporary "database"
let dataStorage = ["Initial Message"];

// Route to get all data
app.get("/api/messages", (req, res) => {
    res.json(dataStorage);
});

// Route to add new data
app.post("/api/messages", (req, res) => {
    const newMessage = req.body.message;
    if(newMessage) {
        dataStorage.push(newMessage);
        res.json({ success: true, allMessages: dataStorage });
    } else {
        res.status(400).json({ error: "No message provided" });
    }
});

app.listen(PORT, () => {
    console.log("Server is listening on port " + PORT);
});