import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';

export default function QuestionEditForm({ question, onSave, onCancel, saving = false }) {
  const { language } = useLanguage();
  const [showEnglish, setShowEnglish] = useState(language === 'en');

  // Form state
  const [formData, setFormData] = useState({
    question_text: '',
    question_text_en: '',
    type: 'mcq',
    difficulty: 'medium',
    marks: 1,
    options: [],
    answer: '',
    answer_bn: '',
    explanation: '',
    explanation_bn: '',
    topic: '',
    subtopic: '',
    hint: '',
    status: 'draft',
    is_published: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (question) {
      setFormData({
        question_text: question.question_text || '',
        question_text_en: question.question_text_en || '',
        type: question.type || 'mcq',
        difficulty: question.difficulty || 'medium',
        marks: question.marks || 1,
        options: question.options
          ? (typeof question.options === 'string' ? JSON.parse(question.options) : question.options)
          : [],
        answer: question.answer || '',
        answer_bn: question.answer_bn || '',
        explanation: question.explanation || '',
        explanation_bn: question.explanation_bn || '',
        topic: question.topic || '',
        subtopic: question.subtopic || '',
        hint: question.hint || '',
        status: question.status || 'draft',
        is_published: question.is_published || false,
      });
    }
  }, [question]);

  const validate = () => {
    const newErrors = {};

    if (!formData.question_text.trim()) {
      newErrors.question_text = 'Question text is required';
    }

    if (showEnglish && !formData.question_text_en.trim()) {
      newErrors.question_text_en = 'English question text is required';
    }

    if (formData.type === 'mcq') {
      if (formData.options.length < 2) {
        newErrors.options = 'At least 2 options are required';
      }
      if (!formData.answer) {
        newErrors.answer = 'Please select the correct answer';
      }
    } else {
      if (!formData.answer.trim()) {
        newErrors.answer = 'Answer is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const dataToSave = { ...formData };

      // Stringify options for MCQ
      if (formData.type === 'mcq') {
        dataToSave.options = JSON.stringify(formData.options);
      } else {
        dataToSave.options = null;
      }

      onSave(dataToSave);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ''] });
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({ ...formData, options: newOptions });
    }
  };

  const inputClass = "w-full bg-bg-secondary border border-bg-tertiary rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary transition-colors";
  const labelClass = "block text-xs text-text-secondary mb-1.5 font-mono";
  const errorClass = "text-xs text-error mt-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Language Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowEnglish(false)}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
              !showEnglish
                ? 'bg-accent-primary text-bg-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            🇧🇦 বাংলা
          </button>
          <button
            type="button"
            onClick={() => setShowEnglish(true)}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
              showEnglish
                ? 'bg-accent-primary text-bg-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            🇬🇧 English
          </button>
        </div>
      </div>

      {/* Question Text - Bengali */}
      {!showEnglish && (
        <div>
          <label className={labelClass}>Question (বাংলা) *</label>
          <textarea
            value={formData.question_text}
            onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
            rows={3}
            className={inputClass}
            placeholder="প্রশ্ন লিখুন..."
          />
          {errors.question_text && <p className={errorClass}>{errors.question_text}</p>}
        </div>
      )}

      {/* Question Text - English */}
      {showEnglish && (
        <div>
          <label className={labelClass}>Question (English) *</label>
          <textarea
            value={formData.question_text_en}
            onChange={(e) => setFormData({ ...formData, question_text_en: e.target.value })}
            rows={3}
            className={inputClass}
            placeholder="Enter question..."
          />
          {errors.question_text_en && <p className={errorClass}>{errors.question_text_en}</p>}
        </div>
      )}

      {/* Question Type & Difficulty */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className={inputClass}
          >
            <option value="mcq">MCQ</option>
            <option value="short">Short Answer</option>
            <option value="broad">Broad Question</option>
            <option value="creative">Creative</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Difficulty</label>
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            className={inputClass}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Marks */}
      <div>
        <label className={labelClass}>Marks</label>
        <input
          type="number"
          value={formData.marks}
          onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) || 1 })}
          min="1"
          className={inputClass}
        />
      </div>

      {/* MCQ Options */}
      {formData.type === 'mcq' && (
        <div>
          <label className={labelClass}>Options *</label>
          <div className="space-y-2">
            {formData.options.map((option, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="radio"
                  name="correct_answer"
                  checked={formData.answer === option}
                  onChange={() => setFormData({ ...formData, answer: option })}
                  className="w-4 h-4 text-accent-primary"
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 bg-bg-secondary border border-bg-tertiary rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                />
                {formData.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-error hover:text-error/80 px-2"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="text-xs text-accent-primary hover:text-accent-hover mt-2"
            >
              + Add Option
            </button>
          </div>
          {errors.options && <p className={errorClass}>{errors.options}</p>}
          {errors.answer && <p className={errorClass}>{errors.answer}</p>}
        </div>
      )}

      {/* Answer (non-MCQ) */}
      {formData.type !== 'mcq' && (
        <div>
          <label className={labelClass}>Answer *</label>
          <textarea
            value={formData.answer}
            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
            rows={3}
            className={inputClass}
            placeholder="Enter correct answer..."
          />
          {errors.answer && <p className={errorClass}>{errors.answer}</p>}
        </div>
      )}

      {/* Explanation - Bengali */}
      {!showEnglish && (
        <div>
          <label className={labelClass}>Explanation (বাংলা)</label>
          <textarea
            value={formData.explanation}
            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
            rows={2}
            className={inputClass}
            placeholder="ব্যাখ্যা লিখুন..."
          />
        </div>
      )}

      {/* Explanation - English */}
      {showEnglish && (
        <div>
          <label className={labelClass}>Explanation (English)</label>
          <textarea
            value={formData.explanation_en || formData.explanation}
            onChange={(e) => setFormData({ ...formData, explanation_en: e.target.value })}
            rows={2}
            className={inputClass}
            placeholder="Enter explanation..."
          />
        </div>
      )}

      {/* Topic & Subtopic */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Topic</label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            className={inputClass}
            placeholder="e.g., Lens power"
          />
        </div>
        <div>
          <label className={labelClass}>Subtopic</label>
          <input
            type="text"
            value={formData.subtopic}
            onChange={(e) => setFormData({ ...formData, subtopic: e.target.value })}
            className={inputClass}
            placeholder="Optional"
          />
        </div>
      </div>

      {/* Hint */}
      <div>
        <label className={labelClass}>Hint</label>
        <input
          type="text"
          value={formData.hint}
          onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
          className={inputClass}
          placeholder="Optional hint for students"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 px-6 py-2.5 bg-accent-primary text-bg-primary rounded-lg text-sm font-bold hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-6 py-2.5 border border-bg-tertiary text-text-secondary rounded-lg text-sm hover:border-text-tertiary hover:text-text-primary transition-colors disabled:opacity-40"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
