// src/components/DebateChat.tsx
import React from 'react';

interface Message {
    id: string;
    order: number;
    content: string;
    speaker: string;
    speakerTraits: string;
}

interface DebateChatProps {
    messages: Message[];
}

export default function DebateChat({ messages }: DebateChatProps) {
    // 스피커별 위치 결정 (최대 3인 가정: 좌/우/중앙)
    // 단순히 등장 순서대로 0(좌), 1(우), 2(중앙) 할당
    const speakers = Array.from(new Set(messages.map(m => m.speaker)));

    const getPosition = (speakerName: string) => {
        const index = speakers.indexOf(speakerName);
        if (index === 0) return 'left';
        if (index === 1) return 'right';
        return 'center';
    };

    return (
        <div className="space-y-6 py-4">
            {messages.map((msg) => {
                const position = getPosition(msg.speaker);
                const isLeft = position === 'left';
                const isRight = position === 'right';
                const isCenter = position === 'center';

                return (
                    <div
                        key={msg.id}
                        className={`flex flex-col ${isRight ? 'items-end' : isCenter ? 'items-center' : 'items-start'}`}
                    >
                        {/* Speaker Info */}
                        <div className={`flex items-center gap-2 mb-1 max-w-[80%] ${isRight ? 'flex-row-reverse' : ''}`}>
                            <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-offset-2 ring-offset-[#0a0a0a]
                ${isLeft ? 'bg-blue-600 ring-blue-600 text-white' : ''}
                ${isRight ? 'bg-red-600 ring-red-600 text-white' : ''}
                ${isCenter ? 'bg-purple-600 ring-purple-600 text-white' : ''}
              `}>
                                {msg.speaker[0]}
                            </div>
                            <div className={`flex flex-col ${isRight ? 'items-end' : 'items-start'}`}>
                                <span className="text-xs font-bold text-[var(--text-primary)]">
                                    {msg.speaker}
                                </span>
                                <span className="text-[10px] text-[var(--text-muted)] opacity-80">
                                    {msg.speakerTraits.split(',')[0]}
                                </span>
                            </div>
                        </div>

                        {/* Bubble */}
                        <div className={`
              relative max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-md border 
              ${isLeft ? 'bg-[var(--bg-card)] border-[var(--border-color)] rounded-tl-sm text-[var(--text-secondary)]' : ''}
              ${isRight ? 'bg-[rgba(255,107,0,0.15)] border-[var(--accent)] rounded-tr-sm text-white' : ''}
              ${isCenter ? 'bg-[rgba(139,92,246,0.1)] border-purple-500/30 w-full text-center text-purple-200' : ''}
            `}>
                            {msg.content}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
