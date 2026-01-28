import express from "express";
import Flow from "../models/Flow.js";

const router = express.Router();

// Save Flow
router.post("/flows", async (req, res) => {
  const { projectId, nodes, edges } = req.body;
  const userId = req.userId; // from authMiddleware

  try {
    // Delete previous flows for the project
    await Flow.deleteMany({ projectId, userId });

    // Save new flow
    const newFlow = new Flow({
      projectId,
      userId,
      nodes,
      edges,
    });
    await newFlow.save();
    res.status(201).json(newFlow);
  } catch (error) {
    console.error("Save flow error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Load Flow
router.get("/flows/:projectId", async (req, res) => {
  const { projectId } = req.params;
  const userId = req.userId; // from authMiddleware

  try {
    const flow = await Flow.findOne({ projectId, userId }).sort({
      createdAt: -1,
    });
    if (!flow) {
      return res
        .status(404)
        .json({ message: "Flow not found", nodes: [], edges: [] });
    }
    res.status(200).json(flow);
  } catch (error) {
    console.error("Load flow error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
