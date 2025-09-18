// index.js
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { serve } from "inngest/express";
import inngest from "./inngest/client.js";
import { onUserSignup } from "./inngest/functions/on-signup.js";
import { onTicketCreated } from "./inngest/functions/on-ticket-create.js";

// ---routes--
import userRoutes from "./routes/user.js";
import ticketRoutes from "./routes/ticket.js";

dotenv.config();

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/myapp";

const app = express();

// --------------- Middlewares ----------------
app.use(helmet()); // basic security headers
app.use(cors()); // adjust options in production
app.use(express.json()); // parse JSON bodies
app.use(express.urlencoded({ extended: true })); // parse urlencoded bodies
app.use(morgan("dev")); // request logging

// --------------- Healthcheck ----------------
app.get("/health", (req, res) =>
  res.json({ status: "ok", timestamp: Date.now() })
);

//--------- inggest --------
app.use(
  "api/inngest",
  serve({
    client: inngest,
    functions: [onUserSignup, onTicketCreated],
  })
);
// --------------- Auth routes -----------------
// POST /auth/login  -> returns { user, token }
app.use("/api/auth", userRoutes);
app.use("/api/ticket", ticketRoutes);
app.use("/inggest", severe);

//--------- 404 handler -----------------
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// --------------- Global error handler --------
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    details: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// --------------- Start server & DB -----------
const start = async () => {
  try {
    // connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // graceful shutdown
    const shutdown = async () => {
      console.log("Shutting down...");
      await mongoose.disconnect();
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to start app:", error);
    process.exit(1);
  }
};

start();
