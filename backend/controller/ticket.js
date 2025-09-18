import inngest from "../inngest/client";
import ticket from "../models/ticket";
import Ticket from "../models/ticket";

export const createTicket = async (req, res, next) => {
  try {
    // ensure user is present (route should normally be protected)
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "title and description are required",
      });
    }

    // If your schema expects ObjectId, pass req.user._id directly.
    const newTicket = await Ticket.create({
      title,
      description,
      createdBy: req.user._id, // or req.user._id.toString() if schema stores a string
    });

    // send event to inngest (using `data` as payload key)
    await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: newTicket._id.toString(),
        title,
        description,
        createdBy: req.user._id.toString(),
      },
    });

    return res.status(201).json({
      message: "Ticket created successfully",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getTickets = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // optional pagination
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.max(
      1,
      Math.min(100, parseInt(req.query.limit || "20", 10))
    );
    const skip = (page - 1) * limit;

    let tickets;
    // if role is something other than plain "user" (eg admin/support), return all
    if (user.role !== "user") {
      tickets = await Ticket.find()
        .populate("assignedTo", ["email", "_id"])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
    } else {
      tickets = await Ticket.find({ createdBy: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
    }

    return res.status(200).json({
      page,
      limit,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getTicket = async (req, res) => {
  try {
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    let ticket;
    if (user.role !== "user") {
      ticket = await Ticket.findById(req.params.id).populate("assignedTo", [
        "email",
        "_id",
      ]);
    } else {
      ticket = await Ticket.findOne({
        createdBy: user._id,
        _id: req.params.id,
      }).select("title description status createdAt");
    }

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    return res.status(200).json({ ticket });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
