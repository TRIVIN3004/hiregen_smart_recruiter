import React, { useState, useEffect, useCallback } from 'react';
import { ListChecks, Clock, CheckCircle2, XCircle, Loader2, Trophy, RefreshCw } from 'lucide-react';
import axios from 'axios';

const DEFAULT_DURATION = 2400; // 40 minutes
const PASS_MARK = 15;

const categoryColor = (category) => {
  switch ((category || '').toLowerCase()) {
    case 'logical reasoning': return 'bg-primary-500/10 text-primary-400 border-primary-500/20';
    case 'quantitative': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    case 'verbal': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    default: return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
  }
};

const AptitudeTest = () => {
  const [status, setStatus] = useState('idle'); // idle | loading | active | submitting | done
  const [questions, setQuestions] = useState([]);
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [answers, setAnswers] = useState({}); // { questionId: selectedIndex }
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [startedAt, setStartedAt] = useState(null);

  const startTest = async () => {
    setStatus('loading');
    setError('');
    try {
      const res = await axios.post('/api/candidate/aptitude/generate');
      if (res.data.success) {
        const { questions: qs, durationSeconds, passMark } = res.data.data;
        setQuestions(qs);
        setDuration(durationSeconds || DEFAULT_DURATION);
        setTimeLeft(durationSeconds || DEFAULT_DURATION);
        setAnswers({});
        setResult(null);
        setStartedAt(Date.now());
        setStatus('active');
      } else {
        setError('Failed to generate aptitude questions. Please try again.');
        setStatus('idle');
      }
    } catch (err) {
      setError('Failed to generate aptitude questions: ' + (err.response?.data?.error || err.message));
      setStatus('idle');
    }
  };

  const handleSubmit = useCallback(async () => {
    if (status !== 'active') return;
    setStatus('submitting');

    const timeTakenSeconds = startedAt ? Math.round((Date.now() - startedAt) / 1000) : (duration - timeLeft);
    const payloadAnswers = questions.map(q => ({
      questionId: q.id,
      category: q.category,
      question: q.question,
      selectedIndex: answers[q.id] ?? null,
      correctIndex: q.correctIndex
    }));

    try {
      const res = await axios.post('/api/candidate/aptitude/submit', {
        answers: payloadAnswers,
        timeTakenSeconds
      });
      if (res.data.success) {
        setResult(res.data.data);
      } else {
        setError('Failed to submit aptitude test.');
      }
    } catch (err) {
      setError('Failed to submit aptitude test: ' + (err.response?.data?.error || err.message));
    } finally {
      setStatus('done');
    }
  }, [status, questions, answers, startedAt, duration, timeLeft]);

  // Timer countdown with auto-submit on expiry
  useEffect(() => {
    if (status !== 'active') return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [status, timeLeft, handleSubmit]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const selectAnswer = (questionId, optionIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const answeredCount = Object.keys(answers).length;

  // --- Idle / intro screen ---
  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-600/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
          <ListChecks size={28} />
        </div>
        <div className="max-w-lg flex flex-col gap-2">
          <h1 className="text-2xl font-display font-bold text-white">Aptitude Assessment</h1>
          <p className="text-slate-400 text-sm">
            <strong className="text-white">30 AI-generated multiple-choice questions</strong> covering logical reasoning,
            quantitative aptitude, verbal ability, and pattern recognition. You'll have{' '}
            <strong className="text-white">40 minutes</strong>, with auto-submit on expiry. A score of{' '}
            <strong className="text-white">{PASS_MARK}/30</strong> or higher is a pass. Each attempt generates a fresh,
            unique set of questions.
          </p>
        </div>
        {error && (
          <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-2.5 max-w-md">
            {error}
          </div>
        )}
        <button
          onClick={startTest}
          disabled={status === 'loading'}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white font-semibold shadow-xl shadow-primary-600/30 flex items-center gap-2 transition-all hover:scale-[1.03] disabled:opacity-60"
        >
          {status === 'loading' ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Generating Questions...</span>
            </>
          ) : (
            <>
              <ListChecks size={18} />
              <span>Start Aptitude Test</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // --- Results screen ---
  if (status === 'done' && result) {
    const passed = result.passed;
    return (
      <div className="flex flex-col gap-6 flex-1 items-center py-10">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center border ${passed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {passed ? <Trophy size={32} /> : <XCircle size={32} />}
        </div>
        <div className="text-center flex flex-col gap-1">
          <h1 className="text-2xl font-display font-bold text-white">
            {passed ? 'Congratulations, you passed!' : 'Assessment Not Passed'}
          </h1>
          <p className="text-slate-400 text-sm">
            You scored <strong className="text-white">{result.correctAnswers}/{result.totalQuestions}</strong> &mdash; pass mark is {PASS_MARK}/30.
          </p>
        </div>

        <div className={`px-6 py-3 rounded-xl border text-sm font-bold ${passed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {passed ? 'PASSED' : 'FAILED'}
        </div>

        <button
          onClick={startTest}
          className="mt-4 px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <RefreshCw size={14} />
          <span>Retake Test</span>
        </button>
      </div>
    );
  }

  // --- Active test screen ---
  return (
    <div className="flex flex-col gap-6 flex-1">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Aptitude Assessment</h1>
          <p className="text-slate-400 text-sm">{answeredCount}/{questions.length} answered</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-900 bg-slate-950/65">
          <Clock size={16} className={timeLeft < 300 ? "text-red-400 animate-pulse" : "text-primary-400"} />
          <span className={`font-mono text-sm font-bold ${timeLeft < 300 ? "text-red-400" : "text-slate-200"}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="glass p-6 rounded-2xl border border-slate-900/60 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-xs font-bold text-slate-500 mt-0.5">Q{idx + 1}.</span>
                <span className="text-sm text-slate-200 font-medium leading-relaxed">{q.question}</span>
              </div>
              <span className={`shrink-0 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${categoryColor(q.category)}`}>
                {q.category}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
              {q.options.map((opt, optIdx) => (
                <button
                  key={optIdx}
                  onClick={() => selectAnswer(q.id, optIdx)}
                  className={`text-left px-4 py-2.5 rounded-xl border text-xs font-medium transition-colors
                    ${answers[q.id] === optIdx
                      ? 'bg-primary-600/10 border-primary-500 text-primary-400'
                      : 'bg-slate-900/40 border-slate-850 text-slate-300 hover:text-white hover:border-slate-700'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={status === 'submitting'}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white font-semibold text-sm shadow-lg shadow-primary-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-60"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Submitting...</span>
          </>
        ) : (
          <>
            <CheckCircle2 size={16} />
            <span>Submit Aptitude Test</span>
          </>
        )}
      </button>
    </div>
  );
};

export default AptitudeTest;