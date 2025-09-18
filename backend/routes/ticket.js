import express from "express";
import { authenticate } from "../middlewares/auth";
import { createTicket, getTicket, getTickets } from "../controller/ticket";

const router = express.Router();
router.get("/", authenticate, getTickets);
router.get("/:id", authenticate, getTicket);
router.post("/", authenticate, createTicket);

export default router;
