import express from "express";
import { registerUser } from "../controllers/userController.js";
import { loginUser } from "../controllers/userController.js";
import { getUserWithCourses } from "../controllers/userController.js";

import User from "../models/User.js";
import Course from "../models/Course.js";


const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.get("/users/:id/details", getUserWithCourses);

export default router;
