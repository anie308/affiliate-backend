const express = require('express');
require('dotenv').config();
require('./db');
const morgan = require('morgan');
const port = process.env.PORT || 3000;
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const apiSeedUrl = '/api/v1';

const adminRoute = require('./routes/admin.routes');
const couponRoute = require('./routes/coupon.routes');
const withdrawRoute = require('./routes/withdrawal.routes');
const userRoute = require('./routes/user.routes');
const notificationRoute = require('./routes/notification.routes');

app.use(cors({ origin: true}))
app.use(bodyParser.json());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));


app.use(`${apiSeedUrl}/coupon`, couponRoute);
app.use(`${apiSeedUrl}/withdrawal`, withdrawRoute);
app.use(`${apiSeedUrl}/user`, userRoute);
app.use(`${apiSeedUrl}/admin`, adminRoute);
app.use(`${apiSeedUrl}/notification`, notificationRoute);


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  }); 