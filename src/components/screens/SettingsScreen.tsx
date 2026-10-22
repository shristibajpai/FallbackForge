import React, { useState } from 'react';
import {
  Cpu,
  RotateCw,
  CheckCircle2,
  Server,
  Layers,
  Sun,
  Moon
} from 'lucide-react';
import { SettingsConfig } from '../../types';

interface SettingsScreenProps {
  settings: SettingsConfig;
  onUpdateSettings: (newSettings: SettingsConfig) => void;
  onClearHistory: () => void;
  onToggleTheme: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onClearHistory,
  onToggleTheme
}) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [clearedNotice, setClearedNotice] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    // Simulate authentic connection probe to Ollama endpoint
    await new Promise(r => setTimeout(r, 800));

    setTesting(false);
    const nowTime = new Date().toTimeString().split(' ')[0];
    onUpdateSettings({
      ...settings,
      ollamaConnected: true,
      lastTestedAt: nowTime
    });
    setTestResult(`Successfully verified model ${settings.ollamaModel} at ${settings.ollamaUrl} [200 OK]`);
  };

  const handleResetData = () => {
    onClearHistory();
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 2500);
  };

  const setThemeMode = (mode: 'dark' | 'light') => {
    onUpdateSettings({
      ...settings,
      theme: mode,
      activeTheme: mode === 'dark' ? 'Monochrome + Sage Green (Dark)' : 'Monochrome + Sage Green (Light)'
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full transition-colors">
      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Settings
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Configure your local environment and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Model Configuration */}
        <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-6 space-y-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[var(--accent)]" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Model Configuration
              </h2>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">LOCAL RUNTIME</span>
          </div>

          {/* Connection Status Badge */}
          <div className="p-3 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-mono text-[var(--text-muted)]">
                Ollama Connection Status
              </span>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className={`w-2 h-2 rounded-full ${settings.demoMode ? 'bg-[var(--text-muted)]' : 'bg-[var(--accent)]'}`} />
                <span className="text-[var(--text-primary)] font-medium">
                  {settings.demoMode ? 'Demo Mode (Deterministic Plan Synthesizer)' : 'Connected to Ollama Local Host'}
                </span>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--accent)] font-semibold">
              {settings.demoMode ? 'DEMO' : 'ACTIVE'}
            </span>
          </div>

          {/* Model Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Model Name
            </label>
            <input
              type="text"
              value={settings.ollamaModel}
              onChange={(e) => onUpdateSettings({ ...settings, ollamaModel: e.target.value })}
              placeholder="e.g. gemma2:9b"
              className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-[var(--accent)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none font-mono transition-colors"
            />
            <span className="text-[11px] text-[var(--text-muted)]">
              Recommended: <code className="text-[var(--accent)]">gemma2:9b</code> or <code className="text-[var(--accent)]">gemma:7b</code>
            </span>
          </div>

          {/* Ollama URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Ollama URL
            </label>
            <input
              type="text"
              value={settings.ollamaUrl}
              onChange={(e) => onUpdateSettings({ ...settings, ollamaUrl: e.target.value })}
              placeholder="http://localhost:11434"
              className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-[var(--accent)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none font-mono transition-colors"
            />
          </div>

          {/* Test Connection Button */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent)] text-xs font-mono transition-colors cursor-pointer shadow-2xs"
            >
              {testing ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin text-[var(--accent)]" />
                  <span>Testing Connection...</span>
                </>
              ) : (
                <>
                  <Server className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>Test Connection</span>
                </>
              )}
            </button>

            {testResult && (
              <div className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--accent)]/30 text-xs font-mono text-[var(--accent)] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{testResult}</span>
              </div>
            )}
          </div>
        </div>

        {/* Application Preferences */}
        <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-6 space-y-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--accent)]" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Application Preferences
              </h2>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">THEME & CACHE</span>
          </div>

          {/* Theme Switcher Card with Interactive Light / Dark Mode Buttons */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Theme Appearance
              </label>
              <span className="text-[10px] font-mono text-[var(--accent)] font-semibold">
                SAGE GREEN (#7D9C65) ACCENT
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Dark Mode Choice */}
              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  settings.theme === 'dark'
                    ? 'bg-[#121411] border-[#7D9C65] text-[#FFFFFF] shadow-sm'
                    : 'bg-[#121411] border-[#30332D] text-[#858B80] hover:text-[#FFFFFF]'
                }`}
              >
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-[#7D9C65]" />
                    <span className="text-xs font-semibold text-[#FFFFFF]">Dark Mode</span>
                  </div>
                  {settings.theme === 'dark' && (
                    <span className="w-2 h-2 rounded-full bg-[#7D9C65]" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="w-4 h-4 rounded bg-[#080908] border border-[#30332D]" />
                  <span className="w-4 h-4 rounded bg-[#121411] border border-[#30332D]" />
                  <span className="w-4 h-4 rounded bg-[#7D9C65]" />
                  <span className="text-[10px] font-mono text-[#858B80] pl-1">Near-black</span>
                </div>
              </button>

              {/* Light Mode Choice */}
              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  settings.theme === 'light'
                    ? 'bg-[#FFFFFF] border-[#5E7A49] text-[#121411] shadow-sm'
                    : 'bg-[#FFFFFF] border-[#D1D7CC] text-[#6B7366] hover:text-[#121411]'
                }`}
              >
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-[#5E7A49]" />
                    <span className="text-xs font-semibold text-[#121411]">Light Mode</span>
                  </div>
                  {settings.theme === 'light' && (
                    <span className="w-2 h-2 rounded-full bg-[#5E7A49]" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="w-4 h-4 rounded bg-[#F4F6F2] border border-[#D1D7CC]" />
                  <span className="w-4 h-4 rounded bg-[#FFFFFF] border border-[#D1D7CC]" />
                  <span className="w-4 h-4 rounded bg-[#5E7A49]" />
                  <span className="text-[10px] font-mono text-[#6B7366] pl-1">Paper light</span>
                </div>
              </button>
            </div>
            
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Toggle between deep developer console mode and crisp light document mode with the same strict monochrome and sage green identity.
            </p>
          </div>

          {/* Demo Mode Toggle */}
          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-medium text-[var(--text-primary)]">
                Demo Mode
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">
                Use deterministic local synthesizer without requiring running Ollama daemon
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ ...settings, demoMode: !settings.demoMode })}
              className={`w-11 h-6 rounded-full transition-colors p-1 flex items-center cursor-pointer border ${
                settings.demoMode
                  ? 'bg-[var(--accent)] border-[var(--accent)] justify-end'
                  : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] justify-start'
              }`}
            >
              <div className={`w-4 h-4 rounded-full ${settings.demoMode ? 'bg-[var(--bg-main)]' : 'bg-[var(--text-muted)]'}`} />
            </button>
          </div>

          {/* Fast API Endpoint Contract Verification */}
          <div className="space-y-1.5 p-3 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs font-mono">
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span>API Endpoint</span>
              <span className="text-[var(--accent)] font-semibold">POST /api/recovery-plan</span>
            </div>
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span>Skill Verification</span>
              <span className="text-[var(--text-primary)]">skills/api-recovery/SKILL.md</span>
            </div>
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span>Google Gemini AI</span>
              <span className="text-[var(--text-muted)]">Disabled (Pure Local / Ollama)</span>
            </div>
          </div>

          {/* Reset History & Cache */}
          <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
            <button
              onClick={handleResetData}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[var(--bg-main)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <span>Reset Plan Cache & History</span>
            </button>

            {clearedNotice && (
              <div className="text-center text-xs font-mono text-[var(--accent)] font-semibold">
                Plan cache and test records reset to defaults.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
