import { Block, BlockDefinition } from "../types/Block";
import { blockRegistry } from "./registry";

/**
 * FileReaderBlock - Read files from URL or local filesystem
 * Supports: text, json, csv parsing
 */
const fileReaderBlockDefinition: BlockDefinition = {
  type: "fileReader",
  label: "File Reader",
  description: "Read and parse files from URL or upload",
  defaultConfig: {
    sourceType: "url", // 'url', 'upload', 'input'
    url: "",
    fileFormat: "text", // 'text', 'json', 'csv'
    encoding: "utf-8",
    csvDelimiter: ",",
    parseJson: true,
  },

  execute: async (block: Block, input: any): Promise<any> => {
    const {
      sourceType = "url",
      url = "",
      fileFormat = "text",
      csvDelimiter = ",",
      parseJson = true,
    } = block.config;

    try {
      let content: string;

      // Determine the source of file content
      if (sourceType === "url" && url) {
        content = await fetchFileFromUrl(url);
      } else if (sourceType === "input" && input) {
        // Use input as file content (could be a file path or content)
        if (typeof input === "string") {
          // If input looks like a URL, fetch it
          if (input.startsWith("http://") || input.startsWith("https://")) {
            content = await fetchFileFromUrl(input);
          } else {
            content = input;
          }
        } else {
          content = JSON.stringify(input);
        }
      } else {
        throw new Error("File source not specified. Provide URL or input.");
      }

      // Parse content based on file format
      switch (fileFormat) {
        case "json":
          if (parseJson) {
            return JSON.parse(content);
          }
          return content;

        case "csv":
          return parseCsv(content, csvDelimiter);

        case "text":
        default:
          return content;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`File reading failed: ${error.message}`);
      }
      throw new Error("File reading failed");
    }
  },
};

/**
 * Fetch file content from URL
 */
async function fetchFileFromUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");

    // Handle JSON responses
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return typeof data === "string" ? data : JSON.stringify(data);
    }

    // Handle text responses
    return await response.text();
  } catch (error) {
    throw new Error(
      `Failed to fetch file: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Parse CSV content into array of objects
 */
function parseCsv(content: string, delimiter: string = ","): any[] {
  try {
    const lines = content.split("\n").filter((line) => line.trim() !== "");

    if (lines.length === 0) {
      return [];
    }

    // Use first line as headers
    const headers = lines[0].split(delimiter).map((h) => h.trim());
    const data = [];

    // Parse each data line
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter).map((v) => v.trim());
      const row: Record<string, string> = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });

      data.push(row);
    }

    return data;
  } catch (error) {
    throw new Error(
      `CSV parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Register the block
blockRegistry.register(fileReaderBlockDefinition);

export default fileReaderBlockDefinition;
