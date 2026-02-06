import express from "express";

import { getUserWithCourses, loginUser, registerUser, getUserCourseProgress, editUser } from "../controllers/userController.js";

import User from "../models/User.js";
import Course from "../models/Course.js";


const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);

router.put("/users/:id/edit", editUser);

router.get("/users/:id/details", getUserWithCourses);
router.get("/users/:id/progress/:courseId", getUserCourseProgress);

export default router;
