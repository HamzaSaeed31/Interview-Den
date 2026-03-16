"use client";

import React from 'react';
import Image from 'next/image';

interface InterviewAvatarProps {
  isSpeaking: boolean;
  audioUrl: string | null;
}

export default function InterviewAvatar({ isSpeaking, audioUrl }: InterviewAvatarProps) {
  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-50 to-slate-100 rounded-lg overflow-hidden relative flex items-center justify-center">
      {/* Avatar Container with Discord-style speaking rings */}
      <div className="relative">
        {/* Outer animated rings - visible when speaking */}
        <div
          className={`absolute inset-0 rounded-full transition-opacity duration-300 ${isSpeaking ? 'opacity-100' : 'opacity-0'
            }`}
        >
          {/* Ring 1 - Outermost */}
          <div
            className="absolute inset-[-24px] rounded-full border-[3px] border-violet-400 animate-[pulse-ring_1.5s_ease-out_infinite]"
            style={{ animationDelay: '0s' }}
          />
          {/* Ring 2 */}
          <div
            className="absolute inset-[-16px] rounded-full border-[3px] border-violet-500 animate-[pulse-ring_1.5s_ease-out_infinite]"
            style={{ animationDelay: '0.3s' }}
          />
          {/* Ring 3 - Innermost glow ring */}
          <div
            className="absolute inset-[-8px] rounded-full border-[3px] border-violet-600 animate-[pulse-ring_1.5s_ease-out_infinite]"
            style={{ animationDelay: '0.6s' }}
          />
        </div>

        {/* Continuous glow effect when speaking */}
        <div
          className={`absolute inset-[-4px] rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500 transition-opacity duration-300 ${isSpeaking ? 'opacity-100 animate-[glow-pulse_2s_ease-in-out_infinite]' : 'opacity-0'
            }`}
          style={{ filter: 'blur(8px)' }}
        />

        {/* Avatar border ring */}
        <div
          className={`relative rounded-full p-1 transition-all duration-300 ${isSpeaking
              ? 'bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500 shadow-[0_0_30px_rgba(139,92,246,0.5)]'
              : 'bg-gradient-to-r from-slate-300 to-slate-400'
            }`}
        >
          {/* Circular Avatar Image */}
          <div className="relative w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-full overflow-hidden bg-white">
            <Image
              src="/avatars/default.png"
              alt="AI Interviewer Avatar"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Speaking indicator label */}
        <div
          className={`absolute -bottom-8 left-1/2 -translate-x-1/2 transition-all duration-300 ${isSpeaking ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
        >
          <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-100 rounded-full border border-violet-200">
            <span className="flex gap-0.5">
              <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-[bounce_1s_ease-in-out_infinite]" style={{ animationDelay: '0s' }} />
              <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-[bounce_1s_ease-in-out_infinite]" style={{ animationDelay: '0.15s' }} />
              <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-[bounce_1s_ease-in-out_infinite]" style={{ animationDelay: '0.3s' }} />
            </span>
            <span className="text-xs font-medium text-violet-700">Speaking</span>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.15);
            opacity: 0;
          }
        }

        @keyframes glow-pulse {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export function Avatar2D({ isSpeaking }: { isSpeaking: boolean }) {
  return <InterviewAvatar isSpeaking={isSpeaking} audioUrl={null} />;
}
