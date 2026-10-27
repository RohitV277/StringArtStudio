import { useEffect, useRef } from 'react';
import { STUDIO_HTML } from './studioMarkup.ts';
import { startStudio } from '../services/studioEngine.ts';
import './studio.css';

/** Mounts the studio markup once and starts the engine that binds to it. */
export default function Studio() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || el.dataset.ready) return;
    el.dataset.ready = '1';
    el.innerHTML = STUDIO_HTML;
    startStudio();
  }, []);
  return <div ref={ref} />;
}

// The engine binds to the DOM once, so reload the page when this file changes in dev.
if (import.meta.hot) import.meta.hot.accept(() => location.reload());
