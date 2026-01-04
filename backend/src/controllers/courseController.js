import Course from "../models/Course.js";
console.log("Course import check:", Course);

import User from "../models/User.js";
import Activity from "../models/Activity.js";
import mongoose from "mongoose";

/*export const createCourse = async (req, res) => {
  try {
    const { title, subTitle, category, description, example, instructorId } = req.body;

    if (!instructorId) return res.status(400).json({ message: "Missing instructorId" });

    // thumbnail: use file path from multer if present
    // store as relative URL path so frontend can fetch: /uploads/filename.jpg
    const thumbnail = req.file ? `/uploads/${req.file.filename}` : null;

    const course = new Course({
      title,
      subTitle,
      category,
      description,
      example,
      thumbnail,
      instructor: instructorId
    });

    const savedCourse = await course.save();

    await User.findByIdAndUpdate(instructorId, { $push: { createdCourses: savedCourse._id } });

    res.status(201).json(savedCourse);
  } catch (error) {
    console.error("Error in createCourse:", error);
    res.status(500).json({ message: "Error creating course", error: error.message });
  }
};*/

export const createCourseWithActivities = async (req, res) => {
  try {
    // Course data
    let course = req.body.course;
    let activities = req.body.activities;

    // If FormData strings, parse them
    if (course && typeof course === "string") course = JSON.parse(course);
    if (activities && typeof activities === "string") activities = JSON.parse(activities);

    if (!course) return res.status(400).json({ error: "Missing course data" });
    activities = activities || []; // <-- make sure it's always an array

    const {
      title, subTitle, category, description, example, instructorId
    } = course;

    if (!instructorId) return res.status(400).json({ error: "Missing instructorId" });

    // Handle thumbnail
    const thumbnail = req.file ? `/uploads/${req.file.filename}` : course.thumbnail || null;

    // Create course
    const createdCourse = await Course.create({
      title, subTitle, category, description, example, thumbnail, instructor: instructorId
    });

    // Create activities if any
    if (activities.length > 0) {
      const activitiesWithCourse = activities.map(a => ({
        ...a,
        course: createdCourse._id
      }));
      const createdActivities = await Activity.insertMany(activitiesWithCourse);
      createdCourse.activities.push(...createdActivities.map(a => a._id));
      await createdCourse.save();
    }

    // Link course to instructor
    await User.findByIdAndUpdate(instructorId, { $push: { createdCourses: createdCourse._id } });

    res.status(201).json(createdCourse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


export const getCourseWithActivities = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate({
        path: "activities",
        model: "Activity",
        select: "title description difficulty testCases"
      })
      .populate({
        path: "instructor",       // <-- populate instructor
        model: "User",
        select: "firstName lastName"
      })
      .select("title subTitle category description thumbnail example activities courseCode")
      .lean();

    if (!course) return res.status(404).json({ message: "Course not found" });

    res.status(200).json(course);
  } catch (error) {
    console.error("Error fetching course with activities:", error);
    res.status(500).json({ message: "Error fetching course" });
  }
};

// GET /api/instructors/:id/published-courses
export const getPublishedCourses = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Instructor ID required" });
    }

    // Find instructor and their course references
    const instructor = await User.findById(id).populate({
      path: "createdCourses",
      select: "title subTitle category description example thumbnail"
    });


    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    const publishedCourses = instructor.createdCourses || [];
    const count = publishedCourses.length;

    res.status(200).json({ count, courses: publishedCourses });
  } catch (error) {
    console.error("Error fetching published courses:", error);
    res.status(500).json({ message: "Error fetching published courses" });
  }
};

export const editCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subTitle, category, description, thumbnail, example } = req.body; 

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    course.title = title || course.title;
    course.category = category || course.category;
    course.subTitle = subTitle || course.subTitle;
    course.description = description || course.description;
    course.example = example || course.example;

    if(req.file) {
      course.thumbnail = `/uploads/${req.file.filename}`;
    }

    const updatedCourse = await course.save();

    res.status(200).json({
      message: "Course updated successfully.",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Delete all activities
    await Activity.deleteMany({ _id: { $in: course.activities } });

    // Remove course ID from the instructor's createdCourses array
    await User.findByIdAndUpdate(course.instructor, { 
      $pull: { createdCourses: course._id } 
    });

    // Remove course ID from students' enrolledCourses arrays
    await User.updateMany(
      { enrolledCourses: course._id },
      { $pull: { enrolledCourses: course._id } }
    );

    // Finally delete the course
    await Course.findByIdAndDelete(id);

    res.status(200).json({
      message: "Course, activities, and references deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({
      message: "Server error. Please try again later."
    });
  }
};



export const joinCourse = async (req, res) => {
  console.log("joinCourse hit with body:", req.body);
  console.log("JOIN CONTROLLER REACHED");

  try {
    const { courseCode, studentId } = req.body;
    if (!courseCode || !studentId) return res.status(400).json({ message: "courseCode and studentId are required" });

    const course = await Course.findOne({ courseCode });
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.students.includes(studentId)) return res.status(400).json({ message: "Already enrolled" });

    // add student
    course.students.push(studentId);
    await course.save();

    // add course to student
    await User.findByIdAndUpdate(studentId, { $addToSet: { enrolledCourses: course._id } });

    return res.status(200).json({ message: "Joined successfully", courseId: course._id });

  } catch (err) {
    console.error("Error joining course:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getEnrolledCourses = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "User ID required" });
    }

    // Find user and their course references
    const user = await User.findById(id).populate({
      path: "enrolledCourses",
      select: "title subTitle category description example instructor thumbnail",
      populate: {
        path: "instructor",
        model: "User",
        select: "firstName lastName"
      }
    }); 


    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const enrolledCourses = user.enrolledCourses || [];
    const count = enrolledCourses.length;

    res.status(200).json({ count, courses: enrolledCourses });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    res.status(500).json({ message: "Error fetching enrolled courses" });
  }
};  

export const leaveCourse = async (req, res) => {
  try {
    const { id } = req.params; // course ID
    const { studentId } = req.body; // student ID

    if (!id || !studentId) return res.status(400).json({ message: "course id and student id are required" });

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (!course.students.some(s => s.toString() === studentId)) {
      return res.status(400).json({ message: "Not enrolled" });
    }


    // remove student
    course.students.pull(studentId);
    await course.save();

    // remove course from student
    await User.findByIdAndUpdate(studentId, { $pull: { enrolledCourses: course._id } });

    return res.status(200).json({ message: "Left course successfully" });
  } catch (err) {
    console.error("Error leaving course:", err);
    return res.status(500).json({ message: "Server error" });
  }
};