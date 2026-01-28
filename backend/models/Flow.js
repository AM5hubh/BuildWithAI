import mongoose from "mongoose";

const flowSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      default: "Untitled Flow",
    },
    description: {
      type: String,
      default: "",
    },
    nodes: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    edges: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Flow", flowSchema);
