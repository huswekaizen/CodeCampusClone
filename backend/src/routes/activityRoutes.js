import express from "express";
import { createActivity, getActivitiesByCourse, updateActivity, 
         deleteActivity, getActivityById } from "../controllers/activityController.js";
const router = express.Router();

router.post("/activities", createActivity);

router.get("/activities/:courseId", getActivitiesByCourse);
router.get("/activity/:id", getActivityById);

router.put("/activities/:id", updateActivity);

router.delete("/activities/:id", deleteActivity);

export default router;
