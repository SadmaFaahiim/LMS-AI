import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { getSession } from "../../lib/session";
import { useLanguage } from "../../contexts/LanguageContext";

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  const [submissionDetails, setSubmissionDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});
  const session = getSession();
  const { language } = useLanguage();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const { data } = await api.getSubmissions({
        student_name: session.studentName,
        is_completed: true,
        is_published: true,
      });
      setResults(data.data || []);
    } catch (error) {
      console.error("Failed to fetch results:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissionDetails = async (submissionId) => {
    // Return cached details if available
    if (submissionDetails[submissionId]) {
      return submissionDetails[submissionId];
    }

    // Fetch if not already loading
    if (!loadingDetails[submissionId]) {
      setLoadingDetails((prev) => ({ ...prev, [submissionId]: true }));

      try {
        const { data } = await api.getSubmissionDetails(submissionId);
        const details = data.data;
        setSubmissionDetails((prev) => ({ ...prev, [submissionId]: details }));
        setLoadingDetails((prev) => ({ ...prev, [submissionId]: false }));
        return details;
      } catch (error) {
        console.error("Failed to fetch submission details:", error);
        setLoadingDetails((prev) => ({ ...prev, [submissionId]: false }));
        return null;
      }
    }
  };

  const handleToggleDetails = async (resultId) => {
    if (selectedResult === resultId) {
      setSelectedResult(null);
    } else {
      setSelectedResult(resultId);
      await fetchSubmissionDetails(resultId);
    }
  };

  // Get localized text helper
  const getLocalText = (item, field) => {
    const isBengaliExist = /[\u0980-\u09FF]/.test(item[field] || "");
    return !!item[field] && isBengaliExist
      ? item[field]
      : item[`${field}_en`] || "";
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
    <div className='max-w-7xl mx-auto space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between flex-wrap gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-text-primary'>Results</h1>
          <p className='text-sm text-text-secondary mt-1'>
            View your graded submissions and feedback
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className='grid grid-cols-4 gap-4'>
          <div className='bg-bg-secondary border border-bg-tertiary rounded-lg p-4'>
            <p className='text-2xl font-bold text-text-primary'>
              {stats.count}
            </p>
            <p className='text-xs text-text-secondary font-mono uppercase'>
              Completed
            </p>
          </div>
          <div className='bg-bg-secondary border border-bg-tertiary rounded-lg p-4'>
            <p className='text-2xl font-bold text-accent-secondary'>
              {stats.total}
            </p>
            <p className='text-xs text-text-secondary font-mono uppercase'>
              Total Score
            </p>
          </div>
          <div className='bg-bg-secondary border border-bg-tertiary rounded-lg p-4'>
            <p className='text-2xl font-bold text-text-primary'>
              {stats.average}
            </p>
            <p className='text-xs text-text-secondary font-mono uppercase'>
              Average
            </p>
          </div>
          <div className='bg-bg-secondary border border-bg-tertiary rounded-lg p-4'>
            <p className='text-2xl font-bold text-success'>
              {stats.percentage}%
            </p>
            <p className='text-xs text-text-secondary font-mono uppercase'>
              Percentage
            </p>
          </div>
        </div>
      )}

      {/* Results List */}
      <div className='bg-bg-secondary border border-bg-tertiary rounded-xl overflow-hidden'>
        {loading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin w-8 h-8 border-2 border-accent-secondary border-t-transparent rounded-full'></div>
          </div>
        ) : results.length === 0 ? (
          <div className='text-center py-12 text-text-secondary'>
            <p className='text-sm mb-2'>No completed submissions yet.</p>
            <p className='text-xs text-text-tertiary mb-4'>
              Your graded results will appear here once they're evaluated.
            </p>
            <button
              onClick={() => (window.location.href = "/student/submissions")}
              className='px-4 py-2 bg-accent-secondary text-bg-primary rounded-lg text-sm font-bold hover:bg-accent-secondary/80 transition-colors'>
              Check Submissions
            </button>
          </div>
        ) : (
          <div className='divide-y divide-bg-tertiary'>
            {results.map((result) => {
              const questionText = result.question_text
                ? getLocalText(result, "question_text")
                : result.exam_title;

              return (
                <div
                  key={result.id}
                  className='p-5 hover:bg-bg-primary/50 transition-colors'>
                  <div className='flex items-start justify-between gap-4 mb-4'>
                    <div className='flex-1'>
                      <h3 className='text-base font-semibold text-text-primary mb-2'>
                        {result.exam_title || "Question Submission"}
                      </h3>
                      {result.question_text && (
                        <p className='text-sm text-text-secondary mb-2'>
                          {questionText}
                        </p>
                      )}
                      <div className='flex items-center gap-3 text-xs text-text-secondary'>
                        <span>
                          Completed{" "}
                          {new Date(
                            result.completed_at ||
                              result.evaluation_completed_at,
                          ).toLocaleString()}
                        </span>
                        <span>·</span>
                        <span className='font-mono'>
                          {result.type || "mixed"}
                        </span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className='text-right'>
                      <p className='text-3xl font-bold text-accent-secondary'>
                        {result.score || 0}
                      </p>
                      <p className='text-xs text-text-secondary'>
                        / {result.max_score || 0}
                      </p>
                    </div>
                  </div>

                  {/* Expand Details */}
                  {selectedResult === result.id && (
                    <div className='space-y-4 pt-4 border-t border-bg-tertiary'>
                      {/* Teacher Feedback */}
                      {result.teacher_feedback && (
                        <div className='bg-bg-primary border border-bg-tertiary rounded p-4'>
                          <p className='text-xs font-mono text-text-secondary mb-2'>
                            TEACHER FEEDBACK
                          </p>
                          <p className='text-sm text-text-primary'>
                            {result.teacher_feedback}
                          </p>
                        </div>
                      )}

                      {/* AI Feedback */}
                      {result.ai_feedback && (
                        <div className='bg-bg-primary border border-bg-tertiary rounded p-4'>
                          <p className='text-xs font-mono text-text-secondary mb-2'>
                            AI FEEDBACK
                          </p>
                          {typeof result.ai_feedback === "object" ? (
                            <div className='space-y-2'>
                              {/* Detect language from question text */}
                              {(() => {
                                const isBengaliQuestion =
                                  /[\u0980-\u09FF]/.test(
                                    result.question_text || "",
                                  );
                                const feedback = result.ai_feedback;
                                const questionText = result.question_text
                                  ? getLocalText(result, "question_text")
                                  : null;

                                return (
                                  <>
                                    {/* Question text */}
                                    {questionText && (
                                      <div className='mb-3 pb-3 border-b border-bg-tertiary'>
                                        <p className='text-xs font-mono text-text-secondary mb-1'>
                                          Question
                                        </p>
                                        <p className='text-sm text-text-primary'>
                                          {questionText}
                                        </p>
                                      </div>
                                    )}

                                    {/* Feedback text */}
                                    <p className='text-sm text-text-primary'>
                                      {isBengaliQuestion
                                        ? feedback.feedback_bn ||
                                          feedback.feedback_en ||
                                          "No feedback available"
                                        : feedback.feedback_en ||
                                          feedback.feedback_bn ||
                                          "No feedback available"}
                                    </p>

                                    {/* Strengths */}
                                    {feedback.strengths &&
                                      feedback.strengths.length > 0 && (
                                        <div>
                                          <p className='text-[10px] font-mono text-success uppercase mb-1'>
                                            Strengths
                                          </p>
                                          <ul className='text-sm text-text-secondary list-disc list-inside'>
                                            {feedback.strengths.map(
                                              (strength, idx) => (
                                                <li key={idx}>{strength}</li>
                                              ),
                                            )}
                                          </ul>
                                        </div>
                                      )}

                                    {/* Areas for improvement */}
                                    {feedback.areas_for_improvement &&
                                      feedback.areas_for_improvement.length >
                                        0 && (
                                        <div>
                                          <p className='text-[10px] font-mono text-warning uppercase mb-1'>
                                            Areas for Improvement
                                          </p>
                                          <ul className='text-sm text-text-secondary list-disc list-inside'>
                                            {feedback.areas_for_improvement.map(
                                              (area, idx) => (
                                                <li key={idx}>{area}</li>
                                              ),
                                            )}
                                          </ul>
                                        </div>
                                      )}

                                    {/* Suggested answer */}
                                    {feedback.suggested_answer && (
                                      <div>
                                        <p className='text-[10px] font-mono text-info uppercase mb-1'>
                                          Suggested Answer
                                        </p>
                                        <p className='text-sm text-text-secondary italic'>
                                          {feedback.suggested_answer}
                                        </p>
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          ) : (
                            <p className='text-sm text-text-secondary'>
                              {result.ai_feedback}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Question-by-Question Breakdown */}
                      {(() => {
                        const details = submissionDetails[result.id];
                        const isLoading = loadingDetails[result.id];

                        if (isLoading) {
                          return (
                            <div className='flex items-center justify-center py-8'>
                              <div className='animate-spin w-6 h-6 border-2 border-accent-secondary border-t-transparent rounded-full'></div>
                            </div>
                          );
                        }

                        if (
                          details &&
                          details.answers &&
                          details.answers.length > 0
                        ) {
                          return (
                            <div className='space-y-3'>
                              <p className='text-xs font-mono text-text-secondary'>
                                DETAILED BREAKDOWN
                              </p>
                              {details.answers.map((answer, idx) => {
                                const question = { ...answer } || {};
                                const qText = getLocalText(
                                  question,
                                  "question_text",
                                );
                                const isMCQ = question.type === "mcq";

                                console.log("marks: ", answer);

                                return (
                                  <div
                                    key={answer.id}
                                    className='bg-bg-primary border border-bg-tertiary rounded p-3'>
                                    <div className='flex items-start justify-between mb-2'>
                                      <p className='text-sm text-text-primary flex-1'>
                                        <span className='font-mono text-text-secondary mr-2'>
                                          Q{idx + 1}.
                                        </span>
                                        {qText}
                                      </p>
                                      <span className='text-sm font-bold text-accent-secondary ml-2'>
                                        {answer.marks_obtained ||
                                          answer.ai_marks ||
                                          0}
                                        /{question.max_marks || 0}
                                      </span>
                                    </div>

                                    {/* Student Answer */}
                                    <div className='mb-2 pl-4'>
                                      <p className='text-xs text-text-secondary mb-1'>
                                        Your Answer:
                                      </p>
                                      <p className='text-xs text-text-primary'>
                                        {isMCQ
                                          ? answer.selected_option
                                          : answer.answer_text}
                                      </p>
                                    </div>

                                    {/* Correct Answer (MCQ) */}
                                    {isMCQ && (
                                      <div className='mb-2 pl-4'>
                                        <p className='text-xs text-text-secondary mb-1'>
                                          Correct Answer:
                                        </p>
                                        <p
                                          className={`text-xs font-medium ${
                                            answer.is_correct
                                              ? "text-success"
                                              : "text-error"
                                          }`}>
                                          {question.answer}{" "}
                                          {answer.is_correct ? "✓" : "✗"}
                                        </p>
                                      </div>
                                    )}

                                    {/* AI Feedback */}
                                    {!isMCQ && answer.ai_feedback && (
                                      <div className='pl-4 mt-2'>
                                        <p className='text-xs text-text-secondary mb-1'>
                                          AI Feedback:
                                        </p>
                                        {typeof answer.ai_feedback ===
                                        "object" ? (
                                          <div className='space-y-1'>
                                            {/* Detect language from question text */}
                                            {(() => {
                                              const isBengaliQuestion =
                                                /[\u0980-\u09FF]/.test(
                                                  qText || "",
                                                );
                                              const feedback =
                                                answer.ai_feedback;

                                              return (
                                                <>
                                                  {/* Feedback text */}
                                                  <p className='text-xs text-text-primary'>
                                                    {isBengaliQuestion
                                                      ? feedback.feedback_bn ||
                                                        feedback.feedback_en ||
                                                        "No feedback"
                                                      : feedback.feedback_en ||
                                                        feedback.feedback_bn ||
                                                        "No feedback"}
                                                  </p>

                                                  {/* Strengths */}
                                                  {feedback.strengths &&
                                                    feedback.strengths.length >
                                                      0 && (
                                                      <div>
                                                        <p className='text-[9px] font-mono text-success uppercase'>
                                                          Strengths:
                                                        </p>
                                                        <ul className='text-xs text-text-secondary list-disc list-inside'>
                                                          {feedback.strengths.map(
                                                            (s, i) => (
                                                              <li key={i}>
                                                                {s}
                                                              </li>
                                                            ),
                                                          )}
                                                        </ul>
                                                      </div>
                                                    )}

                                                  {/* Areas for improvement */}
                                                  {feedback.areas_for_improvement &&
                                                    feedback
                                                      .areas_for_improvement
                                                      .length > 0 && (
                                                      <div>
                                                        <p className='text-[9px] font-mono text-warning uppercase'>
                                                          To Improve:
                                                        </p>
                                                        <ul className='text-xs text-text-secondary list-disc list-inside'>
                                                          {feedback.areas_for_improvement.map(
                                                            (a, i) => (
                                                              <li key={i}>
                                                                {a}
                                                              </li>
                                                            ),
                                                          )}
                                                        </ul>
                                                      </div>
                                                    )}
                                                </>
                                              );
                                            })()}
                                          </div>
                                        ) : (
                                          <p className='text-xs text-text-secondary'>
                                            {answer.ai_feedback}
                                          </p>
                                        )}
                                        {answer.answer && (
                                          <div>
                                            <p className='text-[10px] mt-2 font-mono text-info uppercase mb-1'>
                                              Suggested Answer
                                            </p>
                                            <p className='text-xs text-text-secondary italic'>
                                              {answer.answer}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }

                        return null;
                      })()}
                    </div>
                  )}

                  {/* Expand/Collapse Button */}
                  <button
                    onClick={() => handleToggleDetails(result.id)}
                    className='mt-3 text-xs text-accent-secondary hover:text-accent-secondary/80 font-medium'>
                    {selectedResult === result.id
                      ? "▲ Hide Details"
                      : "▼ Show Details"}
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
