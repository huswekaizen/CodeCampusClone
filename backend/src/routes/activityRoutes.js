import express from "express";
import { createActivity, getActivitiesByCourse, updateActivity, 
         deleteActivity, getActivityById } from "../controllers/activityController.js";
const router = express.Router();

router.post("/activities", createActivity);

router.get("/activities/course/:courseId", getActivitiesByCourse);
router.get("/activities/:id", getActivityById);

router.put("/activities/:id", updateActivity);

router.delete("/activities/:id", deleteActivity);

export default router;
