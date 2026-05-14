import Exam from '../models/Exam.js';
import Result from '../models/Result.js';

const getGrade = (percentage) => {
  if (percentage >= 90) {
    return 'Excellent';
  }

  if (percentage >= 75) {
    return 'Good';
  }

  if (percentage >= 50) {
    return 'Average';
  }

  return 'Needs Improvement';
};

const submitExam = async (req, res) => {
  try {
    const { examId, answers } = req.body;

    if (!examId || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Exam ID and answers array are required',
      });
    }

    const exam = await Exam.findById(examId)
      .select('_id totalMarks questions')
      .populate(
        'questions',
        'questionText optionA optionB optionC optionD correctAnswer marks'
      );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    const existingSubmission = await Result.findOne({
      studentId: req.user.id,
      examId,
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'Exam already submitted',
      });
    }

    const examQuestionIds = exam.questions.map((question) => question._id.toString());
    const hasInvalidQuestion = answers.some(
      (answer) => !examQuestionIds.includes(String(answer.questionId))
    );

    if (hasInvalidQuestion) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question in answers',
      });
    }

    const submittedAnswersMap = new Map(
      answers.map((answer) => [String(answer.questionId), answer.selectedOption])
    );

    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unansweredQuestions = 0;
    let score = 0;

    exam.questions.forEach((question) => {
      const selectedOption = submittedAnswersMap.get(String(question._id));

      if (!selectedOption) {
        unansweredQuestions += 1;
        return;
      }

      if (selectedOption === question.correctAnswer) {
        correctAnswers += 1;
        score += question.marks;
        return;
      }

      wrongAnswers += 1;
    });

    const totalMarks =
      exam.totalMarks ||
      exam.questions.reduce((sum, question) => sum + (question.marks || 0), 0);
    const percentage =
      totalMarks > 0 ? Number(((score / totalMarks) * 100).toFixed(2)) : 0;
    const grade = getGrade(percentage);

    const result = await Result.create({
      studentId: req.user.id,
      examId,
      answers,
      score,
      percentage,
      correctAnswers,
      wrongAnswers,
      grade,
      submittedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: 'Exam submitted successfully',
      result: {
        id: result._id,
        examId: result.examId,
        studentId: result.studentId,
        score: result.score,
        percentage: result.percentage,
        correctAnswers: result.correctAnswers,
        wrongAnswers: result.wrongAnswers,
        unansweredQuestions,
        grade: result.grade,
        submittedAt: result.submittedAt,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Exam already submitted',
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyResults = async (req, res) => {
  try {
    const results = await Result.find({ studentId: req.user.id })
      .populate('examId', 'title subject duration totalMarks startTime endTime questions')
      .populate({
        path: 'examId',
        populate: {
          path: 'questions',
          select: 'questionText correctAnswer marks',
        },
      })
      .sort({ submittedAt: -1 });

    return res.status(200).json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getExamResults = async (req, res) => {
  try {
    const examQuery = { _id: req.params.examId };

    if (req.user.role === 'teacher') {
      examQuery.createdBy = req.user.id;
    }

    const exam = await Exam.findOne(examQuery).select('_id title');

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    const results = await Result.find({ examId: req.params.examId })
      .populate('studentId', 'name email')
      .sort({ submittedAt: -1 });

    return res.status(200).json({
      success: true,
      exam,
      count: results.length,
      results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { submitExam, getMyResults, getExamResults };
