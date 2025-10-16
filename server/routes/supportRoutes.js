import express from "express";
import SupportTicket from "../models/SupportTicket.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdminOnly } from "../middleware/isAdminOnly.js";
import { createNotificationForUser } from "../services/notificationService.js";

const router = express.Router();

// Helper function to check admin status
const isAdminUser = (req) => {
  return req.user.id.toString() === process.env.ADMIN_ID || 
         req.user.role === "admin-only" || 
         req.user.role === "admin";
};

// Create new support ticket (Students AND Admins)
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

        // Create notification for student
    await createNotificationForUser({
      userId: req.user._id,
      title: "Support Ticket Created",
      message: `Your support ticket "${title}" has been created and is now open.`,
      type: "support",
      link: `/dashboard/support`
    });


    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({
      message: "Error creating support ticket",
      error: error.message,
    });
  }
});

// Get user's tickets (Students see their own, Admins see all)
router.get("/my-tickets", protect, async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    let filter = { createdBy: req.user._id }; // Students only see their tickets
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const tickets = await SupportTicket.find(filter)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("messages.user", "name email role")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching tickets",
      error: error.message,
    });
  }
});

// Get all tickets (Admin - with filters)
router.get("/admin/tickets", protect, isAdminOnly, async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const tickets = await SupportTicket.find(filter)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("messages.user", "name email role")
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

    // Allow access if user is admin OR created the ticket
    if (!isAdminUser(req) && ticket.createdBy._id.toString() !== req.user._id.toString()) {
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

    // Allow messaging if user is admin OR created the ticket
    if (!isAdminUser(req) && ticket.createdBy.toString() !== req.user._id.toString()) {
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

// Update ticket status (Admin only)
router.put("/:ticketId/status", protect, isAdminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await SupportTicket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.status = status;
    ticket.updatedAt = new Date();
    if (["resolved", "closed"].includes(status)) {
      ticket.resolvedAt = new Date();
    }

    await ticket.save();
    // Create notification for student about status change
    if (oldStatus !== status) {
      await createNotificationForUser({
        userId: ticket.createdBy._id,
        title: "Ticket Status Updated",
        message: `Your support ticket "${ticket.title}" has been ${status === 'in-progress' ? 'assigned and is now in progress' : `marked as ${status}`}.`,
        type: "support",
        link: `/dashboard/support`
      });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({
      message: "Error updating ticket",
      error: error.message,
    });
  }
});

// Assign ticket to admin (Admin only)
router.put("/:ticketId/assign", protect, isAdminOnly, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.assignedTo = req.user._id;
    ticket.status = "in-progress";
    ticket.updatedAt = new Date();

    await ticket.save();
    await ticket.populate("assignedTo", "name email");

    // Create notification for student
    await createNotificationForUser({
      userId: ticket.createdBy._id,
      title: "Support Agent Assigned",
      message: `Your ticket "${ticket.title}" has been assigned to ${req.user.name} and is now in progress.`,
      type: "support",
      link: `/dashboard/support`
    });


    res.json(ticket);
  } catch (error) {
    res.status(500).json({
      message: "Error assigning ticket",
      error: error.message,
    });
  }
});

export default router;