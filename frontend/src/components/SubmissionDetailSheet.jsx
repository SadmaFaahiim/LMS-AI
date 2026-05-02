import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';

export default function SubmissionDetailSheet({ isOpen, onClose, submissionId }) {
  const [submission, setSubmission] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teacherMarks, setTeacherMarks] = useState({});
  const { language } = useLanguage();

  useEffect(() => {
    if (isOpen && submissionId) {
      fetchSubmissionDetails();
    }
  }, [isOpen, submissionId]);

  const fetchSubmissionDetails = async () => {
    try {
      setLoading(true);
      // Fetch submission answers for this submission
      // Note: This endpoint may need to be created
      // For now, we'll use the exam submission endpoint
      const { data } = await api.getSubmissionAnswer(submissionId);
      // TODO: Parse and set submission data
      // setSubmission(data.data);
      // setAnswers(data.data.answers || []);
    } catch (error) {
      console.error('Failed to fetch submission details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarksChange = (answerId, marks) => {
    setTeacherMarks(prev => ({
      ...prev,
      [answerId]: marks,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Save teacher marks
      // await api.updateSubmissionGrades(submissionId, teacherMarks);
      alert('Grades saved successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to save grades:', error);
      alert('Failed to save grades. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Get localized text helper
  const getLocalText = (item, field) => {
    if (language === 'en' && item[`${field}_en`]) {
      return item[`${field}_en`];
    }
    return item[field];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
      <div className="w-full max-w-4xl bg-bg-secondary border-l border-bg-tertiary h-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-bg-secondary border-b border-bg-tertiary px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-text-primary">Submission Details</h2>
              {submission && (
                <p className="text-sm text-text-secondary mt-1">
                  {submission.student_name} · {submission.exam_title}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full"></div>
            </div>
          ) : answers.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              <p>No answers found for this submission.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score Summary */}
              <div className="bg-bg-primary border border-bg-tertiary rounded-lg p-4">
                <h3 className="text-sm font-mono uppercase text-text-secondary mb-3">Score Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-text-primary">
                      {/* submission.total_score */}0
                    </p>
                    <p className="text-xs text-text-secondary">Total Score</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-success">
                      {/* submission.mcq_score */}0
                    </p>
                    <p className="text-xs text-text-secondary">MCQ Score</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-accent-secondary">
                      {/* submission.ai_score */}0
                    </p>
                    <p className="text-xs text-text-secondary">AI Score</p>
                  </div>
                </div>
              </div>

              {/* Answers List */}
              <div className="space-y-4">
                {answers.map((answer, index) => {
                  const question = answer.question || {};
                  const questionText = getLocalText(question, 'question_text');
                  const isMCQ = question.type === 'mcq';

                  return (
                    <div key={answer.id} className="bg-bg-primary border border-bg-tertiary rounded-lg p-4">
                      {/* Question */}
                      <div className="mb-3">
                        <p className="text-xs font-mono text-text-secondary mb-1">
                          Question {index + 1}
                        </p>
                        <p className="text-sm text-text-primary">{questionText}</p>
                      </div>

                      {/* Student's Answer */}
                      <div className="mb-3">
                        <p className="text-xs font-mono text-text-secondary mb-1">
                          Student's Answer
                        </p>
                        {isMCQ ? (
                          <p className="text-sm text-text-primary">
                            {answer.selected_option}
                          </p>
                        ) : (
                          <p className="text-sm text-text-primary whitespace-pre-wrap">
                            {answer.answer_text}
                          </p>
                        )}
                      </div>

                      {/* MCQ: Correct Answer */}
                      {isMCQ && (
                        <div className="mb-3">
                          <p className="text-xs font-mono text-text-secondary mb-1">
                            Correct Answer
                          </p>
                          <p className={`text-sm font-medium ${
                            answer.is_correct ? 'text-success' : 'text-error'
                          }`}>
                            {question.answer} {answer.is_correct ? '✓' : '✗'}
                          </p>
                        </div>
                      )}

                      {/* Grades */}
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        {/* MCQ Score */}
                        {isMCQ && (
                          <div>
                            <p className="text-xs font-mono text-text-secondary mb-1">
                              Score
                            </p>
                            <p className="text-sm text-text-primary">
                              {answer.marks_obtained || 0} / {question.marks || 0}
                            </p>
                          </div>
                        )}

                        {/* AI Score (for written) */}
                        {!isMCQ && (
                          <div>
                            <p className="text-xs font-mono text-text-secondary mb-1">
                              AI Score
                            </p>
                            <p className="text-sm text-accent-secondary">
                              {answer.ai_marks || 'Pending'}
                            </p>
                          </div>
                        )}

                        {/* Evaluation Status */}
                        <div>
                          <p className="text-xs font-mono text-text-secondary mb-1">
                            Status
                          </p>
                          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                            answer.evaluation_status === 'evaluated'
                              ? 'bg-success/20 text-success'
                              : answer.evaluation_status === 'pending'
                              ? 'bg-warning/20 text-warning'
                              : 'bg-info/20 text-info'
                          }`}>
                            {answer.evaluation_status}
                          </span>
                        </div>
                      </div>

                      {/* AI Feedback */}
                      {!isMCQ && answer.ai_feedback && (
                        <div className="mb-3 p-3 bg-bg-secondary border border-bg-tertiary rounded">
                          <p className="text-xs font-mono text-text-secondary mb-1">
                            AI Feedback
                          </p>
                          <p className="text-xs text-text-secondary">
                            {typeof answer.ai_feedback === 'string'
                              ? answer.ai_feedback
                              : JSON.stringify(answer.ai_feedback)}
                          </p>
                        </div>
                      )}

                      {/* Teacher Override */}
                      <div>
                        <label className="block text-xs font-mono text-text-secondary mb-1">
                          Teacher Override Marks
                        </label>
                        <input
                          type="number"
                          value={teacherMarks[answer.id] || answer.marks_obtained || ''}
                          onChange={(e) => handleMarksChange(answer.id, parseFloat(e.target.value) || 0)}
                          min="0"
                          max={question.marks || 10}
                          className="w-full bg-bg-secondary border border-bg-tertiary rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                          placeholder={`Max: ${question.marks || 10}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Save Button */}
              <div className="sticky bottom-0 bg-bg-secondary border-t border-bg-tertiary p-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full px-6 py-3 bg-accent-primary text-bg-primary rounded-lg font-bold hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Grades'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
