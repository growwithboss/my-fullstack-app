let topScore = 0;

// GET the high score
app.get("/api/scores", (req, res) => {
    res.json({ maxScore: topScore });
});

// POST a new score
app.post("/api/scores", (req, res) => {
    const userScore = req.body.score;
    if (userScore > topScore) {
        topScore = userScore;
    }
    res.json({ success: true, currentTop: topScore });
});
