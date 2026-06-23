import { describe, it, expect, beforeEach } from 'vitest';
import { ToolRegistry } from '../src/tools/registry';

describe('ToolRegistry', () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = new ToolRegistry();
  });

  it('should register and retrieve a tool', () => {
    const tool = {
      name: 'test_tool',
      description: 'Test tool',
      inputSchema: {},
      execute: async () => ({ ok: true }),
    };
    registry.register(tool);
    expect(registry.get('test_tool')).toBe(tool);
  });

  it('should list all registered tools', () => {
    const t1 = { name: 't1', description: '', inputSchema: {}, execute: async () => ({}) };
    const t2 = { name: 't2', description: '', inputSchema: {}, execute: async () => ({}) };
    registry.register(t1);
    registry.register(t2);
    expect(registry.list()).toEqual(['t1', 't2']);
  });

  it('should call tool and return result', async () => {
    const tool = {
      name: 'echo',
      description: 'Echo input',
      inputSchema: {},
      execute: async (input: any) => ({ echoed: input }),
    };
    registry.register(tool);
    const result = await registry.call('echo', { msg: 'hi' });
    expect(result.echoed.msg).toBe('hi');
  });

  it('should throw on unknown tool', async () => {
    await expect(registry.call('unknown', {})).rejects.toThrow('Tool not found: unknown');
  });
});
