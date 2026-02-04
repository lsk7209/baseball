"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function DebatePanel() {
    const [messages, setMessages] = useState([
        { id: 1, persona: "expert", name: "김교수", text: "데이터를 보면 최근 타격 부진은 일시적 현상입니다. BABIP이 0.220에 불과해요.", time: "방금 전" },
        { id: 2, persona: "fan", name: "열혈철수", text: "아니 교수님! 3경기 연속 무안타인데 그게 데이터로 설명이 됩니까? ㅠㅠ", time: "1분 전" },
        { id: 3, persona: "troll", name: "까칠이", text: "솔직히 에이징 커브 온 거 인정해라 ㅋㅋㅋ", time: "2분 전" },
    ]);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="live-indicator">
                        <span className="live-dot"></span>
                        LIVE
                    </span>
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        실시간 핫토픽
                    </h2>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-[#FF6B00]">
                        1,284명 참여중
                    </span>
                    <Link href="/debate" className="text-sm text-[var(--accent)] hover:underline">
                        전체보기 &rarr;
                    </Link>
                </div>
            </div>

            <div className="glass-card p-0 overflow-hidden">
                {/* Topic Header */}
                <div className="bg-[rgba(255,107,0,0.1)] p-4 border-b border-[var(--border-accent)]">
                    <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">Current Topic</span>
                    <h3 className="text-lg font-bold text-white mt-1">
                        2024 시즌 MVP 경쟁: 김도영 vs 로하스?
                    </h3>
                </div>

                {/* Chat Area */}
                <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {messages.map((msg) => (
                        <div key={msg.id} className="flex gap-3">
                            <div className={`persona-avatar shrink-0 persona-${msg.persona} flex items-center justify-center bg-gray-800 text-[10px]`}>
                                {/* Avatar Placeholder */}
                                {msg.persona[0].toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-white">{msg.name}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-opacity-20 
                    ${msg.persona === 'expert' ? 'bg-blue-500 text-blue-400' :
                                            msg.persona === 'fan' ? 'bg-pink-500 text-pink-400' :
                                                'bg-purple-500 text-purple-400'}`}>
                                        {msg.persona.toUpperCase()}
                                    </span>
                                    <span className="text-[10px] text-[var(--text-muted)] ml-auto">{msg.time}</span>
                                </div>
                                <div className={`chat-bubble text-sm text-[var(--text-primary)] persona-${msg.persona}`}>
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Area */}
                <div className="p-4 border-t border-[var(--border-color)] bg-[rgba(0,0,0,0.2)]">
                    <button className="w-full btn-primary py-2 text-sm">
                        토론 참여하기
                    </button>
                </div>
            </div>
        </div>
    );
}
