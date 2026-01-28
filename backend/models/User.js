import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
    },
    flows: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Flow",
      },
    ],
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    preferences: {
      defaultModel: {
        type: String,
        default: "meta-llama/llama-3.1-8b-instruct:free",
      },
      defaultApiEndpoint: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
