import bcrypt from "bcrypt";
import User from "../models/user";
import jwt from "jsonwebtoken";
import inngest from "../inngest/client";

/**
 * Signup
 */
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

/**
 * Login
 */
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
