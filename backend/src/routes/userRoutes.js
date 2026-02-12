import express from "express";

import { getUserWithCourses, loginUser, registerUser, getUserCourseProgress, editUserProfile, editUserSecurity } from "../controllers/userController.js";

import User from "../models/User.js";
import Course from "../models/Course.js";


const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);

router.put("/users/:id/profile", editUserProfile);
router.put("/users/:id/security", editUserSecurity);

router.get("/users/:id/details", getUserWithCourses);
router.get("/users/:id/progress/:courseId", getUserCourseProgress);

export default router;
