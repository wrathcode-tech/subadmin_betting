import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import './Users.css';

const envGames = process.env.REACT_APP_GAMES;
const gamesList = envGames
  ? envGames.split(',').map((g) => g.trim()).filter(Boolean)
  : ['Cricket', 'Football', 'Tennis', 'Horse Racing', 'Kabaddi'];

const mockStats = {
  Cricket: { bets: 245, volume: 125000 },
  Football: { bets: 180, volume: 89000 },
  Tennis: { bets: 92, volume: 45000 },
  'Horse Racing': { bets: 156, volume: 210000 },
  Kabaddi: { bets: 78, volume: 32000 },
};

const mockEvents = {
  Cricket: [
    { id: 1, match: 'India vs Australia', odds: '1.85 - 2.00', time: '7:30 PM' },
    { id: 2, match: 'England vs South Africa', odds: '1.92 - 1.90', time: '11:00 PM' },
  ],
  Football: [
    { id: 1, match: 'Team A vs Team B', odds: '2.10 - 3.20 - 3.50', time: '8:00 PM' },
    { id: 2, match: 'Club X vs Club Y', odds: '1.75 - 4.00 - 4.20', time: '10:30 PM' },
  ],
  Tennis: [
    { id: 1, match: 'Player 1 vs Player 2', odds: '1.65 - 2.25', time: '6:00 PM' },
  ],
  'Horse Racing': [
    { id: 1, match: 'Race 1 - Mumbai Derby', odds: '3.00 - 5.50 - 8.00', time: '4:00 PM' },
  ],
  Kabaddi: [
    { id: 1, match: 'Patna vs Jaipur', odds: '1.80 - 2.05', time: '9:00 PM' },
  ],
};

export default function Games() {
  const { showToast } = useToast();
  const [eventsGame, setEventsGame] = useState(null);

  const events = eventsGame ? (mockEvents[eventsGame] || []) : [];

  return (
    <div className="games-page">
      <header className="page-header">
        <h1>Games</h1>
        <p>Betting games and events under your panel</p>
      </header>
      <div className="games-grid">
        {gamesList.map((game) => {
          const stat = mockStats[game] || { bets: 0, volume: 0 };
          return (
            <div key={game} className="game-card">
              <span className="game-icon">🎮</span>
              <h3>{game}</h3>
              <div className="game-stats">
                <span>Bets: {stat.bets}</span>
                <span>Volume: ₹{stat.volume.toLocaleString('en-IN')}</span>
              </div>
              <div className="game-actions">
                <button type="button" className="btn-sm" onClick={() => setEventsGame(game)}>
                  Events / Matches
                </button>
                <button type="button" className="btn-sm" onClick={() => showToast(`${game} odds loaded`, 'info')}>
                  View odds
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {eventsGame && (
        <Modal title={`${eventsGame} – Events & Matches`} onClose={() => setEventsGame(null)}>
          <div className="events-list">
            {events.length === 0 ? (
              <p className="muted">No events at the moment.</p>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="event-row">
                  <div className="event-match">{ev.match}</div>
                  <div className="event-odds">{ev.odds}</div>
                  <div className="event-time muted">{ev.time}</div>
                </div>
              ))
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
