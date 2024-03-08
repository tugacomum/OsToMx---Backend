const express = require("express");
const router = express.Router();
const validator = require('validator');
const { executeScript } = require('./script');
 
router.use(express.json());
 
router.post('/generatemendixapp', async (req, res) => {
    try {
        const jsonData = req.body;
        const response = {
            HasError: false,
            ErrorMessage: "Internal Server Error",
        }

        if (Object.keys(jsonData).length === 0 && jsonData.constructor === Object) {
            response.HasError = true;
            response.ErrorMessage = "JSON Required!";
            res.status(400).json(response);
            return;
        }
 
        if (typeof jsonData !== 'object' || jsonData === null) {
            response.HasError = true;
            response.ErrorMessage = "Invalid JSON format!";
            res.status(400).json(response);
            return;
        }
 
        try {
            JSON.parse(JSON.stringify(jsonData));
        } catch (jsonError) {
            response.HasError = true;
            response.ErrorMessage = "Invalid JSON format!";
            res.status(400).json(response);
            return;
        }
 
        response.HasError = false;
        response.ErrorMessage = "Script executed successfully!";
        await executeScript(jsonData);
        res.status(200).json(response);
    } catch (error) {
        const response = {
            HasError: true,
            ErrorMessage: error.message || "Internal Server Error"
        }
        res.status(500).json(response);
    }
});
 
module.exports = router;