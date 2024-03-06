const express = require('express');
require('dotenv');

const app = express();

const mendixRoute = require('./mendixRouter');

app.use(express.json());
app.use('/api/conversion', mendixRoute);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));