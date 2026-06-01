import Task from "../models/Task.js";

const getUserId = (req) => req.user?.id || req.user?._id;

export const createTask = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { taskName, description, taskDate, taskTime } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (!taskName || !description || !taskDate || !taskTime) {
      return res.status(400).json({
        message: "Task name, description, date, and time are required."
      });
    }

    const task = await Task.create({
      userId,
      taskName: taskName.trim(),
      description: description.trim(),
      taskDate,
      taskTime
    });

    return res.status(201).json({
      message: "Task created successfully.",
      task
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to create task."
    });
  }
};

export const getMyTasks = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const tasks = await Task.find({ userId }).sort({ createdAt: -1 });

    return res.json({
      tasks
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to fetch tasks."
    });
  }
};
