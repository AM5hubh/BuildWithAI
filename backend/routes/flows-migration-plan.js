/**
 * Enhanced Flow Routes with MongoDB Persistence
 * TO BE ADDED to backend/routes/flows.js
 *
 * Currently, flows are stored in the file system (flows/ directory)
 * This migration plan shows how to transition to MongoDB-based storage
 */

import express from "express";
import Flow from "../models/Flow.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/flows/save
 * Save or update a flow (requires authentication)
 */
router.post("/save", authMiddleware, async (req, res) => {
  try {
    const { id, name, nodes, edges, description } = req.body;
    const userId = req.userId;

    if (!id || !nodes || !edges) {
      return res.status(400).json({
        error: "Flow ID, nodes, and edges are required",
      });
    }

    // Find existing flow or create new one
    let flow = await Flow.findOne({ _id: id, userId });

    if (flow) {
      // Update existing flow
      flow.name = name || flow.name;
      flow.description = description || flow.description;
      flow.nodes = nodes;
      flow.edges = edges;
      flow.updatedAt = new Date();
    } else {
      // Create new flow
      flow = new Flow({
        _id: id,
        userId,
        name: name || "Untitled Flow",
        description: description || "",
        nodes,
        edges,
      });

      // Add flow reference to user
      await User.findByIdAndUpdate(userId, {
        $push: { flows: flow._id },
      });
    }

    await flow.save();

    res.json({
      success: true,
      id: flow._id,
      message: "Flow saved successfully",
    });
  } catch (error) {
    console.error("Flow save error:", error);
    res.status(500).json({
      error: "Failed to save flow",
      message: error.message,
    });
  }
});

/**
 * GET /api/flows
 * Get all flows for current user
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const flows = await Flow.find({ userId })
      .select("-nodes -edges") // Exclude large data for list view
      .sort({ updatedAt: -1 });

    res.json({
      flows,
      count: flows.length,
    });
  } catch (error) {
    console.error("Flows list error:", error);
    res.status(500).json({
      error: "Failed to list flows",
      message: error.message,
    });
  }
});

/**
 * GET /api/flows/:id
 * Get a specific flow (requires ownership)
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const flow = await Flow.findOne({ _id: id, userId });

    if (!flow) {
      return res.status(404).json({ error: "Flow not found" });
    }

    res.json(flow);
  } catch (error) {
    console.error("Flow load error:", error);
    res.status(500).json({
      error: "Failed to load flow",
      message: error.message,
    });
  }
});

/**
 * DELETE /api/flows/:id
 * Delete a flow (requires ownership)
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const flow = await Flow.findOneAndDelete({ _id: id, userId });

    if (!flow) {
      return res.status(404).json({ error: "Flow not found" });
    }

    // Remove flow reference from user
    await User.findByIdAndUpdate(userId, {
      $pull: { flows: id },
    });

    res.json({
      success: true,
      id,
      message: "Flow deleted successfully",
    });
  } catch (error) {
    console.error("Flow delete error:", error);
    res.status(500).json({
      error: "Failed to delete flow",
      message: error.message,
    });
  }
});

/**
 * POST /api/flows/:id/duplicate
 * Create a copy of a flow
 */
router.post("/:id/duplicate", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const originalFlow = await Flow.findOne({ _id: id, userId });

    if (!originalFlow) {
      return res.status(404).json({ error: "Flow not found" });
    }

    // Create copy with new ID
    const copiedFlow = new Flow({
      userId,
      name: `${originalFlow.name} (Copy)`,
      description: originalFlow.description,
      nodes: originalFlow.nodes,
      edges: originalFlow.edges,
    });

    await copiedFlow.save();

    // Add flow reference to user
    await User.findByIdAndUpdate(userId, {
      $push: { flows: copiedFlow._id },
    });

    res.json({
      success: true,
      id: copiedFlow._id,
      message: "Flow duplicated successfully",
    });
  } catch (error) {
    console.error("Flow duplicate error:", error);
    res.status(500).json({
      error: "Failed to duplicate flow",
      message: error.message,
    });
  }
});

export default router;
