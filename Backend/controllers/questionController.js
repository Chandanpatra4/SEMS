import Question from '../models/Question.js';

const createQuestion = async (req, res) => {
  try {
    const {
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      subject,
      difficulty,
      marks,
    } = req.body;

    if (!questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer || !difficulty || marks === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All question fields are required',
      });
    }

    const normalizedDifficulty = String(difficulty).toLowerCase();
    const normalizedAnswer = String(correctAnswer).toUpperCase();
    const numericMarks = Number(marks);

    if (!['easy', 'medium', 'hard'].includes(normalizedDifficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Difficulty must be easy, medium, or hard',
      });
    }

    if (!['A', 'B', 'C', 'D'].includes(normalizedAnswer)) {
      return res.status(400).json({
        success: false,
        message: 'Correct answer must be A, B, C, or D',
      });
    }

    if (![1, 2, 5].includes(numericMarks)) {
      return res.status(400).json({
        success: false,
        message: 'Marks must be 1, 2, or 5',
      });
    }

    const question = await Question.create({
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer: normalizedAnswer,
      subject,
      difficulty: normalizedDifficulty,
      marks: numericMarks,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: 'Question created successfully',
      question,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getQuestions = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { createdBy: req.user.id };

    const questions = await Question.find(query)
      .select('questionText optionA optionB optionC optionD correctAnswer subject difficulty createdAt updatedAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const updatedQuestion = await Question.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user.id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      question: updatedQuestion,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    await question.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { createQuestion, getQuestions, updateQuestion, deleteQuestion };
