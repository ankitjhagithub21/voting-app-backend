require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDb = require('./db');
const userRouter = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Connect to database
connectDb();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "*",
  methods:['POST','GET','PUT','DELETE'],
  credentials: true
}));

// Routes
app.use("/api/auth", userRouter);
app.use("/api/admin", adminRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
