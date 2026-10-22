import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  Copy,
  Trash2,
  Check,
  X,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { HistoryRecord } from '../../types';

interface HistoryScreenProps {
  historyRecords: HistoryRecord[];
  onDeleteRecord: (id: string) => void;
  onResetToDemo: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  historyRecords,
  onDeleteRecord,
  onResetToDemo
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredRecords = historyRecords.filter((rec) => {
    const matchesSearch =
      rec.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.failureType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.strategy.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedFilter === 'ALL') return matchesSearch;
    return matchesSearch && rec.result === selectedFilter;
  });

  const handleCopy = (rec: HistoryRecord) => {
    const text = `FallbackForge Record: ${rec.id}\nService: ${rec.serviceName}\nFailure: ${rec.failureType}\nStrategy: ${rec.strategy}\nResult: ${rec.result}\nRetries: ${rec.retriesUsed}`;
    navigator.clipboard.writeText(text);
    setCopiedId(rec.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full transition-colors">
      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Recovery History
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Review past recovery plans and simulation results.
          </p>
        </div>

        <button
          onClick={onResetToDemo}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-panel)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>Reset Demo Records</span>
        </button>
      </div>

      {/* Demo Records Notification Strip */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 flex items-center justify-between text-xs shadow-2xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
          <span className="text-[var(--text-primary)] font-medium">RECOVERY RUNS</span>
          <span className="text-[var(--text-muted)]">·</span>
          <span className="text-[var(--text-secondary)]">Generated plans and simulation results, including sample records.</span>
        </div>
        <span className="text-[10px] font-mono text-[var(--text-muted)]">{historyRecords.length} ENTRIES</span>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search service, error, or strategy..."
            className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-[var(--accent)] rounded-lg pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-colors font-mono"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-[var(--accent)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] outline-none transition-colors font-mono cursor-pointer"
          >
            <option value="ALL">All Results ({historyRecords.length})</option>
            <option value="RECOVERED">Recovered (Success)</option>
            <option value="DEGRADED_CACHE">Degraded Cache</option>
            <option value="CIRCUIT_OPEN">Circuit Open</option>
            <option value="FAILOVER_SUCCESS">Failover Replica</option>
            <option value="FAILED_SAFELY">Failed Safely</option>
          </select>
        </div>
      </div>

      {/* Compact Data Table */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--bg-sidebar)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Service Name</th>
                <th className="py-3 px-4">Failure Type</th>
                <th className="py-3 px-4">Strategy</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]/40 font-mono">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => {
                  const isSuccess = record.result === 'RECOVERED';

                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-[var(--bg-hover)] transition-colors group text-[var(--text-primary)]"
                    >
                      {/* Date & Time */}
                      <td className="py-3 px-4 text-[var(--text-muted)] whitespace-nowrap text-[11px]">
                        {record.timestamp}
                      </td>

                      {/* Service Name */}
                      <td className="py-3 px-4 font-semibold text-[var(--text-primary)] max-w-[200px] truncate">
                        {record.serviceName}
                      </td>

                      {/* Failure Type */}
                      <td className="py-3 px-4 text-[var(--text-secondary)] text-[11px] max-w-[220px] truncate">
                        {record.failureType}
                      </td>

                      {/* Strategy */}
                      <td className="py-3 px-4 text-[var(--text-secondary)] text-[11px] max-w-[200px] truncate">
                        {record.strategy}
                      </td>

                      {/* Result Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            isSuccess
                              ? 'bg-[var(--bg-elevated)] text-[var(--accent)] border border-[var(--accent)]/40'
                              : 'bg-[var(--bg-panel)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
                          }`}
                        >
                          {record.result}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details */}
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="p-1.5 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                            title="View Plan Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Copy config */}
                          <button
                            onClick={() => handleCopy(record)}
                            className="p-1.5 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                            title="Copy Summary"
                          >
                            {copiedId === record.id ? (
                              <Check className="w-3.5 h-3.5 text-[var(--accent)]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => onDeleteRecord(record.id)}
                            className="p-1.5 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--text-muted)] font-sans">
                    No recovery records found matching filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-[#000000]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl max-w-xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  Recovery Record Details
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--accent)] font-semibold">
                  {selectedRecord.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)]">
                <div>
                  <span className="text-[var(--text-muted)] block text-[10px]">Service</span>
                  <span className="text-[var(--text-primary)] font-semibold">{selectedRecord.serviceName}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[10px]">Timestamp</span>
                  <span className="text-[var(--text-primary)]">{selectedRecord.timestamp}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[10px]">Failure</span>
                  <span className="text-[var(--text-secondary)]">{selectedRecord.failureType}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[10px]">Result</span>
                  <span className="text-[var(--accent)] font-bold">{selectedRecord.result}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[var(--text-muted)] text-[10px] uppercase">Plan Execution Summary</span>
                <p className="p-3 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-sans leading-relaxed">
                  {selectedRecord.planSummary}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex justify-between">
                  <span className="text-[var(--text-muted)]">Retries Used:</span>
                  <span className="text-[var(--accent)] font-bold">{selectedRecord.retriesUsed} attempts</span>
                </div>
                <div className="p-2.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex justify-between">
                  <span className="text-[var(--text-muted)]">Latency:</span>
                  <span className="text-[var(--text-primary)]">{selectedRecord.latencyMs}ms</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
