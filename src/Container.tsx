// Ported from marquesgabriel.github.io's src/components/Container.tsx —
// that version also switches window-chrome visibility per theme
// (activeStyle prop); mtg only has one theme, so this is a trimmed copy
// that always renders the win98 titlebar buttons rather than carrying
// the multi-theme branching mtg doesn't need.
import { ReactNode } from 'react';

interface PropTypes {
  classes?: string;
  children: ReactNode;
  title: string;
  barButtons?: 'full' | 'close-only';
}

export default function Container({
  classes = '',
  children,
  title,
  barButtons = 'full',
}: PropTypes) {
  return (
    <div className={`container-wrapper ${classes}`}>
      <div className="title">
        {barButtons === 'close-only' ? (
          <div className="close-btn" />
        ) : (
          <>
            <div className="minimize-btn" />
            <div className="maximize-btn" />
            <div className="close-btn" />
          </>
        )}
        {title}
      </div>
      <div className="c-container">{children}</div>
    </div>
  );
}
