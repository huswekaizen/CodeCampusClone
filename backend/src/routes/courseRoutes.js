console.log("LOADING COURSE ROUTES...");

import express from "express";
import multer from "multer";
import path from "path";
import { createCourse, getCourseWithActivities, getPublishedCourses, editCourse, deleteCourse,
         joinCourse, getEnrolledCourses} from "../controllers/courseController.js";

const router = express.Router();

// === Multer setup ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads"));
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

console.log("COURSE ROUTES MOUNTED");
console.log("JOIN ROUTE REGISTERING...");

router.post("/courses", upload.single("thumbnail"), createCourse);
router.post("/courses/join", joinCourse);

router.get("/courses/:id/details", getCourseWithActivities);
router.get("/instructors/:id/published-courses", getPublishedCourses);
router.get("/students/:id/enrolled-courses", getEnrolledCourses);

router.put("/courses/:id/edit", upload.single("thumbnail"), editCourse);

router.delete("/courses/:id/delete", deleteCourse);

export default router;
