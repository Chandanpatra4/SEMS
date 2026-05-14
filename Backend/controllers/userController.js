import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      enrollmentId,
      branch,
      year,
      department,
      yearSemester,
      status,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (!['teacher', 'student'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be teacher or student',
      });
    }

    const normalizedBranch =
      role === 'student'
        ? String(branch || department || '')
            .trim()
            .toUpperCase()
        : undefined;
    const numericYear = role === 'student' ? Number(year || yearSemester) : undefined;

    if (role === 'student') {
      if (!normalizedBranch || !['CSE', 'ECE', 'ME', 'CE', 'EEE'].includes(normalizedBranch)) {
        return res.status(400).json({
          success: false,
          message: 'Branch is required and must be one of CSE, ECE, ME, CE, EEE',
        });
      }

      if (![1, 2, 3, 4].includes(numericYear)) {
        return res.status(400).json({
          success: false,
          message: 'Year is required and must be one of 1, 2, 3, 4',
        });
      }
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      enrollmentId,
      branch: normalizedBranch,
      year: numericYear,
      department,
      yearSemester,
      status: status || 'Active',
    });

    return res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        enrollmentId: user.enrollmentId,
        branch: user.branch,
        year: user.year,
        department: user.department,
        yearSemester: user.yearSemester,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const roleFilter = req.query.role;
    const baseQuery = { role: { $in: ['teacher', 'student'] } };

    if (roleFilter && ['teacher', 'student'].includes(roleFilter)) {
      baseQuery.role = roleFilter;
    }

    const users = await User.find(baseQuery)
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      enrollmentId,
      branch,
      year,
      department,
      yearSemester,
      status,
    } = req.body;

    const user = await User.findOne({
      _id: req.params.id,
      role: { $in: ['teacher', 'student'] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists',
        });
      }
    }

    if (role && !['teacher', 'student'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be teacher or student',
      });
    }

    user.name = name || user.name;
    user.email = email ? email.toLowerCase() : user.email;
    user.role = role || user.role;
    user.enrollmentId = enrollmentId || user.enrollmentId;
    if (branch) {
      user.branch = String(branch).trim().toUpperCase();
    }
    if (year !== undefined && year !== null && year !== '') {
      user.year = Number(year);
    }
    user.department = department || user.department;
    user.yearSemester = yearSemester || user.yearSemester;

    if (user.role === 'student') {
      if (!user.branch || !['CSE', 'ECE', 'ME', 'CE', 'EEE'].includes(user.branch)) {
        return res.status(400).json({
          success: false,
          message: 'Branch is required and must be one of CSE, ECE, ME, CE, EEE',
        });
      }

      if (![1, 2, 3, 4].includes(Number(user.year))) {
        return res.status(400).json({
          success: false,
          message: 'Year is required and must be one of 1, 2, 3, 4',
        });
      }
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    if (status) {
      user.status = status;
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        enrollmentId: updatedUser.enrollmentId,
        branch: updatedUser.branch,
        year: updatedUser.year,
        department: updatedUser.department,
        yearSemester: updatedUser.yearSemester,
        status: updatedUser.status,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      role: { $in: ['teacher', 'student'] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { createUser, getAllUsers, updateUser, deleteUser };
