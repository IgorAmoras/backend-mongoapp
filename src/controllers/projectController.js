const express = require("express");
const mongoose = require("mongoose");
const authMiddleware = require("../middlewares/middlewareAuth");
const { permissionAcess } = require("../middlewares/sessionAuth");
const { getInitials } = require('../middlewares/parseName')
const Project = require("../models/Project");
const User = require('../models/User')
const Task = require("../models/Task");

const router = express.Router();

router.use(authMiddleware);

router.get("/all", permissionAcess, async (req, res) => {
  const { permission } = req;
  try {
    if (permission === "admin") {
      const projects = await Project.find().populate(["user", "tasks"]);
      return res.status(200).send({
        projects,
      });
    }
    if (permission === "User") {
      const initials = await (await getInitials(req)).toUpperCase()
      console.log(initials)
      const projects = await Project.find({initials})
        .populate(["user", "tasks"])

      return res.status(200).send({ projects });
    }
    return res.status(500).send({ 'error': 'Internal error, mister' });
  } catch (error) {
    console.error(error);
    return res.status(400).send({
      error: "Error retrieving projects",
    });
  }
});
router.get("/:projectId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate(
      "user",
      "tasks"
    );

    return res.status(200).send({
      project,
    });
  } catch (error) {
    return res.status(400).send({
      error: "Error retriving project",
    });
  }
});
router.post("/create", async (req, res) => {
  try {
    const { title, description, tasks } = req.body;
    const { name } = await User.findById(req.userId)
    const project = await Project.create({
      title,
      description,
      user: req.userId,
    });
    
    await Promise.all(
      tasks.map(async (task) => {
        const projectTask = new Task({ ...task, project: project._id });
        await projectTask.save();
        project.tasks.push(projectTask);
      })
      );

    project.parsed = name;

    await project.save();

    return res.status(200).send({
      project,
    });
  } catch (error) {
    console.error(error)
    return res.status(200).send({
      error: "There has been an error while creating the project",
    });
  }
});
router.put("/:projectId", async (req, res) => {
  try {
    const { title, description, tasks } = req.body;
    const project = await Project.findOneAndUpdate(
      req.params.projectId,
      {
        title,
        description,
      },
      { new: true }
    );

    project.tasks = [];
    await Task.remove({ project: project._id });

    await Promise.all(
      tasks.map(async (task) => {
        const projectTask = new Task({ ...task, project: project._id });
        await projectTask.save();
        project.tasks.push(projectTask);
      })
    );

    await project.save();

    return res.status(200).send({ project });
  } catch (error) {
    console.error(error)
    return res.status(400).send({ error: "Unable to update project" });
  }
});
router.delete("/:projectId", async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.projectId);

    return res.status(200).send({
      status: "deleted",
      "project-deleted": project,
    });
  } catch (error) {
    return res.status(400).send({
      error: "Project not deleted",
    });
  }
});
module.exports = (app) => app.use("/projects", router);
