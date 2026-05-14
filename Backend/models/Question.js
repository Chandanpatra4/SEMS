import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    optionA: {
      type: String,
      required: [true, 'Option A is required'],
      trim: true,
    },
    optionB: {
      type: String,
      required: [true, 'Option B is required'],
      trim: true,
    },
    optionC: {
      type: String,
      required: [true, 'Option C is required'],
      trim: true,
    },
    optionD: {
      type: String,
      required: [true, 'Option D is required'],
      trim: true,
    },
    correctAnswer: {
      type: String,
      required: [true, 'Correct answer is required'],
      enum: ['A', 'B', 'C', 'D'],
    },
    subject: {
      type: String,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
    },
    marks: {
      type: Number,
      required: [true, 'Marks are required'],
      enum: [1, 2, 5],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Question = mongoose.model('Question', questionSchema);

export default Question;
