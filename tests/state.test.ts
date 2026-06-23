import { describe, it, expect, beforeEach } from 'vitest';
import { Context } from '../src/core/context';

describe('Context', () => {
  let ctx: Context;

  beforeEach(() => {
    ctx = new Context();
  });

  it('should add and retrieve messages', () => {
    ctx.add({ role: 'user', content: 'hi', timestamp: Date.now() });
    const all = ctx.getAll();
    expect(all.length).toBe(1);
    expect(all[0].content).toBe('hi');
  });

  it('should evict oldest messages when exceeding max', () => {
    for (let i = 0; i < 150; i++) {
      ctx.add({ role: 'user', content: `msg-${i}`, timestamp: Date.now() });
    }
    expect(ctx.size()).toBe(100);
    const all = ctx.getAll();
    expect(all[0].content).toBe('msg-50');
  });

  it('should clear all messages', () => {
    ctx.add({ role: 'user', content: 'hi', timestamp: Date.now() });
    ctx.clear();
    expect(ctx.size()).toBe(0);
  });
});
