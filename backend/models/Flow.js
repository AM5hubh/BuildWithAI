import mongoose from "mongoose";

const flowSchema = new mongoose.Schema(
  {
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
    nodes: [
      {
        id: String,
        type: String,
        position: {
          x: Number,
          y: Number,
        },
        data: mongoose.Schema.Types.Mixed,
      },
    ],
    edges: [
      {
        id: String,
        source: String,
        target: String,
        animated: Boolean,
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Flow", flowSchema);
