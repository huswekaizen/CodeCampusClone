import Activity from "../models/Activity.js";
import Course from "../models/Course.js";
import User from "../models/User.js";

export const createActivity = async (req, res) => {
  try {
    const { title, difficulty, description, points, sampleTests, validationTests, courseId } = req.body;

    // Check if the course actually exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const activity = new Activity({
      title,
      difficulty,
      description,
      points,
      sampleTests,
      validationTests,
      course: courseId
    });

    await activity.save();

    await Course.findByIdAndUpdate(courseId, {
      $push: { activities: activity._id }
    });

    res.status(201).json({
      message: "Activity created successfully",
      activity
    });
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
      difficulty,
      points,
      sampleTests,
      validationTests,
    } = req.body;

    if (title !== undefined) activity.title = title;
    if (description !== undefined) activity.description = description;
    if (difficulty !== undefined) activity.difficulty = difficulty;
    if (points !== undefined) activity.points = points;
    if (sampleTests !== undefined) activity.sampleTests = sampleTests;
    if (validationTests !== undefined) activity.validationTests = validationTests;

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

export const submitActivity = async (req, res) => {
  try {
    const { id: activityId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID missing" });
    }

    // 1️⃣ Find the activity
    const activity = await Activity.findById(activityId);
    if (!activity) return res.status(404).json({ message: "Activity not found" });

    // 2️⃣ Find the user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 3️⃣ Find or create courseProgress for this course
    let progress = user.courseProgress.find(
      p => p.course.toString() === activity.course.toString()
    );

    if (!progress) {
      // Lazy-create it if missing
      progress = { course: activity.course, points: 0, completedActivities: [] };
      user.courseProgress.push(progress);
    }

    // 4️⃣ Check if activity already completed
    if (progress.completedActivities.some(a => a.toString() === activity._id.toString())) {
      await user.save(); // in case we just created progress
      return res.status(409).json({
        message: "Activity already completed and submitted, no points awarded",
        totalPoints: progress.points,
        completedActivities: progress.completedActivities
      });
    }

    // 5️⃣ Add points and mark activity as completed
    progress.points += activity.points;
    progress.completedActivities.push(activity._id);

    await user.save();

    res.status(200).json({
      message: "Activity submitted successfully",
      totalPoints: progress.points,
      completedActivities: progress.completedActivities
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit activity" });
  }
};
