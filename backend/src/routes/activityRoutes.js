import express from "express";
import { createActivity, getActivitiesByCourse } from "../controllers/activityController.js";
const router = express.Router();

router.post("/activities", createActivity);
router.get("/activties/:courseId", getActivitiesByCourse);

export default router;
