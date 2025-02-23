var express = require("express");
var router = express.Router();
const User = require("../models/User"); // Ensure User model is imported
require("dotenv").config(); // Load environment variables

/* GET users listing. */
router.get("/", async function (req, res) {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error " + err);
  }
});

/* ✅ REGISTER ROUTE */
router.post("/register", async function (req, res) {
  try {
    const { name, email, password } = req.body;

    // ✅ Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields (name, email, password) are required" });
    }

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Create new user
    const newUser = new User({ name, email, password });

    // ✅ Save to database
    await newUser.save();

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


/* ✅ LOGIN ROUTE (No Encryption) */
router.post("/login", async function (req, res) {
  try {
    const { email, password } = req.body;

    // ✅ Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // ✅ Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ✅ Compare passwords
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ✅ Send success response
    res.status(200).json({ message: "Login Successful", user });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


/* ✅ DELETE USER */
router.delete("/:id", async function (req, res) {
  try {
    const { id } = req.params;

    // Check if user exists before attempting to delete
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


/* ✅ UPDATE USER */
router.patch("/:id", async function (req, res) {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare update data
    let updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = password; // Ensure password hashing is done in the model

    // Update user
    await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


module.exports = router;
