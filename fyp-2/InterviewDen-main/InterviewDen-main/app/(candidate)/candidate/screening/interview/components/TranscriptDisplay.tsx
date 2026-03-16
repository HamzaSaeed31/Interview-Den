"use client";

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, User } from 'lucide-react';
import { TranscriptEntry } from '@/lib/interview-api';

interface TranscriptDisplayProps {
  transcript: TranscriptEntry[];
  currentInterimText?: string;
}

export default function TranscriptDisplay({ transcript, currentInterimText }: TranscriptDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, currentInterimText]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Interview Transcript</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div
          ref={scrollRef}
          className="h-full overflow-y-auto space-y-4 pr-2"
          style={{ scrollBehavior: 'smooth' }}
        >
          {transcript.length === 0 && !currentInterimText && (
            <div className="text-center text-muted-foreground py-8">
              <p>Conversation will appear here...</p>
            </div>
          )}

          {transcript.map((entry, index) => (
            <MessageBubble key={index} entry={entry} />
          ))}

          {/* Show interim/in-progress text */}
          {currentInterimText && (
            <div className="flex gap-3 items-start animate-pulse">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900 italic">{currentInterimText}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MessageBubble({ entry }: { entry: TranscriptEntry }) {
  const isAI = entry.type === 'ai';
  const isProtocol = entry.type === 'PROTOCOL';

  if (isProtocol) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full">
          {entry.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 items-start ${isAI ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isAI ? 'bg-violet-100' : 'bg-blue-100'
        }`}
      >
        {isAI ? (
          <Bot className={`h-4 w-4 text-violet-600`} />
        ) : (
          <User className={`h-4 w-4 text-blue-600`} />
        )}
      </div>

      {/* Message */}
      <div
        className={`flex-1 rounded-lg p-3 ${
          isAI
            ? 'bg-violet-50 border border-violet-200'
            : 'bg-blue-50 border border-blue-200'
        }`}
      >
        <p className={`text-sm ${isAI ? 'text-violet-900' : 'text-blue-900'}`}>
          {entry.content}
        </p>
      </div>
    </div>
  );
}

