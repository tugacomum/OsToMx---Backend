const express = require("express");
const router = express.Router();

const { executeScript } = require('./script');

router.post('/generatemendixapp', async (req, res) => {
    try {
        const jsonData = req.body;

        const response = {
            HasError: false,
            ErrorMessage: "Internal Server Error",
        }

        if (!jsonData || Object.keys(jsonData).length === 0) {
            response.HasError = true;
            response.ErrorMessage = "Json Required!";
            res.status(500).json(response);
        } else {
            response.HasError = false;
            response.ErrorMessage = "Script executed successfully!";
            await executeScript(jsonData);
            res.status(200).json(response);
        }
    } catch (error) {
        const response = {
            HasError: true,
            ErrorMessage: error.message || "Internal Server Error"
        }

        res.status(500).json(response);
    }
});

module.exports = router;