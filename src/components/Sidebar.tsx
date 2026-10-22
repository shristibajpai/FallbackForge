import React from 'react';
import {
  Activity,
  Workflow,
  Terminal,
  History,
  FileCode,
  Settings,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { ScreenId } from '../types';

interface SidebarProps {
  activeScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  ollamaConnected: boolean;
  demoMode: boolean;
}

interface NavItem {
  id: ScreenId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'planner', label: 'Recovery Planner', icon: Workflow },
  { id: 'simulator', label: 'Failure Simulator', icon: Terminal },
  { id: 'history', label: 'Recovery History', icon: History },
  { id: 'skills', label: 'Agent Skills', icon: FileCode, badge: 'v1.2' },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeScreen,
  onSelectScreen,
  ollamaConnected,
  demoMode
}) => {
  return (
    <aside className="w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] flex flex-col shrink-0 select-none transition-colors">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-[var(--border-subtle)] gap-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent)] shadow-2xs">
          <Flame className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
            FallbackForge
          </span>
          <span className="text-[11px] text-[var(--text-muted)] tracking-wide">
            Resilience Engine
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-mono">
          Navigation
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectScreen(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-l-2 border-[var(--accent)] pl-2.5 shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Engine Status Block */}
      <div className="p-3 mx-3 mb-4 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[var(--text-muted)]">Agent Skill</span>
          <span className="text-[var(--accent)] font-mono text-[10px] flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            LOADED
          </span>
        </div>
        <div className="text-xs font-mono text-[var(--text-primary)] truncate">
          api-recovery.md
        </div>
        <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px]">
          <span className="text-[var(--text-muted)]">Runtime Mode</span>
          <span className="text-[var(--text-secondary)] font-mono">
            {demoMode ? 'Demo / Deterministic' : 'Ollama Gemma'}
          </span>
        </div>
      </div>

      {/* User / Build Footer */}
      <div className="px-4 py-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>Local Vault</span>
        </div>
        <span className="font-mono text-[10px]">v1.0.4</span>
      </div>
    </aside>
  );
};
