import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { getSession } from '../../lib/session';
import { useLanguage } from '../../contexts/LanguageContext';

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  const session = getSession();
  const { language } = useLanguage();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      // TODO: Need to implement this endpoint
      // const { data } = await api.getSubmissions({
      //   student_name: session.studentName,
      //   status: 'completed'
      // });
      // setResults(data.data || []);
      // For now, set empty array
      setResults([]);
    } catch (error) {
      console.error('Failed to fetch results:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get localized text helper
  const getLocalText = (item, field) => {
    if (language === 'en' && item[`${field}_en`]) {
      return item[`${field}_en`];
    }
    return item[field];
  };

  const calculateStats = () => {
    if (results.length === 0) return null;

    const totalScore = results.reduce((sum, r) => sum + (r.score || 0), 0);
    const maxScore = results.reduce((sum, r) => sum + (r.max_score || 0), 0);
    const avgScore = totalScore / results.length;
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    return {
      total: totalScore,
      max: maxScore,
      average: avgScore.toFixed(1),
      percentage: percentage.toFixed(1),
      count: results.length,
    };
  };

  const stats = calculateStats();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Results</h1>
          <p className="text-sm text-text-secondary mt-1">View your graded submissions and feedback</p>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-bg-secondary border border-bg-tertiary rounded-lg p-4">
            <p className="text-2xl font-bold text-text-primary">{stats.count}</p>
            <p className="text-xs text-text-secondary font-mono uppercase">Completed</p>
          </div>
          <div className="bg-bg-secondary border border-bg-tertiary rounded-lg p-4">
            <p className="text-2xl font-bold text-accent-secondary">{stats.total}</p>
            <p className="text-xs text-text-secondary font-mono uppercase">Total Score</p>
          </div>
          <div className="bg-bg-secondary border border-bg-tertiary rounded-lg p-4">
            <p className="text-2xl font-bold text-text-primary">{stats.average}</p>
            <p className="text-xs text-text-secondary font-mono uppercase">Average</p>
          </div>
          <div className="bg-bg-secondary border border-bg-tertiary rounded-lg p-4">
            <p className="text-2xl font-bold text-success">{stats.percentage}%</p>
            <p className="text-xs text-text-secondary font-mono uppercase">Percentage</p>
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="bg-bg-secondary border border-bg-tertiary rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-accent-secondary border-t-transparent rounded-full"></div>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <p className="text-sm mb-2">No completed submissions yet.</p>
            <p className="text-xs text-text-tertiary mb-4">
              Your graded results will appear here once they're evaluated.
            </p>
            <button
              onClick={() => window.location.href = '/student/submissions'}
              className="px-4 py-2 bg-accent-secondary text-bg-primary rounded-lg text-sm font-bold hover:bg-accent-secondary/80 transition-colors"
            >
              Check Submissions
            </button>
          </div>
        ) : (
          <div className="divide-y divide-bg-tertiary">
            {results.map((result) => {
              const questionText = result.question_text
                ? getLocalText(result, 'question_text')
                : result.exam_title;

              return (
                <div key={result.id} className="p-5 hover:bg-bg-primary/50 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-text-primary mb-2">
                        {result.exam_title || 'Question Submission'}
                      </h3>
                      {result.question_text && (
                        <p className="text-sm text-text-secondary mb-2">
                          {questionText}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-text-secondary">
                        <span>Completed {new Date(result.completed_at).toLocaleString()}</span>
                        <span>·</span>
                        <span className="font-mono">{result.type || 'mixed'}</span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <p className="text-3xl font-bold text-accent-secondary">
                        {result.score || 0}
                      </p>
                      <p className="text-xs text-text-secondary">
                        / {result.max_score || 0}
                      </p>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-bg-primary border border-bg-tertiary rounded p-3">
                      <p className="text-xs font-mono text-text-secondary mb-1">MCQ Score</p>
                      <p className="text-lg font-bold text-success">{result.mcq_score || 0}</p>
                    </div>
                    <div className="bg-bg-primary border border-bg-tertiary rounded p-3">
                      <p className="text-xs font-mono text-text-secondary mb-1">AI Score</p>
                      <p className="text-lg font-bold text-accent-secondary">{result.ai_score || 0}</p>
                    </div>
                  </div>

                  {/* Expand Details */}
                  {selectedResult === result.id && (
                    <div className="space-y-4 pt-4 border-t border-bg-tertiary">
                      {/* Teacher Feedback */}
                      {result.teacher_feedback && (
                        <div className="bg-bg-primary border border-bg-tertiary rounded p-4">
                          <p className="text-xs font-mono text-text-secondary mb-2">TEACHER FEEDBACK</p>
                          <p className="text-sm text-text-primary">{result.teacher_feedback}</p>
                        </div>
                      )}

                      {/* AI Feedback */}
                      {result.ai_feedback && (
                        <div className="bg-bg-primary border border-bg-tertiary rounded p-4">
                          <p className="text-xs font-mono text-text-secondary mb-2">AI FEEDBACK</p>
                          <p className="text-sm text-text-secondary">
                            {typeof result.ai_feedback === 'string'
                              ? result.ai_feedback
                              : JSON.stringify(result.ai_feedback, null, 2)}
                          </p>
                        </div>
                      )}

                      {/* Question-by-Question Breakdown */}
                      {result.answers && result.answers.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-xs font-mono text-text-secondary">DETAILED BREAKDOWN</p>
                          {result.answers.map((answer, idx) => {
                            const question = answer.question || {};
                            const qText = getLocalText(question, 'question_text');
                            const isMCQ = question.type === 'mcq';

                            return (
                              <div key={answer.id} className="bg-bg-primary border border-bg-tertiary rounded p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <p className="text-sm text-text-primary flex-1">
                                    <span className="font-mono text-text-secondary mr-2">Q{idx + 1}.</span>
                                    {qText}
                                  </p>
                                  <span className="text-sm font-bold text-accent-secondary ml-2">
                                    {answer.marks_obtained || 0}/{question.marks || 0}
                                  </span>
                                </div>

                                {/* Student Answer */}
                                <div className="mb-2 pl-4">
                                  <p className="text-xs text-text-secondary mb-1">Your Answer:</p>
                                  <p className="text-xs text-text-primary">
                                    {isMCQ ? answer.selected_option : answer.answer_text}
                                  </p>
                                </div>

                                {/* Correct Answer (MCQ) */}
                                {isMCQ && (
                                  <div className="mb-2 pl-4">
                                    <p className="text-xs text-text-secondary mb-1">Correct Answer:</p>
                                    <p className={`text-xs font-medium ${
                                      answer.is_correct ? 'text-success' : 'text-error'
                                    }`}>
                                      {question.answer} {answer.is_correct ? '✓' : '✗'}
                                    </p>
                                  </div>
                                )}

                                {/* AI Feedback */}
                                {!isMCQ && answer.ai_feedback && (
                                  <div className="pl-4">
                                    <p className="text-xs text-text-secondary mb-1">AI Feedback:</p>
                                    <p className="text-xs text-text-secondary">
                                      {typeof answer.ai_feedback === 'string'
                                        ? answer.ai_feedback
                                        : JSON.stringify(answer.ai_feedback)}
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expand/Collapse Button */}
                  <button
                    onClick={() => setSelectedResult(selectedResult === result.id ? null : result.id)}
                    className="mt-3 text-xs text-accent-secondary hover:text-accent-secondary/80 font-medium"
                  >
                    {selectedResult === result.id ? '▲ Hide Details' : '▼ Show Details'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
