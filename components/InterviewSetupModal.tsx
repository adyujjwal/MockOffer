'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

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

export function InterviewSetupModal({ isOpen, onClose }: InterviewSetupModalProps) {
  const [company, setCompany] = useState('');
  const [experience, setExperience] = useState('');
  const [role, setRole] = useState('');
  const router = useRouter();

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Setup Interview</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Enter company name..."
              className="w-full bg-zinc-800 border border-zinc-600 text-white rounded-lg px-4 py-3 focus:border-yellow-500 focus:outline-none"
            />
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Years of Experience
            </label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-600 text-white rounded-lg px-4 py-3 focus:border-yellow-500 focus:outline-none"
            >
              <option value="">Select experience level...</option>
              <option value="0">New Grad (0-1 years)</option>
              <option value="2">Junior (2-3 years)</option>
              <option value="4">Mid-level (4-6 years)</option>
              <option value="7">Senior (7-10 years)</option>
              <option value="11">Staff+ (11+ years)</option>
            </select>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-600 text-white rounded-lg px-4 py-3 focus:border-yellow-500 focus:outline-none"
            >
              <option value="">Select role...</option>
              {ROLES.map((roleOption) => (
                <option key={roleOption} value={roleOption}>
                  {roleOption}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-zinc-600 text-gray-300 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStartInterview}
            disabled={!isFormValid}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              isFormValid 
                ? 'bg-yellow-500 text-black hover:bg-yellow-400' 
                : 'bg-zinc-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            Start Interview
          </button>
        </div>

        {/* Preview */}
        {isFormValid && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="text-sm text-gray-300">
              <span>Preparing interview for: </span>
              <span className="text-yellow-400 font-medium">
                {role} at {company} ({
                  experience === '0' ? 'New Grad' : 
                  experience === '2' ? 'Junior' : 
                  experience === '4' ? 'Mid-level' : 
                  experience === '7' ? 'Senior' : 'Staff+'
                } level)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}