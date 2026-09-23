'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLoading } from './LoadingProvider';
import { AIOrb } from './ui/AIOrb';
import { Building, Calendar, Target, ArrowRight, X, Check, Sparkle } from './ui/icons';

interface InterviewSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Fallback roles if the company lookup somehow returns none.
const FALLBACK_ROLES = [
  'Software Engineer',
  'Senior Software Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Engineer',
  'Machine Learning Engineer',
];

const EXPERIENCE = [
  { value: '0', label: 'New Grad', hint: '0–1 yrs' },
  { value: '2', label: 'Junior', hint: '2–3 yrs' },
  { value: '4', label: 'Mid-level', hint: '4–6 yrs' },
  { value: '7', label: 'Senior', hint: '7–10 yrs' },
  { value: '11', label: 'Staff+', hint: '11+ yrs' },
];

type VerifyStatus = 'idle' | 'checking' | 'valid' | 'invalid';

export function InterviewSetupModal({ isOpen, onClose }: InterviewSetupModalProps) {
  const [company, setCompany] = useState('');
  const [experience, setExperience] = useState('');
  const [role, setRole] = useState('');
  const router = useRouter();
  const { setLoading, setLoadingMessage } = useLoading();

  // Company validation state
  const [status, setStatus] = useState<VerifyStatus>('idle');
  const [canonicalName, setCanonicalName] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [verifyMessage, setVerifyMessage] = useState('');

  const resetAll = useCallback(() => {
    setCompany('');
    setExperience('');
    setRole('');
    setStatus('idle');
    setCanonicalName('');
    setRoles([]);
    setVerifyMessage('');
  }, []);

  const handleClose = useCallback(() => {
    resetAll();
    onClose();
  }, [resetAll, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, handleClose]);

  // Typing in the company field invalidates any previous verification.
  const handleCompanyChange = (value: string) => {
    setCompany(value);
    if (status !== 'idle') {
      setStatus('idle');
      setCanonicalName('');
      setRoles([]);
      setRole('');
      setVerifyMessage('');
    }
  };

  const verifyCompany = async () => {
    const name = company.trim();
    if (!name || status === 'checking') return;

    setStatus('checking');
    setVerifyMessage('');
    setRoles([]);
    setRole('');

    try {
      const res = await fetch('/api/ai/company-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: name }),
      });

      if (!res.ok) {
        throw new Error('lookup failed');
      }

      const data = await res.json() as {
        valid: boolean;
        canonicalName: string;
        roles: string[];
        message?: string;
      };

      if (data.valid) {
        setStatus('valid');
        setCanonicalName(data.canonicalName || name);
        setRoles(data.roles && data.roles.length ? data.roles : FALLBACK_ROLES);
        setVerifyMessage('');
      } else {
        setStatus('invalid');
        setVerifyMessage(data.message || "We couldn't recognize that company. Check the spelling or try another.");
      }
    } catch {
      setStatus('invalid');
      setVerifyMessage("Couldn't verify that company right now. Check your connection and try again.");
    }
  };

  const handleStartInterview = () => {
    if (status !== 'valid' || !experience || !role) return;

    const interviewSetup = {
      company: { id: 'custom', name: canonicalName || company.trim() },
      experience: parseInt(experience),
      role,
      timestamp: Date.now(),
    };

    localStorage.setItem('interview_setup', JSON.stringify(interviewSetup));

    // Show the global loader immediately so there's no flash of the dashboard
    // while the /interview route mounts. The loader lives in the root layout,
    // so it persists across the client-side navigation.
    setLoadingMessage('MockOffer is checking past interview experiences...');
    setLoading(true);

    router.push('/interview');
    onClose();
  };

  if (!isOpen) return null;

  const isFormValid = status === 'valid' && !!experience && !!role;
  const expLabel = EXPERIENCE.find((e) => e.value === experience)?.label;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="card animate-scale-in max-h-[92vh] w-full max-w-lg overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Set up your mock interview"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b p-6" style={{ borderColor: 'var(--color-line)' }}>
          <div className="flex items-center gap-3">
            <AIOrb size={40} status="ready" />
            <div>
              <h2 className="text-lg font-semibold">Configure your session</h2>
              <p className="text-sm text-[color:var(--color-fg-subtle)]">
                We&rsquo;ll generate an on-pattern problem for this profile.
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="btn btn-ghost -mr-2 -mt-1 p-2" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-5 p-6">
          {/* Company */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[color:var(--color-fg-muted)]">
              <Building size={15} className="text-[color:var(--color-gold-bright)]" />
              Company
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={company}
                onChange={(e) => handleCompanyChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    verifyCompany();
                  }
                }}
                placeholder="e.g. Google, Stripe, Netflix…"
                className="field flex-1"
                autoFocus
                aria-invalid={status === 'invalid'}
              />
              <button
                type="button"
                onClick={verifyCompany}
                disabled={!company.trim() || status === 'checking'}
                className="btn btn-secondary shrink-0"
              >
                {status === 'checking' ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: 'var(--color-gold)', borderRightColor: 'var(--color-gold)' }} />
                    Checking
                  </>
                ) : status === 'valid' ? (
                  <>
                    <Check size={15} />
                    Verified
                  </>
                ) : (
                  'Verify'
                )}
              </button>
            </div>

            {status === 'valid' && (
              <div className="animate-fade-up mt-2 flex items-center gap-1.5 text-sm text-[color:var(--color-success)]">
                <Check size={14} />
                <span>
                  Verified <span className="font-medium">{canonicalName}</span>. Pick a role below.
                </span>
              </div>
            )}
            {status === 'invalid' && (
              <div className="animate-fade-up mt-2 text-sm text-[color:var(--color-danger)]">
                {verifyMessage}
              </div>
            )}
            {status === 'idle' && (
              <p className="mt-2 text-xs text-[color:var(--color-fg-subtle)]">
                Verify the company so MockOffer can tailor the roles and question.
              </p>
            )}
          </div>

          {/* Role (only after a valid company) */}
          {status === 'valid' && (
            <div className="animate-fade-up">
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[color:var(--color-fg-muted)]">
                <Target size={15} className="text-[color:var(--color-gold-bright)]" />
                Role at {canonicalName}
              </label>
              <div className="flex flex-wrap gap-2">
                {roles.map((r) => {
                  const selected = role === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className="rounded-lg border px-3 py-2 text-sm transition-all"
                      style={{
                        borderColor: selected ? 'var(--color-gold)' : 'var(--color-line-strong)',
                        background: selected ? 'rgba(230,178,74,0.08)' : 'var(--color-inset)',
                        color: selected ? 'var(--color-gold-bright)' : 'var(--color-fg)',
                      }}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Experience */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[color:var(--color-fg-muted)]">
              <Calendar size={15} className="text-[color:var(--color-gold-bright)]" />
              Experience level
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {EXPERIENCE.map((e) => {
                const selected = experience === e.value;
                return (
                  <button
                    key={e.value}
                    type="button"
                    onClick={() => setExperience(e.value)}
                    className="rounded-lg border px-3 py-2.5 text-left transition-all"
                    style={{
                      borderColor: selected ? 'var(--color-gold)' : 'var(--color-line-strong)',
                      background: selected ? 'rgba(230,178,74,0.08)' : 'var(--color-inset)',
                    }}
                  >
                    <div className="text-sm font-medium" style={{ color: selected ? 'var(--color-gold-bright)' : 'var(--color-fg)' }}>
                      {e.label}
                    </div>
                    <div className="mono text-xs text-[color:var(--color-fg-subtle)]">{e.hint}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {isFormValid && (
            <div
              className="animate-fade-up rounded-lg border p-3 text-sm"
              style={{ borderColor: 'rgba(230,178,74,0.24)', background: 'rgba(230,178,74,0.06)' }}
            >
              <span className="text-[color:var(--color-fg-muted)]">Preparing: </span>
              <span className="font-medium text-[color:var(--color-gold-bright)]">
                {role} at {canonicalName} · {expLabel}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t p-6" style={{ borderColor: 'var(--color-line)' }}>
          <button onClick={handleClose} className="btn btn-secondary flex-1">
            Cancel
          </button>
          <button onClick={handleStartInterview} disabled={!isFormValid} className="btn btn-primary flex-1">
            <Sparkle size={16} />
            Start interview
            <ArrowRight size={16} className="btn-arrow" />
          </button>
        </div>
      </div>
    </div>
  );
}
