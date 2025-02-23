const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Event creator
    registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users registered
    maxParticipants: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Event", EventSchema);
