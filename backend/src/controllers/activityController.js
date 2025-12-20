import Activity from "../models/Activity.js";
import Course from "../models/Course.js";

export const createActivity = async (req, res) => {
  try {
    const { title, difficulty, description, functionName, testCases, courseId } = req.body;

    // Check if the course actually exists
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Create and save the new activity
    const activity = new Activity({
      title,
      difficulty,
      description,
      functionName,
      testCases,
      course: courseId
    });


    await activity.save();

    // Push activity reference to the course
    await Course.findByIdAndUpdate(courseId, { $push: { activities: activity._id } });

    res.status(201).json({ message: "Activity created successfully", activity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create activity" });
  }
};

// Get all activities for a specific course
export const getActivitiesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const activities = await Activity.find({ course: courseId });

    if (!activities.length) {
      return res.status(404).json({ message: "No activities found for this course" });
    }

    res.status(200).json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch activities" });
  }
};

export const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await Activity.findById(id);
    if (!activity) return res.status(404).json({ message: "Activity not found" });

    res.status(200).json(activity);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch activity" });
  }
};

export const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    const {
      title,
      description,
      functionName,
      difficulty,
      testCases,
    } = req.body;

    if (title !== undefined) activity.title = title;
    if (description !== undefined) activity.description = description;
    if (functionName !== undefined) activity.functionName = functionName;
    if (difficulty !== undefined) activity.difficulty = difficulty;
    if (testCases !== undefined) activity.testCases = testCases;

    await activity.save();

    res.status(200).json({
      message: "Activity updated successfully",
      activity,
    });
  } catch (error) {
    console.error("Update activity error:", error);
    res.status(500).json({ message: "Failed to update activity" });
  }
};



export const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await Activity.findById(id);
    if (!activity) return res.status(404).json({ message: "Activity not found" });

    // Remove reference from course
    await Course.findByIdAndUpdate(activity.course, {
      $pull: { activities: id }
    });

    // Delete actual activity document
    await Activity.findByIdAndDelete(id);

    res.status(200).json({ message: "Activity deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete activity" });
  }
};
