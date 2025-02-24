var express = require("express");
var router = express.Router();
const Event = require("../models/Event"); // Ensure Event model is imported
require("dotenv").config(); // Load environment variables
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/authMiddleware');

//  GET all events

router.get('/', authMiddleware, async function (req, res) {
    try {
        const { page, limit, search } = req.query;

        // Create a query object for search
        const query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } }, // Case-insensitive search by title
                { location: { $regex: search, $options: 'i' } }, // Case-insensitive search by location
            ];
        }

        // If no pagination parameters are provided, fetch all events in reverse order
        if (!page && !limit) {
            const events = await Event.find(query).sort({ _id: -1 }); // Reverse order
            console.log(events);
            return res.status(200).json({ events });
        }

        // Fetch paginated events in reverse order
        const pageNumber = Number(page) || 1;
        const limitNumber = Number(limit) || 10;
        const events = await Event.find(query)
            .sort({ _id: -1 }) // Reverse order
            .skip((pageNumber - 1) * limitNumber) // Skip documents for pagination
            .limit(limitNumber); // Limit the number of documents per page

        // Get the total number of events for pagination
        const totalEvents = await Event.countDocuments(query);

        // Calculate total pages
        const totalPages = Math.ceil(totalEvents / limitNumber);

        res.status(200).json({
            events,
            totalPages,
            currentPage: pageNumber,
        });
    } catch (err) {
        console.error('Error fetching events:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});



// Register for an event
router.post('/:eventId/register', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.userId; //67bb8d496f13afae01c98cd3
        const user = req.user; // { userId: '67bb8d496f13afae01c98cd3', iat: 1633660137, exp: 1633746537 }
        console.log(user)
        const event = await Event.findById(eventId).populate('registeredUsers', 'name email');
        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        // Check if the user is already registered
        if (event.registeredUsers.some(user => user._id.toString() === userId.toString())) {
            return res.status(400).json({ message: 'You are already registered for this event.' });
        }

        console.log(event.registeredUsers.length, event.maxParticipants)


        // Add the user to the registeredUsers array
        event.registeredUsers.push(userId);
        await event.save();

        // Refetch event with updated user details
        const updatedEvent = await Event.findById(eventId).populate('registeredUsers', 'name email');

        res.status(200).json({
            message: 'Successfully registered for the event.',
            event: updatedEvent,
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (error) {
        console.error('Error registering for event:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Fetch registered users for an event
router.get('/:eventId/registered-users', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;

        const event = await Event.findById(eventId).populate('registeredUsers', 'name email');
        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        res.status(200).json({ users: event.registeredUsers || [] });
    } catch (error) {
        console.error('Error fetching registered users:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

//  CREATE a new event
router.post("/create", authMiddleware, async function (req, res) {
    try {
        const { title, date, location, description, createdBy, maxParticipants } = req.body;
        console.log(req.body)


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
            registeredUsers: []
        });

        await newEvent.save();
        res.status(201).json({ message: "Event Created Successfully", event: newEvent });
    } catch (err) {
        console.error("Error creating event:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

//  DELETE an event by ID
router.delete("/:id", authMiddleware, async function (req, res) {
    try {
        const { id } = req.params;

        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        await Event.findByIdAndDelete(id); //  Delete event from DB
        res.status(200).json({ message: "Event Deleted Successfully" });
    } catch (err) {
        console.error("Error deleting event:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

//  UPDATE an event by ID
router.patch("/:id", async function (req, res) {
    try {
        const { id } = req.params;
        const { title, date, location, description, maxParticipants } = req.body;

        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            { title, date, location, description, maxParticipants },
            { new: true, runValidators: true } //  Return updated event and validate fields
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
