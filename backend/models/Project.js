import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    flows: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Flow",
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    settings: {
      theme: String,
      autoSave: Boolean,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Project", projectSchema);
