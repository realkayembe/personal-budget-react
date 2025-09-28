// Budget API

const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3005;

app.use(cors());
//Below line not needed for API-only server as CORS is enabled
//app.use('/', express.static('public'));

const budgetData = require(path.join(__dirname, 'budgetdata.json'));

app.get('/budget', (req, res) => {
    res.json(budgetData);
});

app.listen(port, () => {
    console.log(`API served at http://localhost:${port}`);
});