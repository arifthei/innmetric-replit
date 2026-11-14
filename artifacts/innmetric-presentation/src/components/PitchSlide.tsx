import type { ReactNode } from 'react';

type PitchSlideProps = {
  number: 1 | 2 | 3 | 4;
  pillar: string;
  theme?: 'paper' | 'wash' | 'teal';
  children: ReactNode;
};

export default function PitchSlide({
  number,
  pillar,
  theme = 'paper',
  children,
}: PitchSlideProps) {
  return (
    <div className="pitch-stage w-screen h-screen">
      <article className={`pitch-canvas pitch-${theme}`}>
        <div className="pitch-layout">
          <header className="pitch-header">
            <span className="pitch-brand">innmetric</span>
            <span className="pitch-pillar">{pillar}</span>
          </header>
          {children}
          <footer className="pitch-footer">
            <span>Tourism programme proposal</span>
            <span>{String(number).padStart(2, '0')} / 04</span>
          </footer>
        </div>
      </article>
    </div>
  );
}
