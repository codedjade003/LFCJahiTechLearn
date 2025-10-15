// routes/support.js
import express from "express";
import SupportTicket from "../models/SupportTicket.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create new support ticket (Students/Users)
router.post("/", protect, async (req, res) => {
  try {
    const { title, description, category, priority, courseId } = req.body;

    const ticket = new SupportTicket({
      title,
      description,
      category,
      priority,
      courseId,
      createdBy: req.user._id,
    });

    await ticket.save();
    await ticket.populate("createdBy", "name email");

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({
      message: "Error creating support ticket",
      error: error.message,
    });
  }
});

// Get user's tickets
router.get("/my-tickets", protect, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ createdBy: req.user._id })
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching tickets",
      error: error.message,
    });
  }
});

// Get all tickets (Admin)
router.get("/admin/tickets", protect, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status, category, priority } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const tickets = await SupportTicket.find(filter)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching tickets",
      error: error.message,
    });
  }
});

// Get single ticket
router.get("/:ticketId", protect, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.ticketId)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("messages.user", "name email role");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (
      !req.user.isAdmin &&
      ticket.createdBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching ticket",
      error: error.message,
    });
  }
});

// Add message to ticket
router.post("/:ticketId/messages", protect, async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await SupportTicket.findById(req.params.ticketId);

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (
      !req.user.isAdmin &&
      ticket.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    ticket.messages.push({ user: req.user._id, message });
    ticket.updatedAt = new Date();

    await ticket.save();
    await ticket.populate("messages.user", "name email role");

    const newMessage = ticket.messages[ticket.messages.length - 1];
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({
      message: "Error adding message",
      error: error.message,
    });
  }
});

// Update ticket status
router.put("/:ticketId/status", protect, async (req, res) => {
  try {
    if (!req.user.isAdmin)
      return res.status(403).json({ message: "Access denied" });

    const { status } = req.body;
    const ticket = await SupportTicket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.status = status;
    ticket.updatedAt = new Date();
    if (["resolved", "closed"].includes(status)) {
      ticket.resolvedAt = new Date();
    }

    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(500).json({
      message: "Error updating ticket",
      error: error.message,
    });
  }
});

// Assign ticket to admin
router.put("/:ticketId/assign", protect, async (req, res) => {
  try {
    if (!req.user.isAdmin)
      return res.status(403).json({ message: "Access denied" });

    const ticket = await SupportTicket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.assignedTo = req.user._id;
    ticket.status = "in-progress";
    ticket.updatedAt = new Date();

    await ticket.save();
    await ticket.populate("assignedTo", "name email");

    res.json(ticket);
  } catch (error) {
    res.status(500).json({
      message: "Error assigning ticket",
      error: error.message,
    });
  }
});

export default router;
