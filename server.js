const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Connect to database
connectDB();

// Route files
const rooms = require("./routes/rooms");
const auth = require("./routes/auth");
const reservations = require("./routes/reservations");
const items = require("./routes/items");
const librarys = require("./routes/librarys");

const app = express();

// Body parser
app.use(express.json());

//Rate Limiting
const limiter = rateLimit({
  windowsMs: 10 * 60 * 1000, //10 mins
  max: 10000,
});
app.use(limiter);

//Sanitize data
app.use(mongoSanitize());

//Set security headers
app.use(helmet());

//Prevent XSS attacks
app.use(xss());

//Enable CORS
app.use(cors());

//Prevent http param pollutions
app.use(hpp());

// Cookie parser
app.use(cookieParser());

app.use("/api/rooms", rooms);
app.use("/api/auth", auth);
app.use("/api/reservations", reservations);
app.use("/api/items", items);
app.use("/api/librarys", librarys);


const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(`Server runing in`, process.env.NODE_ENV, "on " + process.env.HOST + ":" + PORT)
);

// Handle unhandle promise rejections
process.on(`unhandledRejection`, (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Colse server & exit process
  server.close(() => process.exit(1));
});
