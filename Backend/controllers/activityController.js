import Exam from '../models/Exam.js';
import ActivityLog from '../models/ActivityLog.js';

const severityMap = {
  tab_switch: 'medium',
  tab_switch_auto_submit: 'high',
  fullscreen_exit: 'high',
  copy_attempt: 'high',
  right_click: 'medium',
  focus_loss: 'low',
  no_face_auto_submit: 'high',
  multiple_face_auto_submit: 'high',
  time_expired_auto_submit: 'low',
};

const logActivity = async (req, res) => {
  try {
    const { examId, activityType } = req.body;

    if (!examId || !activityType) {
      return res.status(400).json({
        success: false,
        message: 'Exam ID and activity type are required',
      });
    }

    const exam = await Exam.findById(examId).select('_id');

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    const activityLog = await ActivityLog.create({
      studentId: req.user.id,
      examId,
      activityType,
      severity: severityMap[activityType] || 'low',
    });

    return res.status(201).json({
      success: true,
      message: 'Activity logged successfully',
      activityLog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getActivityLogs = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'teacher') {
      const teacherExamIds = await Exam.find({ createdBy: req.user.id }).select('_id');
      query = {
        examId: {
          $in: teacherExamIds.map((exam) => exam._id),
        },
      };
    }

    const activityLogs = await ActivityLog.find(query)
      .populate('studentId', 'name email')
      .populate('examId', 'title subject branch year')
      .sort({ createdAt: -1, timestamp: -1 })
      .limit(200);

    return res.status(200).json({
      success: true,
      count: activityLogs.length,
      activityLogs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { getActivityLogs, logActivity };
