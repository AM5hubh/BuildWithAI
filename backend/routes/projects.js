import express from "express";
import Project from "../models/Project.js";
import Flow from "../models/Flow.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/projects
 * Create a new project
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.userId;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "Project name is required",
      });
    }

    // Create new project
    const project = new Project({
      userId,
      name: name.trim(),
      description: description || "",
      flows: [],
    });

    await project.save();

    // Add project reference to user
    await User.findByIdAndUpdate(userId, {
      $push: { projects: project._id },
    });

    res.json({
      success: true,
      project: {
        _id: project._id,
        name: project.name,
        description: project.description,
        userId: project.userId,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        flowCount: 0,
      },
    });
  } catch (error) {
    console.error("Project creation error:", error);
    res.status(500).json({
      error: "Failed to create project",
      message: error.message,
    });
  }
});

/**
 * GET /api/projects
 * Get all projects for current user
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        error: "User ID not found in request",
      });
    }

    const projects = await Project.find({ userId }).sort({ updatedAt: -1 });

    const projectsWithFlowCount = projects.map((project) => ({
      _id: project._id,
      name: project.name,
      description: project.description,
      userId: project.userId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      flowCount: project.flows.length,
    }));

    res.json({
      success: true,
      projects: projectsWithFlowCount,
      count: projectsWithFlowCount.length,
    });
  } catch (error) {
    console.error("Projects list error:", error);
    res.status(500).json({
      error: "Failed to list projects",
      message: error.message,
    });
  }
});

/**
 * GET /api/projects/:projectId
 * Get a specific project (requires ownership)
 */
router.get("/:projectId", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    const project = await Project.findOne({
      _id: projectId,
      userId,
    }).populate("flows");

    if (!project) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    res.json({
      success: true,
      project: {
        ...project.toObject(),
        flowCount: project.flows.length,
      },
    });
  } catch (error) {
    console.error("Project fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch project",
      message: error.message,
    });
  }
});

/**
 * PUT /api/projects/:projectId
 * Update a project
 */
router.put("/:projectId", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description } = req.body;
    const userId = req.userId;

    const project = await Project.findOne({
      _id: projectId,
      userId,
    });

    if (!project) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    if (name) project.name = name.trim();
    if (description !== undefined) project.description = description;

    await project.save();

    res.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Project update error:", error);
    res.status(500).json({
      error: "Failed to update project",
      message: error.message,
    });
  }
});

/**
 * DELETE /api/projects/:projectId
 * Delete a project (requires ownership)
 */
router.delete("/:projectId", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    const project = await Project.findOne({
      _id: projectId,
      userId,
    });

    if (!project) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    // Delete all flows in the project
    if (project.flows && project.flows.length > 0) {
      // Note: Consider cascading delete of flows here if needed
    }

    await Project.deleteOne({ _id: projectId });

    // Remove from user's projects
    await User.findByIdAndUpdate(userId, {
      $pull: { projects: projectId },
    });

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Project delete error:", error);
    res.status(500).json({
      error: "Failed to delete project",
      message: error.message,
    });
  }
});

export default router;
