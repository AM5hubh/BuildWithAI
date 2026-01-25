import { BlockType, BlockDefinition } from "../types/Block";

/**
 * Block Registry - Centralized registry for all block types
 * Uses the registry pattern for extensibility
 */
class BlockRegistry {
  private blocks: Map<BlockType, BlockDefinition> = new Map();

  register(definition: BlockDefinition): void {
    this.blocks.set(definition.type, definition);
  }

  get(type: BlockType): BlockDefinition | undefined {
    return this.blocks.get(type);
  }

  getAll(): BlockDefinition[] {
    return Array.from(this.blocks.values());
  }
}

export const blockRegistry = new BlockRegistry();
