import React, { useState } from 'react';
import {
  FileCode,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Eye,
  X
} from 'lucide-react';
import { AgentSkillData } from '../../types';

interface SkillsScreenProps {
  skill: AgentSkillData;
}

export const SkillsScreen: React.FC<SkillsScreenProps> = ({ skill }) => {
  const [activeTab, setActiveTab] = useState<'workflow' | 'markdown' | 'invariants'>('workflow');
  const [copied, setCopied] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCopySkill = () => {
    navigator.clipboard.writeText(skill.rawMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full transition-colors">
      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Agent Skills
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Manage reusable skills for consistent recovery planning.
          </p>
        </div>

        {/* View Full Skill Modal CTA */}
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--btn-primary-text)] font-semibold text-xs transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Skill Content</span>
        </button>
      </div>

      {/* Main Skill Card */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-6 space-y-6 shadow-2xs">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--border-subtle)] gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent)] shadow-2xs">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-[var(--text-primary)] tracking-tight">
                  {skill.name}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                  v{skill.version}
                </span>
              </div>
              <div className="text-xs font-mono text-[var(--text-muted)]">
                {skill.filePath}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status indicator: Sage Green Loaded & Verified */}
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-[var(--bg-elevated)] border border-[var(--accent)]/30 text-xs font-mono text-[var(--accent)] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <span>LOADED & VERIFIED</span>
            </div>

            <button
              onClick={handleCopySkill}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-main)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span className="text-[var(--accent)] font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SKILL.md</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Purpose Statement */}
        <div className="space-y-1.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg p-4">
          <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] tracking-wider">
            Declared Skill Purpose
          </span>
          <p className="text-xs text-[var(--text-primary)] leading-relaxed">
            {skill.purpose}
          </p>
        </div>

        {/* Skill Navigation Tabs */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--border-subtle)]">
            <button
              onClick={() => setActiveTab('workflow')}
              className={`pb-2 px-3 text-xs font-medium transition-colors border-b-2 cursor-pointer ${
                activeTab === 'workflow'
                  ? 'border-[var(--accent)] text-[var(--text-primary)]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              Workflow Steps (5)
            </button>

            <button
              onClick={() => setActiveTab('invariants')}
              className={`pb-2 px-3 text-xs font-medium transition-colors border-b-2 cursor-pointer ${
                activeTab === 'invariants'
                  ? 'border-[var(--accent)] text-[var(--text-primary)]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              Invariant Rules
            </button>

            <button
              onClick={() => setActiveTab('markdown')}
              className={`pb-2 px-3 text-xs font-medium transition-colors border-b-2 cursor-pointer ${
                activeTab === 'markdown'
                  ? 'border-[var(--accent)] text-[var(--text-primary)]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              Skill Content Preview
            </button>
          </div>

          {/* Tab 1: Workflow Steps */}
          {activeTab === 'workflow' && (
            <div className="space-y-3">
              {skill.workflowSteps.map((step) => (
                <div
                  key={step.step}
                  className="p-3.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] flex items-start gap-3.5"
                >
                  <div className="w-6 h-6 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--accent)] font-mono text-xs flex items-center justify-center shrink-0 font-semibold">
                    {step.step}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                      {step.name}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Invariants */}
          {activeTab === 'invariants' && (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[var(--text-primary)] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" />
                  <span>Non-Idempotent Request Guard</span>
                </div>
                <p className="text-[var(--text-secondary)] pl-6 text-[11px]">
                  Never retry mutating write operations (POST/PATCH) without idempotency key tokens.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[var(--text-primary)] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" />
                  <span>Mandatory Randomized Jitter</span>
                </div>
                <p className="text-[var(--text-secondary)] pl-6 text-[11px]">
                  Always decorrelate retry schedules by ±25% to disperse thundering herd stampedes.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[var(--text-primary)] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" />
                  <span>Maximum Backoff Ceiling</span>
                </div>
                <p className="text-[var(--text-secondary)] pl-6 text-[11px]">
                  Clamp sleep intervals at 30,000ms max to prevent indefinite worker thread blocking.
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Raw Markdown Preview */}
          {activeTab === 'markdown' && (
            <div className="relative rounded-lg overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-main)]">
              <pre className="p-4 text-xs font-mono text-[var(--text-primary)] overflow-x-auto leading-relaxed max-h-96">
                <code>{skill.rawMarkdown}</code>
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* View Skill Content Full Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-[#000000]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl max-w-3xl w-full p-6 space-y-4 shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  skills/api-recovery/SKILL.md
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--accent)]/30 text-[var(--accent)] font-semibold">
                  VERIFIED LOCAL
                </span>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg p-4">
              <pre className="text-xs font-mono text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                <code>{skill.rawMarkdown}</code>
              </pre>
            </div>

            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--text-muted)]">
                Path: /skills/api-recovery/SKILL.md
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySkill}
                  className="px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  {copied ? 'Copied' : 'Copy Content'}
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--btn-primary-text)] font-semibold text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
