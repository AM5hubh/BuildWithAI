// Import all blocks to ensure they are registered
import "./PromptBlock/PromptBlock";
import "./ModelBlock/ModelBlock";
import "./OutputBlock/OutputBlock";
import "./ToolsBlock/ToolBlock";
import "./MemoryBlock/MemoryBlock";
import "./DataSourceBlock";
import "./TextFormatterBlock";
import "./TextExtractorBlock";
import "./WebSearchBlock";
import "./ConditionBlock";
import "./FileReaderBlock";

export { blockRegistry } from "./registry";
