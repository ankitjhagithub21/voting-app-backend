const express = require('express');
const verifyToken = require('../middlewares/verifyToken');
const User = require('../models/user');
const Candidate = require('../models/candidate');

const adminRoutes = express.Router();

adminRoutes.post("/add", verifyToken, async (req, res) => {
    const { name, party, age } = req.body;

    if (!name || !party || !age) {
        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Only admin users can perform this action."
            });
        }

        const newCandidate = new Candidate({ name, party, age });
        const candidate = await newCandidate.save();

        return res.status(200).json({
            success: true,
            message: "Candidate added.",
            candidate
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

adminRoutes.put("/update/:candidateId", verifyToken, async (req, res) => {
    const { name, party, age } = req.body;
    const { candidateId } = req.params;

    if (!name || !party || !age) {
        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Only admin users can perform this action."
            });
        }

        const updatedCandidate = await Candidate.findByIdAndUpdate(candidateId, { name, party, age }, { new: true });

        if (!updatedCandidate) {
            return res.status(404).json({
                success: false,
                message: "Candidate not found."
            });
        }

        return res.status(200).json({
            success: true,
            candidate: updatedCandidate
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

adminRoutes.delete("/delete/:candidateId", verifyToken, async (req, res) => {
    const { candidateId } = req.params;

    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Only admin users can perform this action."
            });
        }

        const deletedCandidate = await Candidate.findByIdAndDelete(candidateId);

        if (!deletedCandidate) {
            return res.status(404).json({
                success: false,
                message: "Candidate not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Candidate deleted."
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = adminRoutes;
