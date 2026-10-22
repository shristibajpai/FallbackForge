import React from 'react';
import { ChevronRight, GitFork, Cpu, Sun, Moon } from 'lucide-react';
import { ScreenId } from '../types';

interface TopNavProps {
  activeScreen: ScreenId;
  ollamaConnected: boolean;
  demoMode: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

const SCREEN_TITLES: Record<ScreenId, string> = {
  overview: 'Overview',
  planner: 'API Recovery Planner',
  simulator: 'API Failure Simulator',
  history: 'Recovery History',
  skills: 'Agent Skills',
  settings: 'Settings'
};

export const TopNav: React.FC<TopNavProps> = ({
  activeScreen,
  ollamaConnected,
  demoMode,
  theme,
  onToggleTheme,
  onOpenSettings
}) => {
  return (
    <header className="h-16 bg-[var(--bg-main)] border-b border-[var(--border-subtle)] px-6 flex items-center justify-between shrink-0 transition-colors">
      {/* Breadcrumb Trail */}
      <div className="flex items-center gap-2 text-xs">
        <span
          onClick={() => onOpenSettings()}
          className="text-[var(--text-muted)] font-mono hover:text-[var(--text-primary)] cursor-pointer transition-colors"
        >
          FallbackForge
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
        <span className="text-[var(--text-primary)] font-medium tracking-tight">
          {SCREEN_TITLES[activeScreen]}
        </span>
      </div>

      {/* Status & Actions Zone */}
      <div className="flex items-center gap-2.5">
        {/* Working Light/Dark Mode Toggle Button */}
        <button
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg-panel)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] hover:border-[var(--accent)] text-xs font-mono text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="hidden sm:inline text-[11px]">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="hidden sm:inline text-[11px]">Dark Mode</span>
            </>
          )}
        </button>

        {/* Local Development Tag */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-secondary)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
          <span>LOCAL DEVELOPMENT</span>
        </div>

        {/* Model Status */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--bg-panel)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent)] text-[11px] font-mono text-[var(--text-primary)] transition-all cursor-pointer"
          title="Configure local model runtime"
        >
          <Cpu className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>{demoMode ? 'Gemma (Demo)' : 'Gemma via Ollama'}</span>
        </button>

        {/* GitHub / Repository Link */}
        <a
          href="https://github.com/fallbackforge/fallback-planner"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded bg-[var(--bg-panel)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <GitFork className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>github.com</span>
        </a>
      </div>
    </header>
  );
};
