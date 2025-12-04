import User from "../models/User.js";
import Course from "../models/Course.js";

export const registerUser = async (req, res) => {
  try {
    const { username, firstName, lastName, password, age, role, address } = req.body;
    if (!username || !firstName || !lastName || !password || !age || !role || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ username, firstName, lastName, password, age, role, address });
    await user.save();
    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Send role (and maybe name) back to frontend
    res.status(200).json({
      message: "Login successful",

       user: {
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });


  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserWithCourses = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate({
        path: "createdCourses",
        populate: {
          path: "activities",
          model: "Activity",
          select: "title description type outputExample" // optional: pick fields
        },
        select: "title category description example thumbnail" // optional
      })
      .select("username firstName lastName createdCourses");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user with courses:", error);
    res.status(500).json({ message: "Error fetching user data" });
  }
};
