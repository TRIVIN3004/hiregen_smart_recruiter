import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Terminal, Play, Check, Clock, Award, AlertCircle, Maximize, ShieldAlert, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import axios from 'axios';

const PROBLEMS = [
  {
    id: 1,
    title: "Two Sum Target",
    difficulty: "Easy",
    marks: 20,
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9"
    ]
  },
  {
    id: 2,
    title: "Valid Anagram String",
    difficulty: "Medium",
    marks: 20,
    description: "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.",
    constraints: [
      "1 <= s.length, t.length <= 5 * 10^4",
      "s and t consist of lowercase English letters."
    ]
  },
  {
    id: 3,
    title: "Reverse Linked List",
    difficulty: "Medium",
    marks: 20,
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list's head.",
    constraints: [
      "The number of nodes in the list is in the range [0, 5000]",
      "-5000 <= Node.val <= 5000"
    ]
  },
  {
    id: 4,
    title: "Valid Parentheses",
    difficulty: "Easy",
    marks: 20,
    description: "Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid (every opening bracket is closed by the same type of bracket, in the correct order).",
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists only of parentheses characters '()[]{}'"
    ]
  },
  {
    id: 5,
    title: "Longest Substring Without Repeats",
    difficulty: "Hard",
    marks: 20,
    description: "Given a string `s`, find the length of the longest substring without repeating characters.",
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces."
    ]
  }
];

const TOTAL_TIME = 2700; // 45 mins, shared across all 5 problems

const CodingTest = () => {
  const { user } = useAuth();
  const containerRef = useRef(null);

  const [testStarted, setTestStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Per-problem answer state, keyed by problem id
  const [answers, setAnswers] = useState(() => {
    const initial = {};
    PROBLEMS.forEach(p => {
      initial[p.id] = { language: '', code: '', submitted: false, score: null, feedback: '', cheatingDetected: false, cheatingReasoning: '' };
    });
    return initial;
  });

  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [testFinished, setTestFinished] = useState(false);

  // Fullscreen anti-cheat state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cheatAttempts, setCheatAttempts] = useState(0);
  const [showExitWarning, setShowExitWarning] = useState(false);

  const currentProblem = PROBLEMS[currentIndex];
  const currentAnswer = answers[currentProblem.id];

  const allSubmitted = PROBLEMS.every(p => answers[p.id].submitted);
  const submittedCount = PROBLEMS.filter(p => answers[p.id].submitted).length;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Fullscreen enforcement ---
  const enterFullscreen = async () => {
    try {
      if (containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      } else if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err.message);
    }
  };

  const handleStartTest = async () => {
    await enterFullscreen();
    setTestStarted(true);
    setIsRunning(true);
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      const fsActive = !!document.fullscreenElement;
      setIsFullscreen(fsActive);
      if (testStarted && !testFinished && !fsActive) {
        // Candidate exited fullscreen mid-test - log as a cheat attempt
        setCheatAttempts(prev => prev + 1);
        setShowExitWarning(true);
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [testStarted, testFinished]);

  // --- Timer ---
  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0 && !testFinished) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      setTestFinished(true);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, testFinished]);

  const updateCurrentAnswer = (field, value) => {
    setAnswers(prev => ({
      ...prev,
      [currentProblem.id]: { ...prev[currentProblem.id], [field]: value }
    }));
  };

  const handleSubmitCurrent = async () => {
    if (!currentAnswer.language.trim()) {
      alert('Please type the programming language you used (e.g. "python", "java").');
      return;
    }
    if (!currentAnswer.code.trim()) {
      alert('Please write your solution before submitting.');
      return;
    }

    setExecuting(true);
    try {
      const res = await axios.post('/api/candidate/results/coding', {
        language: currentAnswer.language,
        problemTitle: currentProblem.title,
        problemDescription: currentProblem.description,
        code: currentAnswer.code
      });

      if (res.data.success) {
        const { score, feedback, cheatingDetected, cheatingReasoning } = res.data.data;
        setAnswers(prev => ({
          ...prev,
          [currentProblem.id]: {
            ...prev[currentProblem.id],
            submitted: true,
            score,
            feedback,
            cheatingDetected: !!cheatingDetected,
            cheatingReasoning: cheatingReasoning || ''
          }
        }));

        // Auto-advance to the next unsubmitted problem, if any
        const nextIndex = PROBLEMS.findIndex((p, idx) => idx > currentIndex && !answers[p.id].submitted);
        if (nextIndex !== -1) {
          setCurrentIndex(nextIndex);
        }
      }
    } catch (err) {
      alert('Error submitting solution: ' + (err.response?.data?.error || err.message));
    } finally {
      setExecuting(false);
    }
  };

  useEffect(() => {
    if (allSubmitted && testStarted && !testFinished) {
      setTestFinished(true);
      setIsRunning(false);
    }
  }, [allSubmitted, testStarted, testFinished]);

  const totalScore = PROBLEMS.reduce((sum, p) => sum + (answers[p.id].score ? Math.round((answers[p.id].score / 100) * p.marks) : 0), 0);
  const anyCheatFlag = PROBLEMS.some(p => answers[p.id].cheatingDetected);

  // --- Pre-test screen ---
  if (!testStarted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-600/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
          <Terminal size={28} />
        </div>
        <div className="max-w-lg flex flex-col gap-2">
          <h1 className="text-2xl font-display font-bold text-white">Coding Assessment: 5 Problems</h1>
          <p className="text-slate-400 text-sm">
            You'll solve <strong className="text-white">5 problems</strong> worth 20 marks each (100 total) in{' '}
            <strong className="text-white">{formatTime(TOTAL_TIME)}</strong>. There is no starter code or language dropdown —
            type your language and write your solution from scratch. The test runs in fullscreen; exiting fullscreen will be
            flagged as a cheat attempt.
          </p>
        </div>
        <button
          onClick={handleStartTest}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white font-semibold shadow-xl shadow-primary-600/30 flex items-center gap-2 transition-all hover:scale-[1.03]"
        >
          <Maximize size={18} />
          <span>Enter Fullscreen &amp; Start Test</span>
        </button>
      </div>
    );
  }

  // --- Final AI evaluation summary screen ---
  if (testFinished) {
    return (
      <div className="flex flex-col gap-6 flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">AI Evaluation Summary</h1>
            <p className="text-slate-400 text-sm">Comprehensive per-question scoring and mistake analysis.</p>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-primary-500/20 bg-primary-500/5">
            <Trophy size={18} className="text-amber-400" />
            <span className="font-display font-bold text-lg text-white">{totalScore}/100</span>
          </div>
        </div>

        {anyCheatFlag && (
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <ShieldAlert size={16} />
            <span>One or more submissions were flagged by the AI for possible cheating/plagiarism. See details below.</span>
          </div>
        )}

        {cheatAttempts > 0 && (
          <div className="p-4 rounded-xl bg-yellow-950/20 border border-yellow-500/30 text-yellow-300 text-xs flex items-center gap-2">
            <ShieldAlert size={16} />
            <span>Fullscreen was exited {cheatAttempts} time{cheatAttempts > 1 ? 's' : ''} during this test. This has been logged as a cheat attempt.</span>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {PROBLEMS.map((p, idx) => {
            const a = answers[p.id];
            return (
              <div key={p.id} className={`glass p-6 rounded-2xl border ${a.cheatingDetected ? 'border-red-500/40 bg-red-950/10' : 'border-slate-900/60'}`}>
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Question {idx + 1}</span>
                    <h3 className="font-display font-bold text-lg text-white">{p.title}</h3>
                    <span className="text-[11px] text-slate-450">Language used: {a.language || '—'}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-2xl font-display font-bold text-white">{a.score ?? 0}</span>
                    <span className="text-xs text-slate-500">/100</span>
                    <div className="text-[10px] text-slate-500">({Math.round(((a.score || 0) / 100) * p.marks)}/{p.marks} marks)</div>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                  {a.feedback || 'No feedback available.'}
                </p>
                {a.cheatingDetected && (
                  <p className="text-xs text-red-300 mt-2 flex items-start gap-2">
                    <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                    <span>{a.cheatingReasoning}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- Active test screen ---
  return (
    <div ref={containerRef} className="flex flex-col gap-6 flex-1">
      {/* Fullscreen exit warning banner */}
      {showExitWarning && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 text-red-300 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} />
            <span>You exited fullscreen. This has been logged as a cheat attempt ({cheatAttempts}).</span>
          </div>
          <button
            onClick={async () => { await enterFullscreen(); setShowExitWarning(false); }}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-[11px] font-semibold"
          >
            Re-enter Fullscreen
          </button>
        </div>
      )}

      {/* Upper stats bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Coding Sandbox</h1>
          <p className="text-slate-400 text-sm">Question {currentIndex + 1} of {PROBLEMS.length} &bull; {submittedCount}/{PROBLEMS.length} submitted</p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-semibold ${isFullscreen ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' : 'border-red-500/30 bg-red-500/5 text-red-400'}`}>
            <Maximize size={14} />
            <span>{isFullscreen ? 'Fullscreen Active' : 'Not Fullscreen'}</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-900 bg-slate-950/65">
            <Clock size={16} className={timeLeft < 600 ? "text-red-400 animate-pulse" : "text-primary-400"} />
            <span className={`font-mono text-sm font-bold ${timeLeft < 600 ? "text-red-400" : "text-slate-200"}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Question navigator pills */}
      <div className="flex gap-2 flex-wrap">
        {PROBLEMS.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => setCurrentIndex(idx)}
            className={`w-9 h-9 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center
              ${currentIndex === idx ? 'bg-primary-600/10 border-primary-500 text-primary-400' :
                answers[p.id].submitted ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                'bg-slate-900/40 border-slate-850 text-slate-400 hover:text-white'}`}
          >
            {answers[p.id].submitted ? <Check size={14} /> : idx + 1}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-[500px]">
        {/* LEFT COLUMN: Problem Details */}
        <div className="glass p-6 rounded-3xl border border-slate-900/60 flex flex-col gap-5 overflow-y-auto">
          <div className="border-t-0 pt-0 flex flex-col gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-display font-bold text-lg text-white">{currentProblem.title}</h3>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border
                ${currentProblem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  currentProblem.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}
              >
                {currentProblem.difficulty}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-slate-900 text-slate-400 border-slate-800">
                {currentProblem.marks} marks
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950/40 p-4 rounded-xl border border-slate-900">
              {currentProblem.description}
            </p>

            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Constraints:</span>
            <ul className="flex flex-col gap-1.5 list-disc pl-4 font-mono text-[10px] text-slate-450">
              {currentProblem.constraints.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>

          {/* Navigation */}
          <div className="border-t border-slate-900/60 pt-4 mt-auto flex justify-between">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 flex items-center gap-1"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setCurrentIndex(prev => Math.min(PROBLEMS.length - 1, prev + 1))}
              disabled={currentIndex === PROBLEMS.length - 1}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 flex items-center gap-1"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Code Editor Sandbox */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          {/* Header config bar */}
          <div className="glass px-6 py-3 rounded-2xl border border-slate-900 flex justify-between items-center gap-4">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 shrink-0">
              <Terminal size={14} className="text-primary-400" />
              <span>Interactive Code Workspace</span>
            </span>

            {/* Manual language text input */}
            <input
              type="text"
              value={currentAnswer.language}
              onChange={(e) => updateCurrentAnswer('language', e.target.value)}
              disabled={currentAnswer.submitted}
              placeholder="Type your language (e.g. python, java)"
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 focus:border-primary-500/50 rounded-lg text-xs font-semibold text-slate-200 outline-none disabled:opacity-60 w-64"
            />
          </div>

          {/* Sandbox code editor textarea */}
          <div className="relative flex-1 min-h-[300px]">
            <textarea
              value={currentAnswer.code}
              onChange={(e) => updateCurrentAnswer('code', e.target.value)}
              disabled={currentAnswer.submitted}
              placeholder="// Write your solution from scratch here..."
              className="w-full h-full p-6 bg-slate-950 border border-slate-900 focus:border-primary-500/30 rounded-3xl font-mono text-xs leading-relaxed text-slate-300 outline-none resize-none disabled:opacity-60"
              style={{ tabSize: 2 }}
            />
          </div>

          {/* Feedback for this question, once submitted */}
          {currentAnswer.submitted && (
            <div className={`glass p-4 rounded-2xl border ${currentAnswer.cheatingDetected ? 'border-red-500/50 bg-red-950/20' : 'border-emerald-500/30 bg-emerald-950/10'} font-mono text-[11px] flex flex-col gap-2`}>
              <span className={`font-bold uppercase tracking-wider ${currentAnswer.cheatingDetected ? 'text-red-400' : 'text-emerald-400'}`}>
                Score: {currentAnswer.score}/100 {currentAnswer.cheatingDetected && "(FLAGGED)"}
              </span>
              <div className="text-slate-300 whitespace-pre-line leading-relaxed">{currentAnswer.feedback}</div>
            </div>
          )}

          {/* Buttons panel */}
          <div className="flex gap-4">
            <button
              onClick={handleSubmitCurrent}
              disabled={executing || currentAnswer.submitted}
              className={`flex-1 py-4 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01]
                ${currentAnswer.submitted
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20'
                  : 'bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 shadow-md shadow-primary-600/15'}`}
            >
              {currentAnswer.submitted ? (
                <>
                  <Check size={14} />
                  <span>Submitted</span>
                </>
              ) : executing ? (
                <span>Evaluating with AI...</span>
              ) : (
                <>
                  <Play size={14} />
                  <span>Submit Solution</span>
                </>
              )}
            </button>

            {allSubmitted && (
              <button
                onClick={() => { setTestFinished(true); setIsRunning(false); }}
                className="flex-1 py-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Award size={14} />
                <span>View Final AI Summary</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingTest;