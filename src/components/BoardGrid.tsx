import type { ReactNode } from 'react';

export default function BoardGrid({
  n,
  cellPx,
  children,
}: {
  n: number;
  cellPx: number;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${n}, ${cellPx}px)`,
        gap: '6px',
        width: 'max-content',
      }}
    >
      {children}
    </div>
  );
}
