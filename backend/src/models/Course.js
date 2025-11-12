import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subTitle: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String}, // stores image URL or path
  example: { type: String, required: true }, 
  courseCode: { type: String, required: true, unique: true },

  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  activities: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Activity" }
  ],

}, { timestamps: true });

// === AUTO-GENERATE COURSE CODE ===
courseSchema.pre("validate", function(next) {
  if (!this.courseCode) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const digits = "0123456789";

    // 3 random letters + 2 digits, like "ABZ47" or "XQK15"
    let code = "";
    for (let i = 0; i < 3; i++) code += letters.charAt(Math.floor(Math.random() * letters.length));
    for (let i = 0; i < 2; i++) code += digits.charAt(Math.floor(Math.random() * digits.length));

    // Shuffle the code to make it look more random, like 2D4YW
    this.courseCode = code.split("").sort(() => Math.random() - 0.5).join("");
  }
  next();
});

export default mongoose.model("Course", courseSchema);
