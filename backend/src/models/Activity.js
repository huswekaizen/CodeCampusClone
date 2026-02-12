import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  title: String,
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true
  },

  points: {
    type: Number,
    min: 1,
    max: 100,
    required: true
  },
  
  description: String,

  sampleTests: [
    {
      input: [mongoose.Schema.Types.Mixed], // parameters
      expected: mongoose.Schema.Types.Mixed
    }
  ],

  validationTests: [
    {
      input: [mongoose.Schema.Types.Mixed],
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
