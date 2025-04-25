const express = require("express");
const { register, login, deleteUser, updateProfile, getProfile, getAllProfiles } = require("../controllers/user");
const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/fileUpload");
const userRouter = express.Router();

const { Op } = require('sequelize');

userRouter.get('/getAllProfiles', authMiddleware, getAllProfiles);

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.delete("/deleteProfile/:email", authMiddleware, deleteUser);
userRouter.put("/updateProfile", authMiddleware, upload.single('photo'), updateProfile);
userRouter.get("/getProfile/:email", authMiddleware, getProfile);

module.exports = userRouter;
