import { describe, it, expect } from 'vitest';
import { CoinGeckoClient } from '../src/data/coingecko';

describe('CoinGeckoClient', () => {
  it('should convert symbol to id', () => {
    const client = new CoinGeckoClient();
    // 通过 prototype 访问私有方法
    const id1 = (client as any).symbolToId('BTC');
    expect(id1).toBe('bitcoin');

    const id2 = (client as any).symbolToId('BTC/USDT');
    expect(id2).toBe('bitcoin');

    const id3 = (client as any).symbolToId('eth');
    expect(id3).toBe('ethereum');
  });

  it('should handle unknown symbol', () => {
    const client = new CoinGeckoClient();
    const id = (client as any).symbolToId('UNKNOWN');
    expect(id).toBe('unknown');
  });
});
