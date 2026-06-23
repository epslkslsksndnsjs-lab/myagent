import { useEffect, useState } from 'react';

interface Position {
  symbol: string;
  side: 'long' | 'short';
  amount: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPct: number;
}

interface Ticker {
  symbol: string;
  price: number;
  change24h: number;
}

export default function App() {
  const [tickers, setTickers] = useState<Ticker[]>([
    { symbol: 'BTC/USDT', price: 67432.18, change24h: 2.3 },
    { symbol: 'ETH/USDT', price: 3420.50, change24h: -1.1 },
    { symbol: 'SOL/USDT', price: 168.32, change24h: 5.2 },
  ]);

  const [positions, setPositions] = useState<Position[]>([
    { symbol: 'BTC/USDT', side: 'long', amount: 0.5, entryPrice: 65000, currentPrice: 67432, pnl: 1216, pnlPct: 3.74 },
    { symbol: 'ETH/USDT', side: 'short', amount: 5, entryPrice: 3500, currentPrice: 3420, pnl: 400, pnlPct: 2.28 },
    { symbol: 'SOL/USDT', side: 'long', amount: 100, entryPrice: 158, currentPrice: 168, pnl: 1000, pnlPct: 6.33 },
  ]);

  const [tickCount, setTickCount] = useState(1247);
  const [mode, setMode] = useState<'paper' | 'live'>('paper');
  const [running, setRunning] = useState(true);

  // 模拟 tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTickCount(t => t + 1);
      // 模拟价格变化
      setTickers(prev => prev.map(t => ({
        ...t,
        price: t.price * (1 + (Math.random() - 0.5) * 0.01),
        change24h: t.change24h + (Math.random() - 0.5) * 0.2,
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0);
  const totalValue = 10000 + totalPnl;

  return (
    <div className="container">
      <header>
        <h1>🤖 myagent</h1>
        <div className="subtitle">AI-powered quant trading agent · v0.2.0-alpha</div>
      </header>

      <div className="dashboard">
        <div className="card">
          <div className="card-title">总资产</div>
          <div className="card-value">${totalValue.toFixed(2)}</div>
          <div className={`card-change ${totalPnl >= 0 ? 'up' : 'down'}`}>
            {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)} ({(totalPnl / 10000 * 100).toFixed(2)}%)
          </div>
        </div>

        <div className="card">
          <div className="card-title">Tick 计数</div>
          <div className="card-value">{tickCount}</div>
          <div className="card-change">{running ? '🟢 运行中' : '🔴 停止'}</div>
        </div>

        <div className="card">
          <div className="card-title">模式</div>
          <div className="card-value" style={{ fontSize: '24px' }}>
            {mode === 'paper' ? '📄 Paper' : '💰 Live'}
          </div>
          <div className="card-change">5min tick · 7×24</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-title">📈 行情 (实时)</div>
        <table>
          <thead>
            <tr>
              <th>交易对</th>
              <th>价格</th>
              <th>24h 涨跌</th>
            </tr>
          </thead>
          <tbody>
            {tickers.map(t => (
              <tr key={t.symbol}>
                <td>{t.symbol}</td>
                <td>${t.price.toFixed(2)}</td>
                <td className={t.change24h >= 0 ? 'pnl up' : 'pnl down'}>
                  {t.change24h >= 0 ? '+' : ''}{t.change24h.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="positions">
        <div className="card-title">📊 持仓</div>
        <table>
          <thead>
            <tr>
              <th>交易对</th>
              <th>方向</th>
              <th>数量</th>
              <th>入场价</th>
              <th>当前价</th>
              <th>浮盈</th>
            </tr>
          </thead>
          <tbody>
            {positions.map(p => (
              <tr key={p.symbol}>
                <td>{p.symbol}</td>
                <td>{p.side === 'long' ? '🟢 多' : '🔴 空'}</td>
                <td>{p.amount}</td>
                <td>${p.entryPrice.toFixed(2)}</td>
                <td>${p.currentPrice.toFixed(2)}</td>
                <td className={`pnl ${p.pnl >= 0 ? 'up' : 'down'}`}>
                  {p.pnl >= 0 ? '+' : ''}${p.pnl.toFixed(2)} ({p.pnlPct.toFixed(2)}%)
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center', color: '#8b949e', fontSize: '12px' }}>
        5min tick 自动运行 · <a href="https://github.com/yourname/myagent" style={{ color: 'var(--accent)' }}>GitHub</a>
      </div>
    </div>
  );
}
