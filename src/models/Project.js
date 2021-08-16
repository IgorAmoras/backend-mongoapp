const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { initialLetterPlugin } = require('../middlewares/namePlugin')
const User = require('./User')
const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  tasks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },

});

ProjectSchema.plugin(initialLetterPlugin)
const Project = mongoose.model("Project", ProjectSchema);

module.exports = Project;
