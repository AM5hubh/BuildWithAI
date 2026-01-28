import { Block, BlockDefinition } from "../types/Block";
import { blockRegistry } from "./registry";

/**
 * FileReaderBlock - Read files from URL or local filesystem
 * Supports: text, json, csv parsing, basic pdf text extraction
 */
const fileReaderBlockDefinition: BlockDefinition = {
  type: "fileReader",
  label: "File Reader",
  description: "Read and parse files from URL or upload",
  defaultConfig: {
    sourceType: "url", // 'url', 'upload', 'input'
    url: "",
    fileFormat: "text", // 'text', 'json', 'csv', 'pdf'
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
      if (fileFormat === "pdf") {
        const buffer = await resolveFileBuffer(sourceType, url, input);
        content = await extractTextFromPdf(buffer);
      } else {
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
        } else if (sourceType === "upload" && input) {
          content = await bufferToText(await toArrayBuffer(input));
        } else {
          throw new Error("File source not specified. Provide URL or input.");
        }
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

        case "pdf":
          return content; // already extracted text

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

async function fetchFileBuffer(url: string): Promise<ArrayBuffer> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    throw new Error(
      `Failed to fetch file: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

async function extractTextFromPdf(buffer: ArrayBuffer): Promise<string> {
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url"))
      .default;
    pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

    const loadingTask = pdfjs.getDocument({ data: buffer });
    const pdf = await loadingTask.promise;
    const pageTexts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const textItems = content.items
        .map((item: any) => ("str" in item ? item.str : ""))
        .join(" ");
      pageTexts.push(textItems);
    }

    return pageTexts.join("\n").trim();
  } catch (error) {
    throw new Error(
      `PDF extraction failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

async function toArrayBuffer(input: any): Promise<ArrayBuffer> {
  if (input instanceof ArrayBuffer) return input;
  if (input instanceof Uint8Array) return input.buffer as ArrayBuffer;
  if (typeof Blob !== "undefined" && input instanceof Blob) {
    return await input.arrayBuffer();
  }
  if (typeof File !== "undefined" && input instanceof File) {
    return await input.arrayBuffer();
  }
  if (typeof input === "string") {
    if (input.startsWith("data:")) {
      const base64 = input.split(",")[1];
      return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer;
    }
    // If it's a URL, fetch buffer
    if (input.startsWith("http://") || input.startsWith("https://")) {
      return await fetchFileBuffer(input);
    }
  }
  throw new Error(
    "Unsupported upload input. Provide a File, Blob, ArrayBuffer, or data URL.",
  );
}

async function resolveFileBuffer(
  sourceType: string,
  url: string,
  input: any,
): Promise<ArrayBuffer> {
  if (sourceType === "url" && url) {
    return await fetchFileBuffer(url);
  }
  if (sourceType === "upload" && input) {
    return await toArrayBuffer(input);
  }
  if (sourceType === "input" && input) {
    if (typeof input === "string") {
      if (input.startsWith("http://") || input.startsWith("https://")) {
        return await fetchFileBuffer(input);
      }
      if (input.startsWith("data:")) {
        return await toArrayBuffer(input);
      }
    }
    if (input instanceof ArrayBuffer || input instanceof Uint8Array) {
      return await toArrayBuffer(input);
    }
  }
  throw new Error("File source not specified for PDF. Provide URL or upload.");
}

async function bufferToText(buffer: ArrayBuffer): Promise<string> {
  return new TextDecoder().decode(buffer);
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
