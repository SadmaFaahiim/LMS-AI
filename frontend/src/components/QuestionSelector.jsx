import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { useLanguage } from "../contexts/LanguageContext";

export default function QuestionSelector({
  selectedIds,
  onChange,
  disabled = false,
}) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    fetchQuestions();
    fetchSubjects();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data } = await api.getQuestions({ is_published: "true" });
      setQuestions(data.data || []);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data } = await api.getSubjects();
      setSubjects(data.data || []);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
    }
  };

  // Get localized text
  const getLocalText = (item, field) => {
    const isBengaliExist = /[\u0980-\u09FF]/.test(item[field] || "");
    return !!item[field] && isBengaliExist
      ? item[field]
      : item[`${field}_en`] || "";
  };

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      !search ||
      getLocalText(q, "question_text")
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesType = !filterType || q.type === filterType;
    const matchesSubject = !filterSubject || q.subject === filterSubject;
    return matchesSearch && matchesType && matchesSubject;
  });

  const selectedQuestions = questions.filter((q) => selectedIds.includes(q.id));
  const toggleQuestion = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((qid) => qid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredQuestions.length) {
      onChange([]);
    } else {
      onChange(filteredQuestions.map((q) => q.id));
    }
  };

  const clearSelection = () => {
    onChange([]);
  };

  const selectClass =
    "bg-bg-secondary border border-bg-tertiary rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary appearance-none cursor-pointer";

  return (
    <div className='relative'>
      {/* Trigger Button */}
      <button
        type='button'
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-3 bg-bg-secondary border border-bg-tertiary rounded-lg text-left flex items-center justify-between transition-colors ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:border-accent-primary cursor-pointer"
        }`}>
        <div>
          <p className='text-sm font-medium text-text-primary'>
            {selectedIds.length === 0
              ? "Select questions..."
              : `${selectedIds.length} question${selectedIds.length > 1 ? "s" : ""} selected`}
          </p>
          {selectedIds.length > 0 && (
            <p className='text-xs text-text-secondary mt-1'>
              Total marks:{" "}
              {selectedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0)}
            </p>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-text-secondary transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className='absolute z-50 w-full mt-2 bg-bg-secondary border border-bg-tertiary rounded-xl shadow-2xl max-h-96 flex flex-col'>
          {/* Header with Search and Filters */}
          <div className='p-4 border-b border-bg-tertiary space-y-3'>
            <input
              type='text'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search questions...'
              className='w-full bg-bg-primary border border-bg-tertiary rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary'
            />

            <div className='flex gap-2'>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={selectClass}>
                <option value=''>All Types</option>
                <option value='mcq'>MCQ</option>
                <option value='short'>Short</option>
                <option value='broad'>Broad</option>
                <option value='creative'>Creative</option>
              </select>

              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className={selectClass}>
                <option value=''>All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className='flex items-center justify-between'>
              <label className='flex items-center gap-2 text-sm text-text-secondary cursor-pointer'>
                <input
                  type='checkbox'
                  checked={
                    selectedIds.length === filteredQuestions.length &&
                    filteredQuestions.length > 0
                  }
                  onChange={toggleAll}
                  className='w-4 h-4 text-accent-primary rounded'
                />
                Select All ({filteredQuestions.length})
              </label>

              {selectedIds.length > 0 && (
                <button
                  onClick={clearSelection}
                  className='text-xs text-error hover:text-error/80'>
                  Clear Selection
                </button>
              )}
            </div>
          </div>

          {/* Question List */}
          <div className='flex-1 overflow-y-auto p-2'>
            {loading ? (
              <div className='flex items-center justify-center py-8'>
                <div className='animate-spin w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full'></div>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className='text-center py-8 text-text-secondary text-sm'>
                No questions match your filters
              </div>
            ) : (
              <div className='space-y-1'>
                {filteredQuestions.map((question) => {
                  const isSelected = selectedIds.includes(question.id);
                  const questionText = getLocalText(question, "question_text");

                  return (
                    <label
                      key={question.id}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-accent-primary/10 border border-accent-primary/30"
                          : "hover:bg-bg-primary"
                      }`}>
                      <input
                        type='checkbox'
                        checked={isSelected}
                        onChange={() => toggleQuestion(question.id)}
                        className='w-4 h-4 text-accent-primary mt-1 rounded'
                      />
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm text-text-primary line-clamp-2'>
                          {questionText}
                        </p>
                        <div className='flex items-center gap-2 mt-1'>
                          <span
                            className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                              question.type === "mcq"
                                ? "bg-info/20 text-info"
                                : "bg-accent-secondary/20 text-accent-secondary"
                            }`}>
                            {question.type}
                          </span>
                          <span className='text-xs text-text-secondary font-mono'>
                            {question.marks} marks
                          </span>
                          {question.difficulty && (
                            <span className='text-xs text-text-secondary'>
                              · {question.difficulty}
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='p-3 border-t border-bg-tertiary flex items-center justify-between'>
            <span className='text-xs text-text-secondary'>
              {selectedIds.length} selected ·{" "}
              {selectedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0)}{" "}
              total marks
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className='px-4 py-1.5 bg-accent-primary text-bg-primary rounded text-sm font-bold hover:bg-accent-hover transition-colors'>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
