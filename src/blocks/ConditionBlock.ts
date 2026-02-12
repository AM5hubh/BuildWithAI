import { Block, BlockDefinition } from "../types/Block";
import { blockRegistry } from "./registry";

/**
 * ConditionBlock - Evaluate a condition and return a branch result
 * Outputs: { result, value, branch }
 */
const conditionBlockDefinition: BlockDefinition = {
  type: "condition",
  label: "Condition",
  description: "Evaluate a condition and choose true/false branch output",
  defaultConfig: {
    operator: "equals",
    compareValue: "",
    ifTrueValue: "",
    ifFalseValue: "",
    caseSensitive: false,
  },

  
  execute: async (block: Block, input: any): Promise<any> => {
    const {
      operator = "equals",
      compareValue = "",
      ifTrueValue,
      ifFalseValue,
      caseSensitive = false,
    } = block.config;

    const leftValue = normalizeInput(input);
    const rightValue = parseConfigValue(compareValue);

    const result = evaluateCondition(
      operator,
      leftValue,
      rightValue,
      caseSensitive,
    );

    const value = result
      ? parseOptionalValue(ifTrueValue, input)
      : parseOptionalValue(ifFalseValue, input);

    return {
      result,
      value,
      branch: result ? "true" : "false",
    };
  },
};

function normalizeInput(input: any): any {
  if (input && typeof input === "object" && !Array.isArray(input)) {
    if ("value" in input) {
      return (input as { value: any }).value;
    }

    const keys = Object.keys(input);
    if (keys.length === 1) {
      return (input as Record<string, any>)[keys[0]];
    }
  }

  return input;
}

function parseOptionalValue(value: any, fallback: any): any {
  const parsed = parseConfigValue(value);
  if (parsed === undefined) {
    return fallback;
  }

  return parsed;
}

function parseConfigValue(value: any): any {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function evaluateCondition(
  operator: string,
  left: any,
  right: any,
  caseSensitive: boolean,
): boolean {
  switch (operator) {
    case "equals":
      return compareEquality(left, right, caseSensitive);

    case "notEquals":
      return !compareEquality(left, right, caseSensitive);

    case "contains":
      return containsValue(left, right, caseSensitive);

    case "notContains":
      return !containsValue(left, right, caseSensitive);

    case "greaterThan":
      return compareNumbers(left, right, (a, b) => a > b);

    case "lessThan":
      return compareNumbers(left, right, (a, b) => a < b);

    case "greaterThanOrEqual":
      return compareNumbers(left, right, (a, b) => a >= b);

    case "lessThanOrEqual":
      return compareNumbers(left, right, (a, b) => a <= b);

    case "exists":
      return left !== undefined && left !== null;

    case "isEmpty":
      return isEmpty(left);

    case "isNumber":
      return isNumeric(left);

    case "startsWith":
      return stringOperation(left, right, caseSensitive, (a, b) =>
        a.startsWith(b),
      );

    case "endsWith":
      return stringOperation(left, right, caseSensitive, (a, b) =>
        a.endsWith(b),
      );

    default:
      return compareEquality(left, right, caseSensitive);
  }
}

function compareEquality(a: any, b: any, caseSensitive: boolean): boolean {
  if (typeof a === "string" && typeof b === "string") {
    const [left, right] = normalizeCase(a, b, caseSensitive);
    return left === right;
  }

  const leftNumber = toNumberOrNull(a);
  const rightNumber = toNumberOrNull(b);
  if (leftNumber !== null && rightNumber !== null) {
    return leftNumber === rightNumber;
  }

  return a === b;
}

function compareNumbers(
  a: any,
  b: any,
  comparator: (left: number, right: number) => boolean,
): boolean {
  const leftNumber = toNumberOrNull(a);
  const rightNumber = toNumberOrNull(b);

  if (leftNumber === null || rightNumber === null) {
    return false;
  }

  return comparator(leftNumber, rightNumber);
}

function containsValue(a: any, b: any, caseSensitive: boolean): boolean {
  if (Array.isArray(a)) {
    return a.includes(b);
  }

  if (typeof a === "string") {
    return stringOperation(a, b, caseSensitive, (left, right) =>
      left.includes(right),
    );
  }

  return false;
}

function stringOperation(
  a: any,
  b: any,
  caseSensitive: boolean,
  comparator: (left: string, right: string) => boolean,
): boolean {
  if (a === undefined || a === null || b === undefined || b === null) {
    return false;
  }

  const [left, right] = normalizeCase(String(a), String(b), caseSensitive);
  return comparator(left, right);
}

function normalizeCase(
  left: string,
  right: string,
  caseSensitive: boolean,
): [string, string] {
  if (caseSensitive) {
    return [left, right];
  }

  return [left.toLowerCase(), right.toLowerCase()];
}

function toNumberOrNull(value: any): number | null {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

function isNumeric(value: any): boolean {
  return toNumberOrNull(value) !== null;
}

function isEmpty(value: any): boolean {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value === "string" || Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }

  return false;
}

// Register the block
blockRegistry.register(conditionBlockDefinition);

export default conditionBlockDefinition;
