/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { OverviewScreen } from './components/screens/OverviewScreen';
import { PlannerScreen } from './components/screens/PlannerScreen';
import { SimulatorScreen } from './components/screens/SimulatorScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { SkillsScreen } from './components/screens/SkillsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import {
  HistoryRecord,
  RecoveryPlan,
  RecoveryPlanConfig,
  ScreenId,
  SettingsConfig
} from './types';
import {
  INITIAL_HISTORY_RECORDS,
  INITIAL_SKILL_DATA,
  generateRecoveryPlan
} from './data/mockData';

const DEFAULT_CONFIG: RecoveryPlanConfig = {
  serviceName: 'Stripe Billing Webhook Relay',
  serviceDescription: 'Inbound asynchronous payment capture and subscription renewal webhook pipeline.',
  failureType: '429 Rate Limit (Too Many Requests)',
  maxRetries: 3,
  fallbackStrategy: 'Exponential Backoff + Full Jitter',
  respectRetryAfter: true
};

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('overview');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('fallbackforge_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  const [planConfig, setPlanConfig] = useState<RecoveryPlanConfig>(DEFAULT_CONFIG);
  const [activePlan, setActivePlan] = useState<RecoveryPlan | null>(() =>
    generateRecoveryPlan(DEFAULT_CONFIG, true)
  );
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>(INITIAL_HISTORY_RECORDS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [settings, setSettings] = useState<SettingsConfig>({
    ollamaConnected: true,
    ollamaModel: 'gemma2:9b',
    ollamaUrl: 'http://localhost:11434',
    demoMode: true,
    activeTheme: theme === 'dark' ? 'Monochrome + Sage Green (Dark)' : 'Monochrome + Sage Green (Light)',
    theme: theme,
    lastTestedAt: '09:14:02'
  });

  // Synchronize document attribute and localStorage on theme change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fallbackforge_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    setSettings((prev) => ({
      ...prev,
      theme: nextTheme,
      activeTheme: nextTheme === 'dark' ? 'Monochrome + Sage Green (Dark)' : 'Monochrome + Sage Green (Light)'
    }));
  };

  const handleUpdateSettings = (newSettings: SettingsConfig) => {
    if (newSettings.theme !== theme) {
      setTheme(newSettings.theme);
    }
    setSettings(newSettings);
  };

  const handleGeneratePlan = async (config: RecoveryPlanConfig) => {
    setIsGenerating(true);
    // Simulate generation latency (local Gemma / Deterministic synthesizer)
    await new Promise((r) => setTimeout(r, 650));

    const newPlan = generateRecoveryPlan(config, settings.demoMode);
    setActivePlan(newPlan);

    // Automatically append to history
    const newRecord: HistoryRecord = {
      id: 'rec-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      serviceName: config.serviceName || 'Target Service API',
      failureType: config.failureType,
      strategy: config.fallbackStrategy,
      result: 'RECOVERED',
      retriesUsed: Math.min(2, config.maxRetries),
      latencyMs: Math.floor(400 + Math.random() * 800),
      planSummary: `Synthesized plan addressing ${config.failureType} using ${config.fallbackStrategy}. Verified idempotency and jitter constraints.`
    };

    setHistoryRecords((prev) => [newRecord, ...prev]);
    setIsGenerating(false);
  };

  const handleRunSimulation = (config: RecoveryPlanConfig) => {
    setPlanConfig(config);
    setActiveScreen('simulator');
  };

  const handleDeleteRecord = (id: string) => {
    setHistoryRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleResetToDemo = () => {
    setHistoryRecords(INITIAL_HISTORY_RECORDS);
  };

  const handleClearHistory = () => {
    setHistoryRecords(INITIAL_HISTORY_RECORDS.slice(0, 2));
    setActivePlan(generateRecoveryPlan(DEFAULT_CONFIG, true));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors">
      {/* Persistent Left Sidebar */}
      <Sidebar
        activeScreen={activeScreen}
        onSelectScreen={setActiveScreen}
        ollamaConnected={settings.ollamaConnected}
        demoMode={settings.demoMode}
      />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Consistent Top Bar with Theme Toggle */}
        <TopNav
          activeScreen={activeScreen}
          ollamaConnected={settings.ollamaConnected}
          demoMode={settings.demoMode}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenSettings={() => setActiveScreen('settings')}
        />

        {/* Screen Switcher */}
        <main className="flex-1 overflow-hidden flex flex-col bg-[var(--bg-main)] transition-colors">
          {activeScreen === 'overview' && (
            <OverviewScreen onNavigate={setActiveScreen} />
          )}

          {activeScreen === 'planner' && (
            <PlannerScreen
              planConfig={planConfig}
              onChangeConfig={setPlanConfig}
              activePlan={activePlan}
              onGeneratePlan={handleGeneratePlan}
              onRunSimulation={handleRunSimulation}
              isGenerating={isGenerating}
              demoMode={settings.demoMode}
            />
          )}

          {activeScreen === 'simulator' && (
            <SimulatorScreen />
          )}

          {activeScreen === 'history' && (
            <HistoryScreen
              historyRecords={historyRecords}
              onDeleteRecord={handleDeleteRecord}
              onResetToDemo={handleResetToDemo}
            />
          )}

          {activeScreen === 'skills' && (
            <SkillsScreen skill={INITIAL_SKILL_DATA} />
          )}

          {activeScreen === 'settings' && (
            <SettingsScreen
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onClearHistory={handleClearHistory}
              onToggleTheme={handleToggleTheme}
            />
          )}
        </main>
      </div>
    </div>
  );
}
