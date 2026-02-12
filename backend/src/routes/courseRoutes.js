console.log("LOADING COURSE ROUTES...");

import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { /*createCourse,*/ getCourseWithActivities, getInstructorCourses, editCourse, deleteCourse,
         joinCourse, getEnrolledCourses, leaveCourse, createCourseWithActivities, getCourseLeaderboard,
         getPublicCourses, getInstructorUniqueStudentCount, getInstructorUniqueStudents, getInstructorLeaderboard,
         getStudentGlobalLeaderboard } from "../controllers/courseController.js";

const router = express.Router();

// === Multer setup ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads"));
  },

  filename: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads");
    const sanitizedName = file.originalname.replace(/\s+/g, "_");
    const filePath = path.join(uploadDir, sanitizedName);

    if (fs.existsSync(filePath)) {
      req.existingThumbnail = sanitizedName;
      cb(null, sanitizedName); // reuse
    } else {
      cb(null, sanitizedName);
    }
  }

});


const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

console.log("COURSE ROUTES MOUNTED");
console.log("JOIN ROUTE REGISTERING...");

// router.post("/courses", upload.single("thumbnail"), createCourse);
router.post("/courses/join", joinCourse);
router.post("/courses/with-activities", upload.single("thumbnail"), createCourseWithActivities);

router.get("/courses/:id/details", getCourseWithActivities);
router.get("/instructors/:id/published-courses", getInstructorCourses);
router.get("/students/:id/enrolled-courses", getEnrolledCourses);
router.get("/courses/:courseId/leaderboard", getCourseLeaderboard);
router.get("/courses/public", getPublicCourses);
router.get("/instructors/:id/totalStudents", getInstructorUniqueStudentCount);  
router.get("/instructors/:id/totalStudentsNames", getInstructorUniqueStudents);
router.get("/instructors/:id/leaderboard", getInstructorLeaderboard);
router.get("/students/globalLeaderboard", getStudentGlobalLeaderboard);


router.put("/courses/:id/edit", upload.single("thumbnail"), editCourse);

router.delete("/courses/:id/delete", deleteCourse);
router.delete("/courses/:id/leave-course", leaveCourse);

export default router;
