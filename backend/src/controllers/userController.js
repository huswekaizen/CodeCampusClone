import User from "../models/User.js";
import Course from "../models/Course.js";
import bcrypt from "bcrypt";

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

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, firstName, lastName, password: hashedPassword, age, role, address });

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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
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
      .select("username firstName lastName address role createdAt createdCourses");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user with courses:", error);
    res.status(500).json({ message: "Error fetching user data" });
  }
};

export const getUserCourseProgress = async (req, res) => {
  try {
    const { id, courseId } = req.params;

    const user = await User.findById(id).select("courseProgress");
    if (!user) return res.status(404).json({ message: "User not found" });

    const progress = user.courseProgress.find(
      p => p.course.toString() === courseId
    );

    res.status(200).json({
      completedActivities: progress ? progress.completedActivities : [],
      points: progress ? progress.points : 0
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch progress" });
  }
};

export const editUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, firstName, lastName, address } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (username) user.username = username;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (address) user.address = address;

    await user.save();
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

export const editUserSecurity = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update password" });
  }
};