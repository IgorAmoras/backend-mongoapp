const mongoose = require("mongoose");
const bcrpt = require("bcryptjs");

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
    default: 'Task auto-explicativa'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  responsible: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true,
    default: '6103fecd2af6a14e536b5e60'
  },
  completed: {
    type: Boolean,
    require: true,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;
