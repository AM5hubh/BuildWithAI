import { Block, BlockDefinition, TextFormatterOperation } from "../types/Block";
import { blockRegistry } from "./registry";

/**
 * TextFormatterBlock - Format and transform text
 * Operations: uppercase, lowercase, trim, replace, split, join, template, capitalize
 */
const textFormatterBlockDefinition: BlockDefinition = {
  type: "textFormatter",
  label: "Text Formatter",
  description: "Format and transform text with various operations",
  defaultConfig: {
    textOperation: "uppercase", // 'uppercase', 'lowercase', 'trim', 'replace', 'capitalize', 'template'
    findText: "",
    replaceWith: "",
    separator: ",",
    textTemplate: "{input}",
  },

  execute: async (block: Block, input: any): Promise<any> => {
    const {
      textOperation: textOperationConfig,
      operation: legacyOperation,
      findText = "",
      replaceWith = "",
      separator = ",",
      textTemplate = "{input}",
      template: legacyTemplate,
    } = block.config;

    // Support legacy "operation" field for backwards compatibility
    const textOperation: TextFormatterOperation =
      (textOperationConfig as TextFormatterOperation) ||
      (legacyOperation as TextFormatterOperation) ||
      "uppercase";

    // Prefer new textTemplate, fallback to legacy template if present
    const templateToUse = textTemplate || legacyTemplate || "{input}";

    // Convert input to string
    const inputText = typeof input === "string" ? input : JSON.stringify(input);

    try {
      switch (textOperation) {
        case "uppercase":
          return inputText.toUpperCase();

        case "lowercase":
          return inputText.toLowerCase();

        case "trim":
          return inputText.trim();

        case "capitalize":
          return inputText
            .split(" ")
            .map(
              (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
            )
            .join(" ");

        case "replace":
          if (!findText) {
            throw new Error("Find text is required for replace operation");
          }
          return inputText.replace(new RegExp(findText, "g"), replaceWith);

        case "split":
          return inputText.split(separator || ",");

        case "join":
          if (Array.isArray(input)) {
            return input.join(separator || ",");
          }
          return inputText;

        case "template":
          // Replace {input} with actual input
          return templateToUse.replace(/\{input\}/g, inputText);

        case "length":
          return inputText.length;

        case "reverse":
          return inputText.split("").reverse().join("");

        case "removeSpaces":
          return inputText.replace(/\s+/g, "");

        case "slugify":
          return inputText
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");

        default:
          return inputText;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Text formatting failed: ${error.message}`);
      }
      throw new Error("Text formatting failed");
    }
  },
};

// Register the block
blockRegistry.register(textFormatterBlockDefinition);

export default textFormatterBlockDefinition;
