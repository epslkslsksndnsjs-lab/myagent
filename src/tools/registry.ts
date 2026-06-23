/**
 * 工具注册器 - 借鉴 Claude Code Tool.ts 思路,简化
 *
 * Claude Code Tool.ts: 29K 行(完整实现)
 * 我们:简化版(够 8 个工具用)
 */

import { logger } from '../utils/logger';

export interface Tool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  execute: (input: any) => Promise<any>;
}

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
    logger.debug(`Tool registered: ${tool.name}`);
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  list(): string[] {
    return Array.from(this.tools.keys());
  }

  async call(name: string, input: any): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    logger.debug(`Calling tool: ${name}`, input);

    try {
      const result = await tool.execute(input);
      logger.debug(`Tool ${name} returned:`, result);
      return result;
    } catch (error) {
      logger.error(`Tool ${name} failed:`, error);
      throw error;
    }
  }
}
