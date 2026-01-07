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
    const userId = req.user._id;

    // 1. Find the activity
    const activity = await Activity.findById(activityId);
    if (!activity) return res.status(404).json({ message: "Activity not found" });

    // 2. Try to update user's progress atomically
    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        "courseProgress.course": activity.course,
        "courseProgress.completedActivities": { $ne: activity._id } // make sure not already completed
      },
      {
        $inc: { "courseProgress.$.points": activity.points },
        $addToSet: { "courseProgress.$.completedActivities": activity._id }
      },
      { new: true } // return the updated document
    );

    // 3. If user is null, either they didn't join the course or already completed
    if (!user) {
      const existingUser = await User.findById(userId);
      const progress = existingUser.courseProgress.find(
        p => p.course.toString() === activity.course.toString()
      );

      if (!progress) return res.status(400).json({ message: "User has not joined this course yet" });

      const alreadyCompleted = progress.completedActivities.some(a => a.toString() === activityId);
      if (alreadyCompleted) {
        return res.status(200).json({ message: "Activity already submitted", points: progress.points });
      }

      // Fallback in case something else went wrong
      return res.status(500).json({ message: "Failed to submit activity" });
    }

    // 4. Return success
    const progress = user.courseProgress.find(p => p.course.toString() === activity.course.toString());
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