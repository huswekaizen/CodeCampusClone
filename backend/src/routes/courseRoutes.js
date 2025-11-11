import express from "express";
import multer from "multer";
import path from "path";
import { createCourse, getCourseWithActivities, getPublishedCourses, editCourse } from "../controllers/courseController.js";

const router = express.Router();

// === Multer setup ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/uploads/"); // folder where the files will be stored
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

router.post("/courses", upload.single("thumbnail"), createCourse);
router.get("/courses/:id/details", getCourseWithActivities);
router.get("/instructors/:id/published-courses", getPublishedCourses);
router.put("/courses/:id/edit", upload.single("thumbnail"), editCourse);

export default router;
