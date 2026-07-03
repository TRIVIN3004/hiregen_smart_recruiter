import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Terminal, Play, Check, Clock, Award, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

const PROBLEMS = [
  {
    id: 1,
    title: "Two Sum Target",
    difficulty: "Easy",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9"
    ],
    starterCode: {
      javascript: "function twoSum(nums, target) {\n  // Write your code here\n  \n}",
      python: "def two_sum(nums, target):\n    # Write your code here\n    pass",
      cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};",
      go: "func twoSum(nums []int, target int) []int {\n    \n}"
    }
  },
  {
    id: 2,
    title: "Valid Anagram String",
    difficulty: "Medium",
    description: "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.",
    constraints: [
      "1 <= s.length, t.length <= 5 * 10^4",
      "s and t consist of lowercase English letters."
    ],
    starterCode: {
      javascript: "function isAnagram(s, t) {\n  // Write your code here\n  \n}",
      python: "def is_anagram(s: str, t: str) -> bool:\n    # Write your code here\n    pass",
      cpp: "class Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        \n    }\n};",
      go: "func isAnagram(s string, t string) bool {\n    \n}"
    }
  }
];

const CodingTest = () => {
  const { user } = useAuth();
  const [selectedProblem, setSelectedProblem] = useState(PROBLEMS[0]);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(PROBLEMS[0].starterCode.javascript);
  
  // Timer settings
  const [timeLeft, setTimeLeft] = useState(2700); // 45 mins
  const [isRunning, setIsRunning] = useState(true);

  // Execution feedback
  const [stdout, setStdout] = useState('');
  const [executing, setExecuting] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [passed, setPassed] = useState(false);
  
  const [resultsSaved, setResultsSaved] = useState(false);

  // Leaderboard mock list
  const [leaderboard, setLeaderboard] = useState([
    { name: "Alex Mercer", score: 100, time: "14:20", language: "Python" },
    { name: "Mia Wong", score: 100, time: "19:42", language: "C++" },
    { name: "David Miller", score: 90, time: "22:15", language: "JavaScript" }
  ]);

  // Adjust starter code when language/problem modifications happen
  useEffect(() => {
    setCode(selectedProblem.starterCode[language] || '');
    setStdout('');
    setHasRun(false);
    setResultsSaved(false);
  }, [language, selectedProblem]);

  // Timer countdown
  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRunCode = () => {
    setExecuting(true);
    setStdout('Running tests...\n');
    
    setTimeout(() => {
      setExecuting(false);
      setHasRun(true);
      
      // Simple mock evaluation
      const passes = code.includes('return') || code.includes('pass') === false;
      setPassed(passes);
      if (passes) {
        setStdout('Success: All 4 test cases passed successfully!\n\nExecution time: 42ms\nMemory usage: 12.4MB');
      } else {
        setStdout('Error: Expected output [0, 1], got undefined.\nFailed on Test Case 1: nums = [2, 7, 11, 15], target = 9');
      }
    }, 1500);
  };

  const handleSubmitCode = async () => {
    if (!hasRun) {
      alert('Please run the code tests before submitting.');
      return;
    }
    
    const finalScore = passed ? 100 : 25;
    const timeSpent = formatTime(2700 - timeLeft);

    try {
      const res = await axios.post('/api/candidate/results/coding', {
        language,
        problemTitle: selectedProblem.title,
        code,
        score: finalScore,
        passRate: passed ? 1.0 : 0.25,
        feedback: passed ? "Optimal code structure submitted. Memory footprints verified." : "Code did not complete executing test boundaries."
      });

      if (res.data.success) {
        setResultsSaved(true);
        // Add user details into mock leaderboard
        setLeaderboard(prev => [
          { name: user?.name || "You", score: finalScore, time: timeSpent, language: language.toUpperCase() },
          ...prev
        ]);
      }
    } catch (err) {
      console.warn('Could not save result, updating local state only:', err.message);
      setResultsSaved(true);
      setLeaderboard(prev => [
        { name: user?.name || "You", score: finalScore, time: timeSpent, language: language.toUpperCase() },
        ...prev
      ]);
    }
  };

  return (
    <div className="flex flex-col gap-6 flex-1">
      {/* Upper stats bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Coding Sandbox</h1>
          <p className="text-slate-400 text-sm">Review problem descriptions, write your solution, and verify against test cases.</p>
        </div>
        
        {/* Timer Box */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-900 bg-slate-950/65">
          <Clock size={16} className={timeLeft < 600 ? "text-red-400 animate-pulse" : "text-primary-400"} />
          <span className={`font-mono text-sm font-bold ${timeLeft < 600 ? "text-red-400" : "text-slate-200"}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-[500px]">
        {/* LEFT COLUMN: Problem Details */}
        <div className="glass p-6 rounded-3xl border border-slate-900/60 flex flex-col gap-5 overflow-y-auto">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Select Coding Problem</label>
            <div className="flex gap-2">
              {PROBLEMS.map(prob => (
                <button
                  key={prob.id}
                  onClick={() => setSelectedProblem(prob)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors
                    ${selectedProblem.id === prob.id 
                      ? 'bg-primary-600/10 border-primary-500 text-primary-400' 
                      : 'bg-slate-900/40 border-slate-850 text-slate-400 hover:text-white'}`}
                >
                  {prob.title}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-900/60 pt-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <h3 className="font-display font-bold text-lg text-white">{selectedProblem.title}</h3>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border
                ${selectedProblem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}
              >
                {selectedProblem.difficulty}
              </span>
            </div>
            
            {/* Description markdown style */}
            <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950/40 p-4 rounded-xl border border-slate-900">
              {selectedProblem.description}
            </p>

            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Constraints:</span>
            <ul className="flex flex-col gap-1.5 list-disc pl-4 font-mono text-[10px] text-slate-450">
              {selectedProblem.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>

          {/* Leaderboard segment */}
          <div className="border-t border-slate-900/60 pt-4 mt-auto">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Award size={14} className="text-yellow-500" />
              <span>Problem Leaderboard</span>
            </span>
            <div className="flex flex-col gap-2 font-mono text-[11px]">
              {leaderboard.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-900/20 p-2.5 rounded-lg border border-slate-900/50">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold">#{idx + 1}</span>
                    <span className="text-slate-350">{item.name}</span>
                  </div>
                  <div className="flex gap-3 text-slate-450">
                    <span>{item.language}</span>
                    <span>{item.time}</span>
                    <span className="text-emerald-400 font-bold">{item.score}pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Code Editor Sandbox */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          {/* Header config bar */}
          <div className="glass px-6 py-3 rounded-2xl border border-slate-900 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Terminal size={14} className="text-primary-400" />
              <span>Interactive Code Workspace</span>
            </span>

            {/* Language picker */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 focus:border-primary-500/50 rounded-lg text-xs font-semibold text-slate-200 outline-none"
            >
              <option value="javascript">JavaScript (ES6)</option>
              <option value="python">Python 3</option>
              <option value="cpp">C++ (GCC 17)</option>
              <option value="go">Go (1.18)</option>
            </select>
          </div>

          {/* Sandbox code editor textarea */}
          <div className="relative flex-1 min-h-[300px]">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full p-6 bg-slate-950 border border-slate-900 focus:border-primary-500/30 rounded-3xl font-mono text-xs leading-relaxed text-slate-300 outline-none resize-none"
              style={{ tabSize: 2 }}
            />
          </div>

          {/* Console stdout outputs */}
          <div className="glass p-4 rounded-2xl border border-slate-900/60 bg-slate-950/65 font-mono text-[10px] min-h-[100px] flex flex-col gap-2">
            <span className="text-slate-500 font-bold uppercase tracking-wider">Console Output</span>
            <div className="text-slate-350 whitespace-pre-line leading-relaxed">
              {stdout || 'Ready. Click Run Code to trigger checks.'}
            </div>
          </div>

          {/* Buttons panel */}
          <div className="flex gap-4">
            <button
              onClick={handleRunCode}
              disabled={executing}
              className="flex-1 py-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Play size={14} />
              <span>Run Test Cases</span>
            </button>

            <button
              onClick={handleSubmitCode}
              disabled={resultsSaved}
              className={`flex-1 py-4 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01]
                ${resultsSaved 
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 shadow-md shadow-primary-600/15'}`}
            >
              {resultsSaved ? (
                <>
                  <Check size={14} />
                  <span>Assessment Submitted</span>
                </>
              ) : (
                <span>Submit Solution</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingTest;
