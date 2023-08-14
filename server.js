const express = require('express');
require('dotenv').config();
require('./db');
const morgan = require('morgan');
const port = process.env.PORT || 3000;
const cors = require('cors');
const app = express();
const apiSeedUrl = '/api/v1';

const couponRoute = require('./routes/coupon.routes');
const userRoute = require('./routes/user.routes');

app.use(cors({origin: true}));
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));


app.use(`${apiSeedUrl}/coupon`, couponRoute);
app.use(`${apiSeedUrl}/user`, userRoute);


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  }); 