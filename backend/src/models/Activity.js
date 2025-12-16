import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  title: String,
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true
  },
  description: String,

  functionName: {
    type: String,
    required: true // e.g. "sum"
  },

  testCases: [
    {
      input: [mongoose.Schema.Types.Mixed], // parameters
      expected: mongoose.Schema.Types.Mixed
    }
  ],

  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  }
}, { timestamps: true });


export default mongoose.model("Activity", activitySchema);
