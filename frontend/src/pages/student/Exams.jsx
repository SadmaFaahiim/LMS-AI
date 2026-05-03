import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { getSession } from '../../lib/session';

export default function StudentExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [takingExam, setTakingExam] = useState(false);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);

  const session = getSession();

  useEffect(() => {
    fetchExams();

    // Cleanup function - clears timer on component unmount
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const { data } = await api.getExams();
      setExams(data.data || []);
    } catch (error) {
      console.error('Failed to fetch exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const startExam = async (exam) => {
    try {
      setTakingExam(true);
      setSelectedExam(exam);

      // Fetch exam questions
      const { data } = await api.getExam(exam.id);
      setExamQuestions(data.data.questions || []);

      // Set timer
      setTimeRemaining(data.data.duration_minutes * 60);
      startTimer(data.data.duration_minutes * 60);
    } catch (error) {
      console.error('Failed to start exam:', error);
      alert('Failed to load exam questions');
      setTakingExam(false);
    }
  };

  const startTimer = (seconds) => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerInterval(null);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Store interval reference for cleanup
    setTimerInterval(interval);
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmitExam = async () => {
    // Prevent duplicate submissions
    if (submitting) return;

    if (!confirm('Are you sure you want to submit your exam?')) return;

    // Clear timer if running
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    setSubmitting(true);

    try {
      const answersArray = examQuestions.map((q) => ({
        question_id: q.id,
        selected_option: answers[q.id]?.selected_option || null,
        answer_text: answers[q.id]?.answer_text || null,
      }));

      await api.submitExam({
        exam_id: selectedExam.id,
        student_name: session.studentName,
        answers: answersArray,
      });

      alert('Exam submitted successfully!');
      setTakingExam(false);
      setSelectedExam(null);
      setExamQuestions([]);
      setAnswers({});
      fetchExams();
    } catch (error) {
      console.error('Failed to submit exam:', error);
      alert('Failed to submit exam. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (takingExam && selectedExam) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Exam Header */}
        <div className="bg-bg-secondary border border-bg-tertiary rounded-xl p-6 mb-6 sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-1">{selectedExam.title}</h1>
              <p className="text-sm text-text-secondary">
                {examQuestions.length} Questions · {selectedExam.duration_minutes} Minutes
              </p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold font-mono ${timeRemaining < 300 ? 'text-error' : 'text-accent-secondary'}`}>
                {formatTime(timeRemaining)}
              </div>
              <p className="text-xs text-text-secondary uppercase tracking-wider">Time Remaining</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-bg-tertiary rounded-full h-2">
            <div
              className="bg-accent-secondary h-2 rounded-full transition-all"
              style={{
                width: `${(Object.keys(answers).filter((k) => answers[k]).length / examQuestions.length) * 100}%`,
              }}
            ></div>
          </div>
          <p className="text-xs text-text-secondary mt-2">
            {Object.keys(answers).filter((k) => answers[k]).length} of {examQuestions.length} answered
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-6 mb-6">
          {examQuestions.map((question, idx) => (
            <div
              key={question.id}
              className="bg-bg-secondary border border-bg-tertiary rounded-xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="bg-accent-secondary/20 text-accent-secondary text-sm font-mono px-3 py-1 rounded-full">
                    Q{idx + 1}
                  </span>
                  <span className="text-xs font-mono text-text-secondary uppercase">
                    {question.type} · {question.marks} marks
                  </span>
                </div>
              </div>

              <p className="text-text-primary text-lg mb-4">{question.question_text}</p>

              {/* MCQ Options */}
              {question.type === 'mcq' && question.options && (
                <div className="space-y-3">
                  {question.options.map((option, optIdx) => (
                    <label
                      key={optIdx}
                      className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                        answers[question.id]?.selected_option === option
                          ? 'border-accent-secondary bg-accent-secondary/5'
                          : 'border-bg-tertiary hover:border-text-tertiary'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={answers[question.id]?.selected_option === option}
                        onChange={(e) =>
                          handleAnswerChange(question.id, {
                            selected_option: e.target.value,
                          })
                        }
                        className="w-4 h-4 text-accent-secondary"
                      />
                      <span className="text-text-primary">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Short/Written Answer */}
              {['short', 'broad', 'creative'].includes(question.type) && (
                <textarea
                  value={answers[question.id]?.answer_text || ''}
                  onChange={(e) =>
                    handleAnswerChange(question.id, {
                      answer_text: e.target.value,
                    })
                  }
                  placeholder="Type your answer here..."
                  rows={8}
                  className="w-full bg-bg-primary border border-bg-tertiary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent-secondary resize-none"
                />
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="sticky bottom-0 bg-bg-secondary border border-bg-tertiary rounded-xl p-6">
          <button
            onClick={handleSubmitExam}
            disabled={submitting || Object.keys(answers).length === 0}
            className="w-full px-6 py-3 bg-accent-secondary text-bg-primary rounded-lg font-bold hover:bg-accent-secondary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Available Exams</h1>
        <p className="text-text-secondary">View and take available exams</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-accent-secondary border-t-transparent rounded-full"></div>
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-12 text-text-secondary">
          <p className="text-lg mb-2">No exams available</p>
          <p className="text-sm">Check back later for new exams</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-bg-secondary border border-bg-tertiary rounded-xl p-6 hover:border-accent-secondary/50 transition-all"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-text-primary mb-2">{exam.title}</h3>
                {exam.description && (
                  <p className="text-sm text-text-secondary line-clamp-2">{exam.description}</p>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{exam.duration_minutes} minutes</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Multiple questions</span>
                </div>
              </div>

              <button
                onClick={() => startExam(exam)}
                className="w-full px-4 py-2 bg-accent-secondary text-bg-primary rounded-lg font-medium hover:bg-accent-secondary/80 transition-colors"
              >
                Start Exam
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
