import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g. "Quiz: Variables"
  type: { 
    type: String, 
    enum: ["exercise", "quiz", "assignment"], 
    required: true 
  },
  description: { type: String, required: true }, // the textarea "Describe the activity..."
  outputExample: { type: String }, // "Desired output / Example I/O"
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true }, // foreign key to Course
}, { timestamps: true });

export default mongoose.model("Activity", activitySchema);
