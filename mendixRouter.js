const express = require("express");
const router = express.Router();

const { executeScript } = require('./script');

router.post('/generatemendixapp', async (req, res) => {
    try {
        const jsonData = req.body;
        
        await executeScript(jsonData);

        res.status(200).json({ message: "Script executed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
});

module.exports = router;