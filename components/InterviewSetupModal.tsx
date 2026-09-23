'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AIOrb } from './ui/AIOrb';
import { Building, Calendar, Target, ArrowRight, X } from './ui/icons';

interface InterviewSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLES = [
  'Software Engineer',
  'Senior Software Engineer',
  'Staff Software Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Engineer',
  'Mobile Engineer',
  'DevOps Engineer',
  'Data Engineer',
  'Machine Learning Engineer',
  'Engineering Manager',
  'Technical Lead',
  'Product Manager'
];

const EXPERIENCE = [
  { value: '0', label: 'New Grad', hint: '0–1 yrs' },
  { value: '2', label: 'Junior', hint: '2–3 yrs' },
  { value: '4', label: 'Mid-level', hint: '4–6 yrs' },
  { value: '7', label: 'Senior', hint: '7–10 yrs' },
  { value: '11', label: 'Staff+', hint: '11+ yrs' },
];

export function InterviewSetupModal({ isOpen, onClose }: InterviewSetupModalProps) {
  const [company, setCompany] = useState('');
  const [experience, setExperience] = useState('');
  const [role, setRole] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleStartInterview = () => {
    if (!company.trim() || !experience || !role) {
      return;
    }

    const interviewSetup = {
      company: { id: 'custom', name: company.trim() },
      experience: parseInt(experience),
      role: role,
      timestamp: Date.now()
    };

    localStorage.setItem('interview_setup', JSON.stringify(interviewSetup));

    // Small delay before navigation to ensure localStorage is written
    setTimeout(() => {
      router.push('/interview');
      onClose();
    }, 100);
  };

  const handleClose = () => {
    setCompany('');
    setExperience('');
    setRole('');
    onClose();
  };

  if (!isOpen) return null;

  const isFormValid = company.trim() && experience && role;
  const expLabel = EXPERIENCE.find((e) => e.value === experience)?.label;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="card animate-scale-in w-full max-w-lg overflow-hidden"
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
          <button
            onClick={handleClose}
            className="btn btn-ghost -mr-2 -mt-1 p-2"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-5 p-6">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[color:var(--color-fg-muted)]">
              <Building size={15} className="text-[color:var(--color-gold-bright)]" />
              Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google, Stripe, Netflix…"
              className="field"
              autoFocus
            />
          </div>

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

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[color:var(--color-fg-muted)]">
              <Target size={15} className="text-[color:var(--color-gold-bright)]" />
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="field cursor-pointer appearance-none"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23a2a4ac'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 9l6 6 6-6'%3E%3C/path%3E%3C/svg%3E\")",
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1.1rem',
                paddingRight: '2.5rem',
              }}
            >
              <option value="">Select a role…</option>
              {ROLES.map((roleOption) => (
                <option key={roleOption} value={roleOption} style={{ background: '#131418' }}>
                  {roleOption}
                </option>
              ))}
            </select>
          </div>

          {isFormValid && (
            <div
              className="animate-fade-up rounded-lg border p-3 text-sm"
              style={{ borderColor: 'rgba(230,178,74,0.24)', background: 'rgba(230,178,74,0.06)' }}
            >
              <span className="text-[color:var(--color-fg-muted)]">Preparing: </span>
              <span className="font-medium text-[color:var(--color-gold-bright)]">
                {role} at {company.trim()} · {expLabel}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t p-6" style={{ borderColor: 'var(--color-line)' }}>
          <button onClick={handleClose} className="btn btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleStartInterview}
            disabled={!isFormValid}
            className="btn btn-primary flex-1"
          >
            Start interview
            <ArrowRight size={16} className="btn-arrow" />
          </button>
        </div>
      </div>
    </div>
  );
}
