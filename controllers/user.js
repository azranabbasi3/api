const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { Op } = require("sequelize"); 

dotenv.config();

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
        field: "email",
      });
    }
    const newPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: newPassword,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.status(200).json({
      success: true,
      data: user,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging in user",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.destroy();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting user",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { email, bio, headline, interests, name } = req.body;
    const user = await User.findOne({ where: { email } });
    const photo = req.file ? req.file.path : null;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.update({
      name,
      bio,
      headline,
      photo,
      interests,
    });

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating user",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting user",
    });
  }
};

const getAllProfiles = async (req, res) => {
  try {
    const currentUserEmail = req.user?.email;
    if (!currentUserEmail) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated"
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const users = await User.findAll({
      where: {
        email: {
          [Op.ne]: currentUserEmail
        }
      },
      attributes: ['id', 'name', 'email', 'bio', 'headline', 'photo', 'interests'],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No users found",
        data: []
      });
    }

    const formattedUsers = users.map(user => {
      const userData = user.toJSON();
      if (userData.photo) {
        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
        userData.photo = `${baseUrl}/${userData.photo.replace(/\\/g, "/")}`;
      }
      return userData;
    });

    res.status(200).json({
      success: true,
      data: formattedUsers
    });
  } catch (error) {
    console.error('Error in getAllProfiles:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching profiles",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  register,
  login,
  deleteUser,
  updateProfile,
  getProfile,
  getAllProfiles
};
