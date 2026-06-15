require('dotenv').config();
const express = require('express');
const timetableRoutes = require("./src/routes/timetableRoutes");
const resultRoutes = require("./src/routes/resultRoutes");
const authRoutes = require('./src/routes/auth');
const resourceRoutes = require("./src/routes/resourceRoutes");
const aiRoutes = require("./src/routes/aiRoutes")

const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'UniFlow API is running' });
});

// Import Routes

app.use('/api/auth', authRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/resources",resourceRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
