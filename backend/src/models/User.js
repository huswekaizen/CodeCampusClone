import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true },
  age: { type: Number },
  role: { type: String, enum: ['student', 'instructor'], required: true },
  address: { type: String },

  // Instructor: courses they created
  createdCourses: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Course" }
  ],

  // Student: courses they joined
  enrolledCourses: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Course" }
  ],

  courseProgress: [
    {
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
      },

      points: {
        type: Number,
        default: 0
      },

      completedActivities: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Activity"
        }
      ]
    }
  ]


}, { timestamps: true });



export default mongoose.model("User", userSchema);
