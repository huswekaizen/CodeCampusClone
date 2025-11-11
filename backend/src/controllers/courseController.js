import Course from "../models/Course.js";
console.log("Course import check:", Course);

import User from "../models/User.js";

export const createCourse = async (req, res) => {
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
};

export const getCourseWithActivities = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate({
        path: "activities",
        model: "Activity",
        select: "title description type outputExample"
      })
      .select("title subTitle category description thumbnail example activities");

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
    
  
}