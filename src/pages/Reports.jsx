import { useState } from 'react';
import './Users.css';
import './Reports.css';

const mockDaily = { collection: 42500, payout: 28100, bets: 156, agentsActive: 8 };
const mockWeekly = { collection: 285000, payout: 192400, bets: 1042 };
const mockByGame = [
  { game: 'Cricket', bets: 89, collection: 18500, payout: 12200 },
  { game: 'Football', bets: 42, collection: 9800, payout: 7200 },
  { game: 'Tennis', bets: 25, collection: 14200, payout: 8700 },
];

export default function Reports() {
  const [range, setRange] = useState('today');

  const report = range === 'today' ? mockDaily : mockWeekly;
  const profit = (report.collection || 0) - (report.payout || 0);

  return (
    <div className="reports-page">
      <header className="page-header">
        <h1>Reports</h1>
        <p>Collection, payout and profit summary</p>
      </header>
      <div className="reports-toolbar">
        {['today', 'week'].map((r) => (
          <button
            key={r}
            type="button"
            className={range === r ? 'tab active' : 'tab'}
            onClick={() => setRange(r)}
          >
            {r === 'today' ? 'Today' : 'This Week'}
          </button>
        ))}
      </div>
      <div className="reports-summary">
        <div className="report-card">
          <span className="report-label">Collection (₹)</span>
          <span className="report-value green">₹{(report.collection || 0).toLocaleString('en-IN')}</span>
        </div>
        <div className="report-card">
          <span className="report-label">Payout (₹)</span>
          <span className="report-value red">₹{(report.payout || 0).toLocaleString('en-IN')}</span>
        </div>
        <div className="report-card">
          <span className="report-label">Profit / P&L (₹)</span>
          <span className={`report-value ${profit >= 0 ? 'green' : 'red'}`}>₹{profit.toLocaleString('en-IN')}</span>
        </div>
        {(report.bets != null || report.agentsActive != null) && (
          <div className="report-card">
            <span className="report-label">{range === 'today' ? 'Bets / Active agents' : 'Total Bets'}</span>
            <span className="report-value">{range === 'today' ? `${report.bets} / ${report.agentsActive}` : report.bets}</span>
          </div>
        )}
      </div>
      <section className="report-section">
        <h2>By Game</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Game</th>
                <th>Bets</th>
                <th>Collection (₹)</th>
                <th>Payout (₹)</th>
                <th>P&L (₹)</th>
              </tr>
            </thead>
            <tbody>
              {mockByGame.map((row) => {
                const pl = row.collection - row.payout;
                return (
                  <tr key={row.game}>
                    <td>{row.game}</td>
                    <td>{row.bets}</td>
                    <td>₹{row.collection.toLocaleString('en-IN')}</td>
                    <td>₹{row.payout.toLocaleString('en-IN')}</td>
                    <td className={pl >= 0 ? 'green' : 'red'}>₹{pl.toLocaleString('en-IN')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
