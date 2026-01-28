import { Block, BlockDefinition } from "../types/Block";
import { blockRegistry } from "./registry";

/**
 * TextExtractorBlock - extracts text via regex or between delimiters.
 */
const textExtractorBlockDefinition: BlockDefinition = {
  type: "textExtractor",
  label: "Text Extractor",
  description: "Extract text using regex or delimiters",
  defaultConfig: {
    extractionType: "regex",
    pattern: "(?<=Summary: ).*",
    startDelimiter: "",
    endDelimiter: "",
  },

  execute: async (block: Block, input: any): Promise<any> => {
    const {
      extractionType = "regex",
      pattern = "(?<=Summary: ).*",
      startDelimiter = "",
      endDelimiter = "",
    } = block.config;

    const text = typeof input === "string" ? input : JSON.stringify(input);

    if (!text || text.trim() === "") {
      return "";
    }

    if (extractionType === "regex") {
      try {
        const regex = new RegExp(pattern, "i");
        const match = regex.exec(text);
        return match?.[1] ?? match?.[0] ?? "";
      } catch (error) {
        throw new Error(
          `Regex error: ${error instanceof Error ? error.message : "invalid pattern"}`,
        );
      }
    }

    if (extractionType === "between") {
      if (!startDelimiter || !endDelimiter) {
        throw new Error(
          "Start and end delimiters are required for 'between' extraction",
        );
      }
      const startIdx = text.indexOf(startDelimiter);
      if (startIdx === -1) return "";
      const afterStart = startIdx + startDelimiter.length;
      const endIdx = text.indexOf(endDelimiter, afterStart);
      if (endIdx === -1) return "";
      return text.slice(afterStart, endIdx).trim();
    }

    throw new Error(`Unsupported extraction type: ${extractionType}`);
  },
};

blockRegistry.register(textExtractorBlockDefinition);

export default textExtractorBlockDefinition;
