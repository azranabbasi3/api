const sequelize = require('./config/db');
const path = require('path');
const express = require("express");
const cors = require("cors");
const userRouter = require("./routes/user");
const fs = require('fs');

const PORT = process.env.PORT || 5000;

const app = express();

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

sequelize
  .authenticate()
  .then(() => {
  })
  .catch((err) => {
  });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/api/user", userRouter);

app.listen(PORT, () => {
});

