import { useState, useCallback } from "react";
import { api } from "../lib/api";
import { useLanguage } from "../contexts/LanguageContext";
import { getSession } from "../lib/session";

export default function QuestionDrawer({
  isOpen,
  onClose,
  question,
  onSubmit,
}) {
  const [selectedOption, setSelectedOption] = useState("");
  const [shortAnswer, setShortAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { language } = useLanguage();

  const isMCQ = question?.type === "mcq";

  // Get localized text
  const getLocalText = (item, field) => {
    const isBengaliExist = /[\u0980-\u09FF]/.test(item[field] || "");
    return !!item[field] && isBengaliExist
      ? item[field]
      : item[`${field}_en`] || "";
  };

  const questionText = getLocalText("question_text");
  const options =
    isMCQ && question.options
      ? typeof question.options === "string"
        ? JSON.parse(question.options)
        : question.options
      : [];

  const handleSubmit = async () => {
    setError(null);

    if (isMCQ && !selectedOption) {
      setError("Please select an answer");
      return;
    }

    if (!isMCQ && !shortAnswer.trim()) {
      setError("Please enter your answer");
      return;
    }

    setSubmitting(true);

    try {
      const session = getSession();
      const answer = isMCQ ? selectedOption : shortAnswer.trim();

      // For now, we'll just simulate submission
      // TODO: Replace with actual API call when endpoint is available
      // await api.submitAnswer(question.id, session.studentName, answer);

      // Show success message
      setSuccess(true);

      // Notify parent component
      if (onSubmit) {
        onSubmit({
          question_id: question.id,
          answer,
          type: question.type,
        });
      }

      // Close drawer after short delay
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to submit answer",
      );
      setSubmitting(false);
      setSuccess(false);
    }
  };

  const handleClose = useCallback(() => {
    setSelectedOption("");
    setShortAnswer("");
    setError(null);
    setSuccess(false);
    setSubmitting(false);
    onClose();
  }, [onClose]);

  if (!isOpen || !question) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex justify-end z-50'>
      <div className='w-full max-w-2xl bg-bg-secondary border-l border-bg-tertiary h-full overflow-y-auto'>
        {/* Header */}
        <div className='sticky top-0 bg-bg-secondary border-b border-bg-tertiary px-6 py-4 z-10'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='flex items-center gap-2 mb-1'>
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                    isMCQ
                      ? "bg-info/20 text-info"
                      : "bg-accent-secondary/20 text-accent-secondary"
                  }`}>
                  {isMCQ ? "MCQ" : "Short Answer"}
                </span>
                <span className='text-[10px] font-mono uppercase text-text-secondary'>
                  {question.marks} marks · {question.difficulty}
                </span>
              </div>
              <h2 className='text-lg font-bold text-text-primary'>
                Answer Question
              </h2>
            </div>
            <button
              onClick={handleClose}
              className='p-2 hover:bg-bg-tertiary rounded-lg transition-colors'>
              <svg
                className='w-5 h-5 text-text-secondary'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='p-6'>
          {/* Question */}
          <div className='mb-8'>
            <label className='block text-xs font-mono text-text-secondary mb-2'>
              QUESTION
            </label>
            <p className='text-lg text-text-primary leading-relaxed'>
              {questionText}
            </p>
          </div>

          {/* Answer Options */}
          {isMCQ ? (
            <div className='mb-6'>
              <label className='block text-xs font-mono text-text-secondary mb-3'>
                SELECT YOUR ANSWER
              </label>
              <div className='space-y-3'>
                {options.map((option, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedOption === option
                        ? "border-accent-secondary bg-accent-secondary/5"
                        : "border-bg-tertiary hover:border-text-tertiary"
                    }`}>
                    <input
                      type='radio'
                      name='answer'
                      value={option}
                      checked={selectedOption === option}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className='w-4 h-4 text-accent-secondary bg-bg-secondary border-text-tertiary focus:ring-accent-secondary'
                    />
                    <span className='text-text-primary'>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className='mb-6'>
              <label className='block text-xs font-mono text-text-secondary mb-2'>
                YOUR ANSWER
              </label>
              <textarea
                value={shortAnswer}
                onChange={(e) => setShortAnswer(e.target.value)}
                placeholder='Type your answer here...'
                rows={10}
                className='w-full bg-bg-secondary border border-bg-tertiary rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent-secondary transition-colors resize-none'
              />
              <p className='text-xs text-text-tertiary mt-2'>
                Your answer will be evaluated by AI. This may take a few
                moments.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className='mb-6 px-4 py-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm'>
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className='mb-6 px-4 py-3 rounded-lg bg-success/10 border border-success/30 text-success text-sm flex items-center gap-3'>
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
              <div>
                <p className='font-medium'>Answer submitted successfully!</p>
                <p className='text-xs text-success/70 mt-1'>
                  {isMCQ
                    ? "Your answer has been recorded."
                    : "AI is evaluating your answer. Check the Submissions page for results."}
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting || success}
            className='w-full px-6 py-3 bg-accent-secondary text-bg-primary rounded-lg font-bold hover:bg-accent-secondary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
            {submitting ? (
              <>
                <span className='animate-spin inline-block w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full' />
                Submitting...
              </>
            ) : success ? (
              <>
                <svg
                  className='w-4 h-4'
                  fill='currentColor'
                  viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
                Submitted!
              </>
            ) : (
              "Submit Answer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
