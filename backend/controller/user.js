import bcrypt from "bcrypt";
import User from "../models/user";
import jwt from "jsonwebtoken";
import inngest from "../inngest/client";

export const signup = async (req, res) => {
  try {
    // step 1 : getting the data from the request
    const { name, email, password, skills = [] } = req.body;

    // basic validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "name, email and password are required" });
    }

    // step 2 : checking if the user already exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    // step 3 : hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // step 4 : creating the user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      skills,
    });

    // prepare user object to return (remove sensitive fields)
    const userToReturn = newUser.toObject ? newUser.toObject() : { ...newUser };
    delete userToReturn.password;

    // step 5 : trigger the inngest event (fire-and-forget)
    (async () => {
      try {
        // check your Inngest client API — many libs use sendEvent or send
        // I'm calling send() as in your original code. If your client uses sendEvent, change accordingly.
        await inngest.send?.({
          name: "user/signUp",
          data: { email: newUser.email },
        });
      } catch (err) {
        // don't block signup for background-work failure — just log it
        console.error("Inngest event failed:", err?.message || err);
      }
    })();

    // step 6 : generating the token
    if (!process.env.JWT_SECRET) {
      console.warn("JWT_SECRET is not set. Tokens will not be secure.");
    }

    const token = jwt.sign(
      { _id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "1h" }
    );

    // step 7 : sending the response
    return res.status(201).json({ user: userToReturn, token });
  } catch (error) {
    console.error("signup error:", error);
    return res
      .status(500)
      .json({ error: "Signup failed", details: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    // remove password from returned user
    const userToReturn = user.toObject ? user.toObject() : { ...user };
    delete userToReturn.password;

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "1h" }
    );

    return res.status(200).json({ user: userToReturn, token });
  } catch (error) {
    console.error("login error:", error);
    return res
      .status(500)
      .json({ error: "Login failed", details: error.message });
  }
};

export const logout = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized token" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // If you want real logout, you'd add token to blacklist here
      res.json({ message: "Logout Successful" });
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Server error", details: error.message });
  }
};

export const updateUser = async (req, res, next) => {
  try {
    // 1) ensure authentication middleware ran
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 2) only admins allowed
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    // 3) sanitize inputs
    const { email: rawEmail, skills, name, role } = req.body;
    if (!rawEmail) {
      return res.status(400).json({ error: "email is required" });
    }
    const email = String(rawEmail).trim().toLowerCase();

    // 4) find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 5) build update object carefully
    const update = {};
    if (typeof name === "string" && name.trim().length)
      update.name = name.trim();

    // If you want "empty array should clear skills", allow empty array.
    // If you want empty -> keep existing, use: (Array.isArray(skills) && skills.length)
    if (Array.isArray(skills)) {
      update.skills = skills; // will set to [] if frontend explicitly sends []
    }

    // preserve existing role if role not provided
    if (typeof role === "string" && role.trim().length) {
      update.role = role.trim();
    }

    // if update object is empty, nothing to change
    if (Object.keys(update).length === 0) {
      return res
        .status(400)
        .json({ error: "No valid fields provided to update" });
    }

    // 6) perform update and return the updated user
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: update },
      { new: true, runValidators: true, context: "query" }
    ).select("-password"); // hide password

    return res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Update Failed", details: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const users = await User.find().select("-password"); // exclude password
    return res.json(users);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Fetch Failed", details: error.message });
  }
};
