const express = require('express');
const User = require('../models/user');
const userRouter = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middlewares/verifyToken');
const Candidate = require('../models/candidate');

// authRoutes
userRouter.post("/register", async (req, res) => {
    const { name, age, ano, password } = req.body;
    try {
        const user = await User.findOne({ ano });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "Aadhar Number already registered."
            });
        }
        const securePassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            age,
            ano,
            password: securePassword
        });
        await newUser.save();
        return res.status(201).json({
            success: true,
            message: "Registration Successful."
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

userRouter.post("/login", async (req, res) => {
    const { ano, password } = req.body;
    try {
        const user = await User.findOne({ ano });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }
        const comparePassword = await bcrypt.compare(password, user.password);
        if (!comparePassword) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password."
            });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: true
        });
        return res.status(200).json({
            success: true,
            message: "Login Successful."
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

userRouter.get("/user", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }
        return res.status(200).json({
            success: true,
            message: "User found.",
            user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

userRouter.get("/logout", async (req, res) => {
    try {
        res.clearCookie('jwt');
        return res.status(200).json({
            success: true,
            message: "Logout Successful"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// vote routes
userRouter.get("/candidates", async (req, res) => {
    try {
        const candidates = await Candidate.find();
        if (!candidates.length) {
            return res.status(404).json({
                success: false,
                message: "No candidates found."
            });
        }
        return res.status(200).json({
            success: true,
            candidates
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

userRouter.post("/vote/:id", verifyToken, async (req, res) => {
    const id = req.params.id;
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }
        if (user.isVoted) {
            return res.status(400).json({
                success: false,
                message: "Already voted."
            });
        }
        if (user.role === 'admin') {
            return res.status(400).json({
                success: false,
                message: "Admins cannot vote."
            });
        }
        const candidate = await Candidate.findById(id);
        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: "Candidate not found."
            });
        }
        candidate.votes.push({ user: userId });
        candidate.voteCount++;
        await candidate.save();
        user.isVoted = true;
        user.forVoted = candidate.party;
        await user.save();
        return res.status(200).json({
            success: true,
            message: "Vote recorded."
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = userRouter;
