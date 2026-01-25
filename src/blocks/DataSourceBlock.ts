import { Block, BlockDefinition } from "../types/Block";
import { blockRegistry } from "./registry";

/**
 * DataSourceBlock - Loads data from external sources
 * Supports: JSON files, CSV, API endpoints, mock data
 * Type: "json", "csv", "api", "mock"
 */
const dataSourceBlockDefinition: BlockDefinition = {
  type: "datasource",
  label: "Data Source",
  description: "Load data from external sources",
  defaultConfig: {
    sourceType: "mock",
    url: "",
    format: "json",
  },

  execute: async (block: Block, input: any): Promise<any> => {
    const { sourceType = "mock", url = "", format = "json" } = block.config;

    try {
      switch (sourceType) {
        case "json": {
          if (!url) {
            throw new Error("URL is required for JSON data source");
          }
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(
              `Failed to fetch JSON: ${response.status} ${response.statusText}`,
            );
          }
          return await response.json();
        }

        case "csv": {
          if (!url) {
            throw new Error("URL is required for CSV data source");
          }
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(
              `Failed to fetch CSV: ${response.status} ${response.statusText}`,
            );
          }
          const csvText = await response.text();
          return parseCSV(csvText);
        }

        case "api": {
          if (!url) {
            throw new Error("URL is required for API data source");
          }
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(
              `API request failed: ${response.status} ${response.statusText}`,
            );
          }
          return await response.json();
        }

        case "mock": {
          // Return mock sample data
          return {
            status: "success",
            data: [
              {
                id: 1,
                name: "Sample Item 1",
                value: 100,
              },
              {
                id: 2,
                name: "Sample Item 2",
                value: 200,
              },
              {
                id: 3,
                name: "Sample Item 3",
                value: 300,
              },
            ],
            timestamp: new Date().toISOString(),
          };
        }

        default:
          throw new Error(`Unknown source type: ${sourceType}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Data source failed: ${error.message}`);
      }
      throw new Error("Data source failed");
    }
  },
};

/**
 * Simple CSV parser - converts CSV text to array of objects
 */
function parseCSV(csvText: string): any[] {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0].split(",").map((h) =>
    h
      .trim()
      .toLowerCase()
      .replace(/^"(.*)"$/, "$1"),
  );
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i]
      .split(",")
      .map((v) => v.trim().replace(/^"(.*)"$/, "$1"));
    const row: any = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || null;
    });

    data.push(row);
  }

  return data;
}

// Register the block
blockRegistry.register(dataSourceBlockDefinition);

export default dataSourceBlockDefinition;
