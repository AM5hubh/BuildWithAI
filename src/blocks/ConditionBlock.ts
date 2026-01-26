import { Block, BlockDefinition } from "../types/Block";
import { blockRegistry } from "./registry";

/**
 * ConditionBlock - Conditional logic (if/else) based on input
 * Supports: equals, notEquals, contains, greaterThan, lessThan, exists, isEmpty
 */
const conditionBlockDefinition: BlockDefinition = {
  type: "condition",
  label: "Condition",
  description: "Execute conditional logic (if/else) on input",
  defaultConfig: {
    operator: "equals", // 'equals', 'notEquals', 'contains', 'greaterThan', 'lessThan', 'exists', 'isEmpty'
    compareValue: "",
    ifTrueValue: "true",
    ifFalseValue: "false",
    caseSensitive: false,
  },

  execute: async (block: Block, input: any): Promise<any> => {
    const {
      operator = "equals",
      compareValue = "",
      ifTrueValue = "true",
      ifFalseValue = "false",
      caseSensitive = false,
    } = block.config;

    try {
      let result = false;

      // Convert input to string for comparison
      const inputStr = String(input);
      const compareStr = String(compareValue);

      switch (operator) {
        case "equals":
          if (caseSensitive) {
            result = inputStr === compareStr;
          } else {
            result = inputStr.toLowerCase() === compareStr.toLowerCase();
          }
          break;

        case "notEquals":
          if (caseSensitive) {
            result = inputStr !== compareStr;
          } else {
            result = inputStr.toLowerCase() !== compareStr.toLowerCase();
          }
          break;

        case "contains":
          if (caseSensitive) {
            result = inputStr.includes(compareStr);
          } else {
            result = inputStr.toLowerCase().includes(compareStr.toLowerCase());
          }
          break;

        case "notContains":
          if (caseSensitive) {
            result = !inputStr.includes(compareStr);
          } else {
            result = !inputStr.toLowerCase().includes(compareStr.toLowerCase());
          }
          break;

        case "greaterThan":
          const inputNum = parseFloat(inputStr);
          const compareNum = parseFloat(compareStr);
          result =
            !isNaN(inputNum) && !isNaN(compareNum) && inputNum > compareNum;
          break;

        case "lessThan":
          const inputNum2 = parseFloat(inputStr);
          const compareNum2 = parseFloat(compareStr);
          result =
            !isNaN(inputNum2) && !isNaN(compareNum2) && inputNum2 < compareNum2;
          break;

        case "greaterThanOrEqual":
          const inputNum3 = parseFloat(inputStr);
          const compareNum3 = parseFloat(compareStr);
          result =
            !isNaN(inputNum3) &&
            !isNaN(compareNum3) &&
            inputNum3 >= compareNum3;
          break;

        case "lessThanOrEqual":
          const inputNum4 = parseFloat(inputStr);
          const compareNum4 = parseFloat(compareStr);
          result =
            !isNaN(inputNum4) &&
            !isNaN(compareNum4) &&
            inputNum4 <= compareNum4;
          break;

        case "exists":
          result = input !== null && input !== undefined && input !== "";
          break;

        case "isEmpty":
          result =
            input === null ||
            input === undefined ||
            input === "" ||
            (Array.isArray(input) && input.length === 0) ||
            (typeof input === "object" && Object.keys(input).length === 0);
          break;

        case "isNumber":
          result = !isNaN(parseFloat(inputStr)) && isFinite(Number(inputStr));
          break;

        case "startsWith":
          if (caseSensitive) {
            result = inputStr.startsWith(compareStr);
          } else {
            result = inputStr
              .toLowerCase()
              .startsWith(compareStr.toLowerCase());
          }
          break;

        case "endsWith":
          if (caseSensitive) {
            result = inputStr.endsWith(compareStr);
          } else {
            result = inputStr.toLowerCase().endsWith(compareStr.toLowerCase());
          }
          break;

        default:
          throw new Error(`Unknown operator: ${operator}`);
      }

      // Return the appropriate value based on condition result
      return result ? ifTrueValue : ifFalseValue;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Condition evaluation failed: ${error.message}`);
      }
      throw new Error("Condition evaluation failed");
    }
  },
};

// Register the block
blockRegistry.register(conditionBlockDefinition);

export default conditionBlockDefinition;
