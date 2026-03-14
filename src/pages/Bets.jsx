import { useState, useMemo } from 'react';
import './Users.css';

const mockBets = [
  { id: 1001, user: 'Raju Kumar', game: 'Cricket', amount: 500, odds: 1.85, status: 'pending', time: '10 min ago' },
  { id: 1002, user: 'Suresh Singh', game: 'Football', amount: 1200, odds: 2.10, status: 'won', time: '25 min ago' },
  { id: 1003, user: 'Amit Patel', game: 'Cricket', amount: 800, odds: 1.92, status: 'lost', time: '1 hr ago' },
  { id: 1004, user: 'Raju Kumar', game: 'Tennis', amount: 350, odds: 2.50, status: 'pending', time: '2 hr ago' },
];

export default function Bets() {
  const [bets] = useState(mockBets);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = statusFilter === 'all' ? bets : bets.filter((b) => b.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((b) => b.user.toLowerCase().includes(q) || b.game.toLowerCase().includes(q));
    }
    return list;
  }, [bets, statusFilter, search]);

  return (
    <div className="bets-page">
      <header className="page-header">
        <h1>Bets</h1>
        <p>Bets placed by your agents</p>
      </header>
      <div className="toolbar">
        <div className="filter-tabs">
          {['all', 'pending', 'won', 'lost'].map((f) => (
            <button
              key={f}
              type="button"
              className={statusFilter === f ? 'tab active' : 'tab'}
              onClick={() => setStatusFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Search by user or game..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Game</th>
              <th>Amount (₹)</th>
              <th>Odds</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-cell">No bets found</td>
              </tr>
            ) : (
              filtered.map((b) => (
              <tr key={b.id}>
                <td>#{b.id}</td>
                <td>{b.user}</td>
                <td>{b.game}</td>
                <td>{b.amount.toLocaleString('en-IN')}</td>
                <td>{b.odds}</td>
                <td>
                  <span className={`badge ${b.status}`}>{b.status}</span>
                </td>
                <td className="muted">{b.time}</td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
