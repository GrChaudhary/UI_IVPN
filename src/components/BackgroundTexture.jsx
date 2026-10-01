import React, { useMemo } from 'react';

// Crisp Micro-Vector for Windows 11 / Server Logo
export const WindowsMicroLogo = ({ className = 'w-3.5 h-3.5', color = '#00a4ef' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={{ color }}
  >
    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.551H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-13.051-1.899" />
  </svg>
);

// Crisp Micro-Vector for Red Hat (RHEL) Shadowman Logo
export const RhelMicroLogo = ({ className = 'w-3.5 h-3.5', color = '#ee0000' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={{ color }}
  >
    <path d="M12.72 1.34c-2.48 0-4.63 1.25-5.91 3.16-.76.13-1.48.43-2.11.87-1.32.92-2.18 2.37-2.39 4.02-.12.92.01 1.83.37 2.66-.46.33-.86.74-1.18 1.21-.8 1.18-1.07 2.64-.76 4.03.35 1.57 1.39 2.87 2.83 3.55 1.48.7 3.2.78 4.75.22.42-.15.82-.36 1.18-.61 1.05.58 2.27.89 3.55.89 4.06 0 7.42-3.09 7.82-7.06.03-.31.05-.62.05-.94 0-4.42-3.58-8-8-8zm-5.7 6.13c.47-.64 1.1-1.15 1.84-1.48.5-.22 1.05-.35 1.62-.38-.28.45-.49.95-.62 1.49-.12.48-.16.98-.12 1.48-.73-.24-1.33-.63-1.72-1.11zm1.2 5.03c-.22-.38-.34-.81-.35-1.26 0-.29.05-.57.14-.84.28.32.63.57 1.03.73-.24.43-.53.86-.82 1.37zm7.48.97c-.38 2.76-2.73 4.9-5.59 4.9-.84 0-1.63-.19-2.35-.52.62-.73 1.23-1.57 1.77-2.52.48.14.99.22 1.51.22 1.59 0 3.03-.73 4-1.87.29.54.49 1.13.56 1.76.04.35.06.69.1 2.03z" />
  </svg>
);

export default function BackgroundTexture() {
  const ambientBlobs = useMemo(
    () => [
      // Left Sidebar Ambient Zone (Behind navigation)
      { type: 'win', x: '4%', y: '22%', size: 14, opacity: 0.08, anim: 'float-slow', delay: '0s', glow: 'rgba(0, 164, 239, 0.3)' },
      { type: 'rhel', x: '10%', y: '52%', size: 15, opacity: 0.09, anim: 'float-reverse', delay: '2.5s', glow: 'rgba(238, 0, 0, 0.3)' },
      { type: 'win', x: '6%', y: '82%', size: 13, opacity: 0.07, anim: 'float-slow', delay: '1.2s', glow: 'rgba(0, 164, 239, 0.25)' },

      // Top Header Gutters
      { type: 'rhel', x: '24%', y: '4%', size: 13, opacity: 0.08, anim: 'float-slow', delay: '4s', glow: 'rgba(238, 0, 0, 0.25)' },
      { type: 'win', x: '45%', y: '3%', size: 13, opacity: 0.07, anim: 'float-reverse', delay: '0.8s', glow: 'rgba(0, 164, 239, 0.2)' },
      { type: 'rhel', x: '88%', y: '4%', size: 15, opacity: 0.09, anim: 'float-reverse', delay: '2s', glow: 'rgba(238, 0, 0, 0.3)' },
      
      // Right Margins
      { type: 'win', x: '96%', y: '48%', size: 14, opacity: 0.07, anim: 'float-reverse', delay: '1s', glow: 'rgba(0, 164, 239, 0.25)' },
      { type: 'rhel', x: '94%', y: '88%', size: 16, opacity: 0.08, anim: 'float-slow', delay: '3.5s', glow: 'rgba(238, 0, 0, 0.3)' },

      // Bottom Margin
      { type: 'win', x: '58%', y: '96%', size: 14, opacity: 0.06, anim: 'float-slow', delay: '1.5s', glow: 'rgba(0, 164, 239, 0.2)' },
    ],
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      {/* 1. Atmospheric Ambient Multi-Spectral Glows */}
      {/* Left Sidebar Cyan Glow */}
      <div
        className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full blur-[140px] opacity-[0.12]"
        style={{
          background: 'radial-gradient(circle, rgba(0,242,254,0.7) 0%, rgba(30,58,138,0.3) 60%, transparent 80%)',
        }}
      />

      {/* Top Right Threat Intel Ruby Glow */}
      <div
        className="absolute -top-32 right-10 w-[550px] h-[550px] rounded-full blur-[180px] opacity-[0.09]"
        style={{
          background: 'radial-gradient(circle, rgba(238,0,0,0.6) 0%, rgba(147,51,234,0.25) 60%, transparent 80%)',
        }}
      />

      {/* Bottom Center Compliance Emerald Aura */}
      <div
        className="absolute -bottom-40 left-1/4 w-[650px] h-[650px] rounded-full blur-[180px] opacity-[0.07]"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.7) 0%, rgba(14,165,233,0.2) 60%, transparent 80%)',
        }}
      />

      {/* Bottom Right Deep Azure Windows Aura */}
      <div
        className="absolute -bottom-40 right-10 w-[600px] h-[600px] rounded-full blur-[180px] opacity-[0.08]"
        style={{
          background: 'radial-gradient(circle, rgba(0,164,239,0.7) 0%, rgba(99,102,241,0.2) 60%, transparent 80%)',
        }}
      />

      {/* 2. Cyber Matrix Dot Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* 3. Floating Ambient Micro-Blobs */}
      {ambientBlobs.map((blob, idx) => (
        <div
          key={idx}
          className={`absolute flex items-center justify-center ${
            blob.anim === 'float-slow' ? 'animate-float-slow' : 'animate-float-reverse'
          }`}
          style={{
            left: blob.x,
            top: blob.y,
            animationDelay: blob.delay,
            opacity: blob.opacity,
          }}
        >
          <div
            className="p-1 rounded-md border border-ink/[0.04] backdrop-blur-xs flex items-center justify-center"
            style={{
              boxShadow: `0 0 12px ${blob.glow}`,
              background: blob.type === 'win' ? 'rgba(0, 164, 239, 0.04)' : 'rgba(238, 0, 0, 0.04)',
            }}
          >
            {blob.type === 'win' ? (
              <WindowsMicroLogo className="w-3.5 h-3.5" color="#00a4ef" />
            ) : (
              <RhelMicroLogo className="w-3.5 h-3.5" color="#ee0000" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
