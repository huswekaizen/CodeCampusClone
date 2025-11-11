import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subTitle: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String}, // stores image URL or path
  example: { type: String, required: true }, 
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  // Instructor: courses they created
  activities: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Activity" }
  ],
}, { timestamps: true });

export default mongoose.model("Course", courseSchema);
