import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks are required'],
      min: [1, 'Total marks must be at least 1'],
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      enum: {
        values: ['CSE', 'ECE', 'ME', 'CE', 'EEE'],
        message: 'Branch must be one of CSE, ECE, ME, CE, EEE',
      },
      trim: true,
      uppercase: true,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      enum: {
        values: [1, 2, 3, 4],
        message: 'Year must be one of 1, 2, 3, 4',
      },
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
      validate: {
        validator(value) {
          return this.startTime ? value > this.startTime : true;
        },
        message: 'End time must be after start time',
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by is required'],
    },
  },
  {
    timestamps: true,
  }
);

examSchema.path('questions').validate(function validateQuestions(questions) {
  return Array.isArray(questions) && questions.length > 0;
}, 'At least one question is required');

const Exam = mongoose.model('Exam', examSchema);

export default Exam;
