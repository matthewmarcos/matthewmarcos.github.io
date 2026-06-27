import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

export default function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="wrap">
      <Link to="/" className="back-link">← Arcade</Link>
      <h1 style={{ fontSize: 'clamp(1.2rem, 4vw, 2rem)', marginBottom: '0.5rem' }}>{title}</h1>
      {subtitle && <p className="status" style={{ marginBottom: '1.5rem' }}>{subtitle}</p>}
      {children}
    </div>
  );
}
