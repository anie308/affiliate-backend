const express = require("express");
require("dotenv").config();
require("./db");
const morgan = require("morgan");
const port = process.env.PORT || 3000;
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const apiSeedUrl = "/api/v1";

const adminRoute = require("./routes/admin.routes");
const couponRoute = require("./routes/coupon.routes");
const withdrawRoute = require("./routes/withdrawal.routes");
const userRoute = require("./routes/user.routes");
const notificationRoute = require("./routes/notification.routes");
const vtuRoute = require("./routes/vtu.routes");
const trendRoute = require("./routes/trend.routes");
const vendorRoute = require("./routes/vendor.routes");

app.use(cors({ origin: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  const allowedOrigins = [
    "https://www.lidenty.com",
    "http://localhost:5173",
    // Add more allowed origins as needed
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.use(`${apiSeedUrl}/coupons`, couponRoute);
app.use(`${apiSeedUrl}/vendors`, vendorRoute);
app.use(`${apiSeedUrl}/withdrawals`, withdrawRoute);
app.use(`${apiSeedUrl}/users`, userRoute);
app.use(`${apiSeedUrl}/admin`, adminRoute);
app.use(`${apiSeedUrl}/vtu`, vtuRoute);
app.use(`${apiSeedUrl}/trends`, trendRoute);
app.use(`${apiSeedUrl}/notifications`, notificationRoute);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
