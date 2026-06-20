import mongoose from "mongoose";

const interviewQuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  userAnswer: {
    type: String,
    default: ""
  },
  isSkipped: {
    type: Boolean,
    default: false
  },
  evaluation: {
    technicalScore: Number,
    communicationScore: Number,
    confidenceScore: Number,
    problemSolvingScore: Number,
    strengths: [String],
    weaknesses: [String],
    improvements: [String],
    idealAnswer: String
  },
  // Coding specific evaluations
  codeDetails: {
    language: String,
    codeSubmitted: String,
    codeReview: {
      correctness: Number,
      codeQuality: Number,
      optimization: Number,
      readability: Number,
      feedback: [String],
      improvements: [String],
      optimizedSolution: String
    }
  }
});

const interviewSchema = new mongoose.Schema({
  email: {
    type: String,
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  role: {
    type: String,
    required: true
  },
  experienceLevel: {
    type: String,
    required: true
  },
  interviewType: {
    type: String,
    required: true
  },
  overallScore: {
    type: Number,
    default: 0
  },
  technicalScore: {
    type: Number,
    default: 0
  },
  communicationScore: {
    type: Number,
    default: 0
  },
  confidenceScore: {
    type: Number,
    default: 0
  },
  problemSolvingScore: {
    type: Number,
    default: 0
  },
  strengths: {
    type: [String],
    default: []
  },
  weaknesses: {
    type: [String],
    default: []
  },
  improvements: {
    type: [String],
    default: []
  },
  summary: {
    type: String,
    default: ""
  },
  hiringRecommendation: {
    type: String,
    enum: ["Strong Hire", "Hire", "Borderline", "No Hire"],
    default: "Borderline"
  },
  questions: [interviewQuestionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

interviewSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Interview || mongoose.model("Interview", interviewSchema);
