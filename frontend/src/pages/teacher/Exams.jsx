import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import QuestionSelector from '../../components/QuestionSelector';
import SlideOutSheet from '../../components/SlideOutSheet';

export default function TeacherExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_minutes: 30,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchExams();
  }, []);

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

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (selectedQuestionIds.length === 0) {
      newErrors.questions = 'Please select at least one question';
    }

    if (formData.duration_minutes < 5 || formData.duration_minutes > 300) {
      newErrors.duration = 'Duration must be between 5 and 300 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;

    setCreating(true);
    try {
      await api.createExam({
        ...formData,
        question_ids: selectedQuestionIds,
      });

      // Reset form
      setFormData({ title: '', description: '', duration_minutes: 30 });
      setSelectedQuestionIds([]);
      setShowCreateModal(false);
      setErrors({});

      // Refresh exams list
      await fetchExams();
    } catch (error) {
      console.error('Failed to create exam:', error);
      setErrors({ form: 'Failed to create exam. Please try again.' });
    } finally {
      setCreating(false);
    }
  };

  const inputClass = "w-full bg-bg-secondary border border-bg-tertiary rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary transition-colors";
  const labelClass = "block text-xs text-text-secondary mb-1.5 font-mono";
  const errorClass = "text-xs text-error mt-1";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Exams</h1>
          <p className="text-sm text-text-secondary mt-1">Create and manage exams</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-2.5 bg-accent-primary text-bg-primary rounded-lg text-sm font-bold hover:bg-accent-hover transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Exam
        </button>
      </div>

      {/* Exams List */}
      <div className="bg-bg-secondary border border-bg-tertiary rounded-xl p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full"></div>
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <p className="text-sm mb-2">No exams created yet.</p>
            <p className="text-xs text-text-tertiary">Click "Create Exam" to create your first exam.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="bg-bg-primary border border-bg-tertiary rounded-lg p-5 hover:border-text-tertiary transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-primary mb-2">{exam.title}</h3>
                    {exam.description && (
                      <p className="text-sm text-text-secondary mb-3">{exam.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-text-secondary">
                      <span className="font-mono">⏱ {exam.duration_minutes} mins</span>
                      <span>·</span>
                      <span className="font-mono">{exam.question_count || 0} questions</span>
                      <span>·</span>
                      <span>Created {new Date(exam.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.location.href = `/teacher/grading?exam=${exam.id}`}
                      className="px-3 py-1.5 text-xs border border-bg-tertiary text-text-secondary rounded hover:border-accent-primary hover:text-text-primary transition-colors"
                    >
                      View Submissions
                    </button>
                    <button
                      className="px-3 py-1.5 text-xs border border-bg-tertiary text-text-secondary rounded hover:border-error/60 hover:text-error transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Exam Modal */}
      <SlideOutSheet
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({ title: '', description: '', duration_minutes: 30 });
          setSelectedQuestionIds([]);
          setErrors({});
        }}
        title="Create New Exam"
        width="500px"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="space-y-4">
          {errors.form && (
            <div className="px-4 py-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">
              {errors.form}
            </div>
          )}

          {/* Title */}
          <div>
            <label className={labelClass}>Exam Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Physics Midterm Exam"
              className={inputClass}
            />
            {errors.title && <p className={errorClass}>{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description or instructions"
              rows={3}
              className={inputClass}
            />
          </div>

          {/* Duration */}
          <div>
            <label className={labelClass}>Duration (minutes) *</label>
            <input
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 30 })}
              min="5"
              max="300"
              className={inputClass}
            />
            {errors.duration && <p className={errorClass}>{errors.duration}</p>}
          </div>

          {/* Questions Selector */}
          <div>
            <label className={labelClass}>Select Questions *</label>
            <QuestionSelector
              selectedIds={selectedQuestionIds}
              onChange={setSelectedQuestionIds}
              disabled={creating}
            />
            {errors.questions && <p className={errorClass}>{errors.questions}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={creating}
              className="flex-1 px-6 py-2.5 bg-accent-primary text-bg-primary rounded-lg text-sm font-bold hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {creating ? 'Creating...' : 'Create Exam'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                setFormData({ title: '', description: '', duration_minutes: 30 });
                setSelectedQuestionIds([]);
                setErrors({});
              }}
              disabled={creating}
              className="px-6 py-2.5 border border-bg-tertiary text-text-secondary rounded-lg text-sm hover:border-text-tertiary hover:text-text-primary transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
          </div>
        </form>
      </SlideOutSheet>
    </div>
  );
}
