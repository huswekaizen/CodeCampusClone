import express from "express";
import { createActivity, getActivitiesByCourse, updateActivity } from "../controllers/activityController.js";
const router = express.Router();

router.post("/activities", createActivity);
router.get("/activities/:courseId", getActivitiesByCourse);
router.put("/activities/:id", updateActivity);

export default router;
