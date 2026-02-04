"use client";

import { useState } from "react";
import Image from "next/image";

export default function DebatePage() {
    const [messages, setMessages] = useState([
        { id: 1, persona: "system", name: "System", text: "토론이 시작되었습니다. 주제: 2024 포스트시즌 우승팀 예측", time: "10:00 AM" },
        { id: 2, persona: "expert", name: "김교수", text: "현재 승률 추이와 잔여 경기 일정을 고려하면 삼성이 가장 유리합니다. 투수진 WAR이 1위예요.", time: "10:01 AM" },
        { id: 3, persona: "fan", name: "열혈철수", text: "무슨 소리! LG의 타격이 살아나고 있다구요. 작년 우승 DNA 무시 못합니다!", time: "10:02 AM" },
        { id: 4, persona: "troll", name: "까칠이", text: "어차피 우승은 두산 아님? 니들끼리 싸워봐야 의미없음 ㅋㅋ", time: "10:03 AM" },
        { id: 5, persona: "expert", name: "김교수", text: "두산은 최근 5경기 불펜 평균자책점이 5.12입니다. 데이터는 거짓말을 하지 않아요.", time: "10:05 AM" },
    ]);

    const personas = [
        { id: "expert", name: "김교수", role: "Expert", desc: "데이터 분석 전문가", color: "blue" },
        { id: "fan", name: "열혈철수", role: "Fan", desc: "30년차 찐팬", color: "pink" },
        { id: "troll", name: "까칠이", role: "Troll", desc: "모두까기 인형", color: "purple" },
    ];

    return (
        <div className="container-main py-8 h-[calc(100vh-64px)] flex flex-col items-center justify-center">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-6 h-full max-h-[800px]">
                {/* Left Sidebar: Personas */}
                <div className="hidden lg:flex flex-col gap-4 p-4 glass-card">
                    <h3 className="text-xl font-bold text-white mb-2">토론 패널 소개</h3>
                    {personas.map((p) => (
                        <div key={p.id} className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-10 h-10 rounded-full border-2 border-${p.color}-500 flex items-center justify-center bg-gray-800 text-${p.color}-400 font-bold`}>
                                    {p.name[0]}
                                </div>
                                <div>
                                    <div className="font-bold text-white">{p.name}</div>
                                    <div className={`text-xs font-bold text-${p.color}-400 uppercase`}>{p.role}</div>
                                </div>
                            </div>
                            <p className="text-xs text-[var(--text-muted)]">{p.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Center: Main Debate Chat */}
                <div className="lg:col-span-2 flex flex-col glass-card overflow-hidden relative">
                    {/* Header Banner */}
                    <div className="p-4 border-b border-[var(--border-accent)] bg-[rgba(255,107,0,0.1)] flex items-center justify-between z-10">
                        <div>
                            <div className="mb-4">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-500 text-sm font-bold animate-pulse">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    LIVE : 불타는 토론중
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                                한화 이글스, 2026 시즌<br />
                                <span className="text-[#FF6B00]">우승 도전 가능한가?</span>
                            </h1>
                            <p className="text-gray-400 max-w-2xl mx-auto">
                                전문가들의 냉철한 분석과 팬들의 뜨거운 설전.<br />
                                당신의 의견을 더해주세요.
                            </p>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-[rgba(0,0,0,0.2)]">
                        {messages.map((msg) => {
                            const isSystem = msg.persona === 'system';
                            return (
                                <div key={msg.id} className={`flex gap-3 ${isSystem ? 'justify-center' : ''}`}>
                                    {!isSystem && (
                                        <div className={`w-10 h-10 shrink-0 rounded-full border-2 flex items-center justify-center bg-gray-800 font-bold text-xs
                        ${msg.persona === 'expert' ? 'border-blue-500 text-blue-400' :
                                                msg.persona === 'fan' ? 'border-pink-500 text-pink-400' :
                                                    'border-purple-500 text-purple-400'}`}>
                                            {msg.name[0]}
                                        </div>
                                    )}

                                    <div className={`flex flex-col ${isSystem ? 'items-center' : 'items-start'} max-w-[80%]`}>
                                        {!isSystem && (
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-bold text-white">{msg.name}</span>
                                                <span className="text-xs text-[var(--text-muted)]">{msg.time}</span>
                                            </div>
                                        )}

                                        {isSystem ? (
                                            <div className="py-1 px-3 rounded-full bg-[var(--border-color)] text-xs text-[var(--text-secondary)]">
                                                {msg.text}
                                            </div>
                                        ) : (
                                            <div className={`p-4 rounded-xl text-sm leading-relaxed shadow-md
                        ${msg.persona === 'expert' ? 'bg-blue-900/30 border border-blue-500/30 text-blue-100 rounded-tl-none' :
                                                    msg.persona === 'fan' ? 'bg-pink-900/30 border border-pink-500/30 text-pink-100 rounded-tl-none' :
                                                        'bg-purple-900/30 border border-purple-500/30 text-purple-100 rounded-tl-none'}`}>
                                                {msg.text}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] z-10">
                        <div className="flex gap-2 mb-2">
                            <button className="flex-1 py-2 text-xs font-bold rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">👍 찬성</button>
                            <button className="flex-1 py-2 text-xs font-bold rounded bg-red-500/20 text-red-400 hover:bg-red-500/30">👎 반대</button>
                            <button className="flex-1 py-2 text-xs font-bold rounded bg-gray-500/20 text-gray-400 hover:bg-gray-500/30">😐 중립</button>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="의견을 남겨주세요 (익명 참여 가능)"
                                className="w-full pl-4 pr-12 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-white focus:outline-none focus:border-[var(--accent)]"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A2.001 2.001 0 000 9.333a2.001 2.001 0 003.693 1.168l1.414 4.925a.75.75 0 001.3.275l9-10a.75.75 0 00-.287-1.125l-12-3.786z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Trending Lists */}
                <div className="hidden lg:flex flex-col gap-6">
                    <div className="glass-card p-4">
                        <h3 className="font-bold text-white mb-4 border-b border-[var(--border-color)] pb-2">🔥 다른 핫한 토론</h3>
                        <ul className="space-y-3">
                            <li className="text-sm cursor-pointer hover:text-[var(--accent)]">
                                <span className="block font-bold text-white mb-1">김도영 vs 로하스 MVP?</span>
                                <span className="text-[var(--text-muted)] text-xs">참여자 854명 • 1시간 전</span>
                            </li>
                            <li className="text-sm cursor-pointer hover:text-[var(--accent)]">
                                <span className="block font-bold text-white mb-1">한화 이글스 가을야구 가능성</span>
                                <span className="text-[var(--text-muted)] text-xs">참여자 521명 • 2시간 전</span>
                            </li>
                        </ul>
                    </div>

                    <div className="glass-card p-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <span className="text-6xl">📊</span>
                        </div>
                        <h3 className="font-bold text-white mb-2">실시간 투표 현황</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                                    <span>삼성</span>
                                    <span>42%</span>
                                </div>
                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[42%]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                                    <span>LG</span>
                                    <span>35%</span>
                                </div>
                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-pink-500 w-[35%]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                                    <span>두산</span>
                                    <span>23%</span>
                                </div>
                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-white w-[23%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
