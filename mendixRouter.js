const express = require("express");
const router = express.Router();

const { executeScript } = require('./script');

router.post('/generatemendixapp', async (req, res) => {
    try {
        const jsonData = req.body;
        
        await executeScript(jsonData);

        res.status(200).json({ message: "Script executed successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;