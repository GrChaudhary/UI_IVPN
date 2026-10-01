import React, { useState } from 'react';
import { X, ChevronRight, Play } from 'lucide-react';

export default function TourModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const totalSteps = 8;

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: 'Welcome to Agentic Patch Management',
      content:
        'This platform orchestrates end-to-end patch lifecycle across RHEL, Windows, and database servers using 18 AI agents.',
    },
    {
      title: 'Central Dashboard & Real-Time Telemetry',
      content:
        'Monitor fleet-wide compliance, live executions, risk-weighted composite health scores, and AI-driven predictive insights.',
    },
    {
      title: 'Agentic Pipeline & Decision Gates',
      content:
        'Every patch wave is governed by intelligent autonomous agents: from Sanity Checks and Risk Scoring to VM Snapshots and Automated Rollbacks.',
    },
    {
      title: 'On-Demand & Automated Execution',
      content:
        'Execute targeted patch waves with pre-flight dry-runs, granular wave concurrency control, and zero-downtime rolling upgrades.',
    },
    {
      title: 'vCenter & Cloud Backup Integration',
      content:
        'Manage VMware snapshots, Cohesity protection groups, and Rubrik backup retention policies directly within the platform.',
    },
    {
      title: 'Governance & Compliance Baselines',
      content:
        'Enforce N-1 baseline standards, audit CVE closure verifications, and synchronize CMDB attributes in real time.',
    },
    {
      title: 'Role-Based Access & Security',
      content:
        'Granular RBAC ensures operators, reviewers, and security auditors have explicit permission boundaries with full cryptographic audit logging.',
    },
    {
      title: 'Ready to Experience Patch Nexus',
      content:
        'Explore the live dashboard, trigger simulated patch workflows, or inspect individual agents in the Agent Registry.',
    },
  ];

  const current = tourSteps[step - 1];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md p-6 bg-raised border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,242,254,0.15)] animate-in zoom-in-95">
        {/* Step Indicator & Close */}
        <div className="flex items-center justify-between pb-3">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest font-mono">
            STEP {step} OF {totalSteps}
          </span>
          <button
            onClick={onClose}
            className="p-1 text-fg3 hover:text-fg rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-fg tracking-tight mt-1 mb-3">
          {current.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-fg2 leading-relaxed min-h-[48px]">
          {current.content}
        </p>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-1.5 my-5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i + 1 === step
                  ? 'w-6 bg-cyan-400'
                  : 'w-1.5 bg-slate-700'
              }`}
            ></span>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-ink/[0.08]">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-fg3 hover:text-fg px-3 py-1.5 transition-colors"
          >
            Skip Tour
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-onbright font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition-all"
          >
            <span>{step === totalSteps ? 'Get Started' : 'Next'}</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
