'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { AppNav } from '../../components/AppNav';
import { AppBackground } from '../../components/ui/AppBackground';
import { InterviewSetupModal } from '../../components/InterviewSetupModal';
import { SessionDetails, StoredInterview } from '../../components/SessionDetails';
import { parseFeedback } from '../../lib/feedbackParser';
import {
  ArrowRight, Trash, Clock, Calendar, Building, History, Check,
  Gauge, Target, Activity, CheckCircle, XCircle, X, ChevronRight, Plus,
} from '../../components/ui/icons';

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}
function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { user } = useUser();
  const [pastInterviews, setPastInterviews] = useState<StoredInterview[]>([]);
  const [selected, setSelected] = useState<StoredInterview | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getStorageKey = () =>
    user?.id ? `mockoffer_interviews_${user.id}` : 'mockoffer_interviews';

  useEffect(() => {
    if (!user) return;
    const stored = localStorage.getItem(getStorageKey());
    if (stored) {
      try {
        const interviews = JSON.parse(stored) as StoredInterview[];
        setPastInterviews(interviews.sort((a, b) => b.timestamp - a.timestamp));
      } catch (error) {
        console.error('Error loading past interviews:', error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const confirmDelete = () => {
    localStorage.removeItem(getStorageKey());
    setPastInterviews([]);
    setSelected(null);
    setShowDeleteConfirm(false);
  };

  // ---- Real metrics derived from stored data ----
  const metrics = useMemo(() => {
    const total = pastInterviews.length;
    const parsed = pastInterviews.map((i) => parseFeedback(i.feedback || ''));
    const scores = parsed.map((p) => p.qualityScore).filter((s): s is number => s !== null);
    const avgQuality = scores.length
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : null;
    const correctCount = parsed.filter((p) => p.isCorrect).length;
    const correctRate = total ? Math.round((correctCount / total) * 100) : 0;
    const totalTime = pastInterviews.reduce((a, i) => a + (i.timeSpent || 0), 0);
    return { total, avgQuality, correctCount, correctRate, totalTime, scoresCount: scores.length };
  }, [pastInterviews]);

  const hasData = pastInterviews.length > 0;

  return (
    <div className="relative min-h-screen">
      <AppBackground />
      <AppNav />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">{greeting()}{user?.firstName ? `, ${user.firstName}` : ''}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Ready for your <span className="text-gradient-gold">next interview?</span>
            </h1>
            <p className="mt-3 max-w-lg text-[color:var(--color-fg-muted)]">
              Configure a session and MockOffer generates a fresh, on-pattern problem. Solve under
              pressure, then get an honest debrief.
            </p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-lg shrink-0">
            <Plus size={18} />
            Start interview
            <ArrowRight size={18} className="btn-arrow" />
          </button>
        </div>

        {/* Metrics */}
        {hasData && (
          <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile Icon={History} label="Interviews" value={String(metrics.total)} tint="var(--color-gold-bright)" />
            <StatTile
              Icon={Gauge}
              label="Avg code quality"
              value={metrics.avgQuality !== null ? `${metrics.avgQuality}` : '—'}
              suffix={metrics.avgQuality !== null ? '/10' : ''}
              tint="#8aa2ff"
            />
            <StatTile Icon={Check} label="Correct solutions" value={String(metrics.correctCount)} suffix={` / ${metrics.total}`} tint="#58c98b" />
            <StatTile Icon={Clock} label="Time practiced" value={formatTime(metrics.totalTime)} tint="#c99bff" />
          </div>
        )}

        {/* Performance snapshot */}
        {hasData && (metrics.avgQuality !== null || metrics.total > 0) && (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="card card-glow p-6">
              <div className="mb-4 flex items-center gap-2">
                <Activity size={16} className="text-[color:var(--color-gold-bright)]" />
                <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ letterSpacing: '0.08em' }}>
                  Performance snapshot
                </h3>
              </div>
              <div className="space-y-4">
                {metrics.avgQuality !== null && (
                  <Meter label="Average code quality" value={metrics.avgQuality * 10} display={`${metrics.avgQuality}/10`} color="var(--color-gold)" />
                )}
                <Meter label="Correct on first submit" value={metrics.correctRate} display={`${metrics.correctRate}%`} color="#58c98b" />
              </div>
              <p className="mt-4 text-xs text-[color:var(--color-fg-subtle)]">
                Based on {metrics.total} recorded session{metrics.total !== 1 ? 's' : ''}
                {metrics.scoresCount > 0 ? ` · ${metrics.scoresCount} scored by AI` : ''}.
              </p>
            </div>

            <div className="card card-glow flex flex-col justify-between p-6">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Target size={16} className="text-[color:var(--color-gold-bright)]" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ letterSpacing: '0.08em' }}>
                    Keep the streak going
                  </h3>
                </div>
                <p className="text-sm text-[color:var(--color-fg-muted)]">
                  Consistency beats cramming. One focused session a day compounds fast — vary the
                  company and difficulty to cover more ground.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="btn btn-secondary mt-5 self-start">
                New session
                <ArrowRight size={16} className="btn-arrow" />
              </button>
            </div>
          </div>
        )}

        {/* Recent interviews */}
        <div className="mt-12">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {hasData ? 'Interview history' : 'Interview history'}
            </h2>
            {hasData && (
              <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-ghost btn-sm text-[color:var(--color-fg-subtle)]">
                <Trash size={15} />
                <span className="hidden sm:inline">Clear all</span>
              </button>
            )}
          </div>

          {hasData ? (
            <div className="card overflow-hidden">
              {/* table header */}
              <div className="hidden grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b px-5 py-3 text-xs uppercase tracking-wide text-[color:var(--color-fg-subtle)] sm:grid" style={{ borderColor: 'var(--color-line)', letterSpacing: '0.08em' }}>
                <span>Problem</span>
                <span className="w-28">Company</span>
                <span className="w-24">Date</span>
                <span className="w-20">Duration</span>
                <span className="w-24 text-right">Result</span>
              </div>
              <ul>
                {pastInterviews.map((interview, idx) => {
                  const p = parseFeedback(interview.feedback || '');
                  return (
                    <li key={interview.id}>
                      <button
                        onClick={() => setSelected(interview)}
                        className="group grid w-full grid-cols-1 items-center gap-2 px-5 py-4 text-left transition-colors hover:bg-[color:var(--color-elevated)] sm:grid-cols-[1fr_auto_auto_auto_auto] sm:gap-4"
                        style={{ borderTop: idx === 0 ? 'none' : '1px solid var(--color-line)' }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--color-inset)', border: '1px solid var(--color-line)' }}>
                            <History size={16} className="text-[color:var(--color-gold-bright)]" />
                          </span>
                          <div className="min-w-0">
                            <div className="truncate font-medium">{interview.problemTitle}</div>
                            <div className="text-xs text-[color:var(--color-fg-subtle)] sm:hidden">
                              {formatDate(interview.timestamp)} · {formatTime(interview.timeSpent)}
                            </div>
                          </div>
                        </div>
                        <span className="hidden w-28 truncate text-sm text-[color:var(--color-fg-muted)] sm:block">
                          {interview.company && interview.company !== 'General' ? interview.company : '—'}
                        </span>
                        <span className="hidden w-24 text-sm text-[color:var(--color-fg-subtle)] sm:block">
                          {formatDate(interview.timestamp)}
                        </span>
                        <span className="hidden w-20 mono text-sm text-[color:var(--color-fg-subtle)] sm:block">
                          {formatTime(interview.timeSpent)}
                        </span>
                        <span className="flex w-24 items-center justify-start gap-2 sm:justify-end">
                          {p.isCorrect ? (
                            <CheckCircle size={16} className="text-[color:var(--color-success)]" />
                          ) : (
                            <XCircle size={16} className="text-[color:var(--color-danger)]" />
                          )}
                          {p.qualityScore !== null && (
                            <span className="mono text-sm text-[color:var(--color-gold-bright)]">{p.qualityScore}/10</span>
                          )}
                          <ChevronRight size={16} className="text-[color:var(--color-fg-faint)] transition-transform group-hover:translate-x-0.5 group-hover:text-[color:var(--color-fg-muted)]" />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <EmptyState onStart={() => setIsModalOpen(true)} />
          )}
        </div>
      </main>

      <InterviewSetupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <SessionDetails interview={selected} onClose={() => setSelected(null)} />

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}>
          <div className="card animate-scale-in w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: 'rgba(240,119,107,0.12)', color: 'var(--color-danger)' }}>
                <Trash size={20} />
              </span>
              <div>
                <h3 className="text-lg font-semibold">Clear all sessions?</h3>
                <p className="text-sm text-[color:var(--color-fg-subtle)]">This can&rsquo;t be undone.</p>
              </div>
            </div>
            <p className="mb-6 text-sm text-[color:var(--color-fg-muted)]">
              This permanently removes all {pastInterviews.length} recorded session
              {pastInterviews.length !== 1 ? 's' : ''}, including code and AI feedback.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary flex-1">Cancel</button>
              <button onClick={confirmDelete} className="btn btn-danger flex-1">Delete all</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatTile({
  Icon, label, value, suffix, tint,
}: {
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  suffix?: string;
  tint: string;
}) {
  return (
    <div className="card card-interactive p-5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: 'var(--color-inset)', border: '1px solid var(--color-line)', color: tint }}>
        <Icon size={17} />
      </span>
      <div className="mt-4 flex items-baseline gap-0.5">
        <span className="text-2xl font-semibold tracking-tight">{value}</span>
        {suffix && <span className="mono text-sm text-[color:var(--color-fg-subtle)]">{suffix}</span>}
      </div>
      <div className="mt-0.5 text-xs text-[color:var(--color-fg-subtle)]">{label}</div>
    </div>
  );
}

function Meter({ label, value, display, color }: { label: string; value: number; display: string; color: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-[color:var(--color-fg-muted)]">{label}</span>
        <span className="mono text-[color:var(--color-fg)]">{display}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--color-elevated)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
      </div>
    </div>
  );
}

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="card relative overflow-hidden p-10 text-center sm:p-16">
      <div className="bg-aurora" />
      <div className="relative mx-auto max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: 'var(--color-inset)', border: '1px solid var(--color-line)' }}>
          <History size={26} className="text-[color:var(--color-gold-bright)]" />
        </div>
        <h3 className="text-xl font-semibold">No sessions yet</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-[color:var(--color-fg-muted)]">
          Your interview history, code and AI feedback will show up here. Run your first mock
          interview to get started.
        </p>
        <button onClick={onStart} className="btn btn-primary mt-6">
          Start your first interview
          <ArrowRight size={16} className="btn-arrow" />
        </button>
      </div>
    </div>
  );
}
