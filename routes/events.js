var express = require("express");
var router = express.Router();
const Event = require("../models/Event"); // Ensure Event model is imported
require("dotenv").config(); // Load environment variables

// ✅ GET all events
router.get("/", async function (req, res) {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (err) {
        console.error("Error fetching events:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// ✅ CREATE a new event
router.post("/create", async function (req, res) {
    try {
        const { title, date, location, description, createdBy, maxParticipants } = req.body;

        if (!title || !date || !location || !createdBy || !maxParticipants) {
            return res.status(400).json({ message: "All fields (title, date, location, createdBy, maxParticipants) are required." });
        }

        const newEvent = new Event({
            title,
            date,
            location,
            description,
            createdBy,
            maxParticipants,
            registeredUsers: [] // Initialize empty array
        });

        await newEvent.save();
        res.status(201).json({ message: "Event Created Successfully", event: newEvent });
    } catch (err) {
        console.error("Error creating event:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// ✅ DELETE an event by ID
router.delete("/:id", async function (req, res) {
    try {
        const { id } = req.params;

        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        await Event.findByIdAndDelete(id); // ✅ Delete event from DB
        res.status(200).json({ message: "Event Deleted Successfully" });
    } catch (err) {
        console.error("Error deleting event:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// ✅ UPDATE an event by ID
router.patch("/:id", async function (req, res) {
    try {
        const { id } = req.params;
        const { title, date, location, description, maxParticipants } = req.body;

        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            { title, date, location, description, maxParticipants },
            { new: true, runValidators: true } // ✅ Return updated event and validate fields
        );

        if (!updatedEvent) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.status(200).json({ message: "Event Updated Successfully", event: updatedEvent });
    } catch (err) {
        console.error("Error updating event:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

module.exports = router;
