import { Link } from 'react-router-dom';

type Card = {
  to: string;
  emoji: string;
  title: string;
  blurb: string;
  tags: string[];
  external?: boolean;
};

const GAMES: Card[] = [
  {
    to: '/poop-patrol/',
    emoji: '💩',
    title: 'Poop Patrol',
    blurb: 'Splat-em-up chaos. Patrol the streets and clean up.',
    tags: ['arcade', 'reflex'],
    external: true,
  },
  {
    to: '/lights-out',
    emoji: '💡',
    title: 'Lights Out',
    blurb: 'Flip the grid to all-off. Watch it auto-solve or ask for a hint.',
    tags: ['puzzle', 'GF(2)'],
  },
  {
    to: '/sliding',
    emoji: '🧩',
    title: 'Sliding Puzzle',
    blurb: 'Classic 8/15-puzzle. Solve it yourself or let A* drive.',
    tags: ['puzzle', 'A*'],
  },
  {
    to: '/sliding-solver',
    emoji: '🔢',
    title: 'Sliding Solver',
    blurb: 'Type any board, get the exact list of tiles to click.',
    tags: ['tool', 'IDA*'],
  },
  {
    to: '/tic-tac-toe',
    emoji: '⭕',
    title: 'Tic-Tac-Toe',
    blurb: 'Play the unbeatable minimax computer. Good luck.',
    tags: ['minimax', 'AI'],
  },
];

export default function Landing() {
  return (
    <div className="wrap">
      <header style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 6vw, 3.5rem)' }}>
        <div className="pixel" style={{ color: 'var(--accent2)', fontSize: '0.7rem' }}>
          ▶ INSERT COIN
        </div>
        <h1 style={{ fontSize: 'clamp(1.6rem, 6vw, 3rem)', margin: '1rem 0 0.6rem' }}>
          Matthew's Arcade
        </h1>
        <p className="status">A pile of vibe-coded games. Now with solvers.</p>
      </header>
      <main
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {GAMES.map((g) => {
          const inner = (
            <>
              <div style={{ fontSize: '2.6rem' }}>{g.emoji}</div>
              <h2 style={{ fontSize: '1.3rem', margin: '0.85rem 0 0.35rem' }}>{g.title}</h2>
              <p className="status" style={{ margin: 0 }}>
                {g.blurb}
              </p>
              <div
                style={{ marginTop: '0.9rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}
              >
                {g.tags.map((t) => (
                  <span key={t} style={{ fontSize: '0.7rem', color: 'var(--accent2)' }}>
                    #{t}
                  </span>
                ))}
              </div>
            </>
          );
          const style = {
            background: 'var(--card)',
            border: '1px solid rgba(255,61,240,0.18)',
            borderRadius: '18px',
            padding: '1.4rem',
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
          } as const;
          return g.external ? (
            <a key={g.to} href={g.to} style={style}>
              {inner}
            </a>
          ) : (
            <Link key={g.to} to={g.to} style={style}>
              {inner}
            </Link>
          );
        })}
      </main>
      <footer
        style={{
          marginTop: '3rem',
          textAlign: 'center',
          color: 'var(--muted)',
          fontSize: '0.85rem',
        }}
      >
        Built for fun · hosted on GitHub Pages
      </footer>
    </div>
  );
}
