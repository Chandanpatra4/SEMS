import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import User from '../models/User.js';

const ALLOWED_BRANCHES = ['CSE', 'ECE', 'ME', 'CE', 'EEE'];
const ALLOWED_YEARS = [1, 2, 3, 4];

const normalizeBranch = (branch) =>
  typeof branch === 'string' ? branch.trim().toUpperCase() : '';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getStudentAcademicProfile = async (userId) => {
  const student = await User.findById(userId).select(
    'branch year department yearSemester status'
  );

  if (!student) {
    return null;
  }

  const branch = normalizeBranch(student.branch || student.department);
  const year = Number(student.year || student.yearSemester);

  if (!ALLOWED_BRANCHES.includes(branch) || !ALLOWED_YEARS.includes(year)) {
    return null;
  }

  return {
    branch,
    year,
    isActive: String(student.status || '').toLowerCase() !== 'inactive',
  };
};

const pickQuestionsForTotalMarks = (questions, targetMarks) => {
  const dp = new Map();
  dp.set(0, []);

  for (let index = 0; index < questions.length; index += 1) {
    const question = questions[index];
    const mark = Number(question.marks);

    if (!Number.isFinite(mark) || mark <= 0) {
      continue;
    }

    const currentEntries = Array.from(dp.entries()).sort((a, b) => b[0] - a[0]);

    for (const [sum, selectedIndexes] of currentEntries) {
      const nextSum = sum + mark;

      if (nextSum > targetMarks || dp.has(nextSum)) {
        continue;
      }

      dp.set(nextSum, [...selectedIndexes, index]);
    }
  }

  if (!dp.has(targetMarks)) {
    return null;
  }

  return dp.get(targetMarks).map((selectedIndex) => questions[selectedIndex]);
};

const createExam = async (req, res) => {
  try {
    const { title, subject, duration, totalMarks, branch, year, startTime, endTime } =
      req.body;

    if (
      !title ||
      !subject ||
      !duration ||
      !totalMarks ||
      !branch ||
      !year ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          'title, subject, totalMarks, duration, branch, year, startTime, and endTime are required',
      });
    }

    const normalizedBranch = normalizeBranch(branch);
    const parsedYear = Number(year);
    const parsedDuration = Number(duration);
    const parsedTotalMarks = Number(totalMarks);
    const parsedStartTime = new Date(startTime);
    const parsedEndTime = new Date(endTime);

    if (!ALLOWED_BRANCHES.includes(normalizedBranch)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid branch. Allowed values: CSE, ECE, ME, CE, EEE',
      });
    }

    if (!ALLOWED_YEARS.includes(parsedYear)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year. Allowed values: 1, 2, 3, 4',
      });
    }

    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be a positive number',
      });
    }

    if (!Number.isFinite(parsedTotalMarks) || parsedTotalMarks <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Total marks must be a positive number',
      });
    }

    if (
      Number.isNaN(parsedStartTime.getTime()) ||
      Number.isNaN(parsedEndTime.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid startTime or endTime',
      });
    }

    if (parsedEndTime <= parsedStartTime) {
      return res.status(400).json({
        success: false,
        message: 'endTime must be after startTime',
      });
    }

    const normalizedSubject = subject.trim();

    const matchingQuestions = await Question.find({
      subject: { $regex: new RegExp(`^${escapeRegex(normalizedSubject)}$`, 'i') },
    }).select('_id marks');

    if (!matchingQuestions.length) {
      return res.status(400).json({
        success: false,
        message: 'No questions found for the provided subject',
      });
    }

    const selectedQuestions = pickQuestionsForTotalMarks(
      matchingQuestions,
      parsedTotalMarks
    );

    if (!selectedQuestions) {
      return res.status(400).json({
        success: false,
        message:
          'Unable to auto-select questions matching the requested totalMarks for this subject',
      });
    }

    const exam = await Exam.create({
      title,
      subject: normalizedSubject,
      duration: parsedDuration,
      totalMarks: parsedTotalMarks,
      questions: selectedQuestions.map((question) => question._id),
      branch: normalizedBranch,
      year: parsedYear,
      startTime: parsedStartTime,
      endTime: parsedEndTime,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      exam,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllExams = async (req, res) => {
  try {
    let exams = [];

    if (req.user.role === 'admin') {
      exams = await Exam.find({})
        .populate('questions', 'questionText subject difficulty')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'teacher') {
      exams = await Exam.find({ createdBy: req.user.id })
        .populate('questions', 'questionText subject difficulty')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'student') {
      const studentProfile = await getStudentAcademicProfile(req.user.id);

      if (!studentProfile) {
        return res.status(400).json({
          success: false,
          message: 'Student branch and year are required',
        });
      }

      exams = await Exam.find({
        branch: studentProfile.branch,
        year: studentProfile.year,
        endTime: { $gte: new Date() },
      })
        .populate('questions', 'questionText subject difficulty')
        .sort({ startTime: 1 });
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    return res.status(200).json({
      success: true,
      count: exams.length,
      exams,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAvailableExams = async (req, res) => {
  try {
    const studentProfile = await getStudentAcademicProfile(req.user.id);

    if (!studentProfile) {
      return res.status(400).json({
        success: false,
        message: 'Student branch and year are required',
      });
    }

    const exams = await Exam.find({
      branch: studentProfile.branch,
      year: studentProfile.year,
      endTime: { $gte: new Date() },
    })
      .populate('questions', 'questionText subject difficulty')
      .sort({ startTime: 1 });

    return res.status(200).json({
      success: true,
      count: exams.length,
      exams,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getExamById = async (req, res) => {
  try {
    let exam;

    if (req.user.role === 'admin') {
      exam = await Exam.findById(req.params.id).populate('questions');
    } else if (req.user.role === 'teacher') {
      exam = await Exam.findOne({
        _id: req.params.id,
        createdBy: req.user.id,
      }).populate('questions');
    } else if (req.user.role === 'student') {
      const studentProfile = await getStudentAcademicProfile(req.user.id);

      if (!studentProfile) {
        return res.status(400).json({
          success: false,
          message: 'Student branch and year are required',
        });
      }

      if (!studentProfile.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Not allowed now. Contact admin.',
        });
      }

      const currentTime = new Date();

      exam = await Exam.findOne({
        _id: req.params.id,
        branch: studentProfile.branch,
        year: studentProfile.year,
        startTime: { $lte: currentTime },
        endTime: { $gte: currentTime },
      }).populate(
        'questions',
        'questionText optionA optionB optionC optionD subject difficulty marks'
      );
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    return res.status(200).json({
      success: true,
      exam,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateExam = async (req, res) => {
  try {
    const allowedUpdates = [
      'title',
      'subject',
      'duration',
      'totalMarks',
      'questions',
      'branch',
      'year',
      'startTime',
      'endTime',
    ];

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedUpdates.includes(key))
    );

    const exam = await Exam.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user.id,
      },
      updates,
      {
        new: true,
        runValidators: true,
      }
    ).populate('questions', 'questionText subject difficulty');

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Exam updated successfully',
      exam,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { createExam, getAllExams, getAvailableExams, getExamById, updateExam };
