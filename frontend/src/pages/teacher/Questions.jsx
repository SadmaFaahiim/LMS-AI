import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import GenerateForm from '../../components/GenerateForm';
import QuestionCard from '../../components/QuestionCard';
import GeneratedQuestionsPanel from '../../components/GeneratedQuestionsPanel';
import SlideOutSheet from '../../components/SlideOutSheet';

export default function TeacherQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // New state for generation flow
  const [generationMode, setGenerationMode] = useState('idle'); // 'idle' | 'generating' | 'review'
  const [generatedQuestions, setGeneratedQuestions] = useState([]); // Temporary questions (not in DB yet)
  const [streamProgress, setStreamProgress] = useState({ current: 0, total: 0, message: '', error: false });
  const [stageMessages, setStageMessages] = useState([]); // Track stage history for display
  const [sheetOpen, setSheetOpen] = useState(false); // Controls slide-out sheet visibility

  const [filter, setFilter] = useState('all');
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data } = await api.getQuestions();
      setQuestions(data.data || []);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (params) => {
    setGenerationMode('generating');
    setSheetOpen(true); // Open sheet immediately
    setStreamProgress({ current: 0, total: 0, message: 'Initializing...', error: false });

    try {
      const response = await api.streamQuestions(params);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.stage === 'start') {
                setStreamProgress(prev => ({ ...prev, message: data.message || 'Starting generation...' }));
                setStageMessages(prev => [...prev, { stage: 'start', message: data.message || 'Starting generation...' }]);
              }

              if (data.stage === 'textbook_search') {
                setStreamProgress(prev => ({ ...prev, message: data.message }));
                setStageMessages(prev => [...prev, { stage: 'textbook_search', message: data.message }]);
              }

              if (data.stage === 'board_search') {
                setStreamProgress(prev => ({ ...prev, message: data.message }));
                setStageMessages(prev => [...prev, { stage: 'board_search', message: data.message, found: data.found }]);
              }

              if (data.stage === 'generating' && data.partial) {
                setStreamProgress(prev => ({ ...prev, message: data.message }));
                setStageMessages(prev => [...prev, { stage: 'generating', message: data.message }]);
              }

              if (data.stage === 'progress') {
                setStreamProgress({
                  current: data.current || 0,
                  total: data.total || 0,
                  message: `Generating question ${data.current || 0} of ${data.total || 0}...`,
                  error: false
                });
              }

              // CRITICAL: Handle individual questions arriving one by one
              if (data.stage === 'question_generated') {
                const newQuestion = {
                  ...data.question,
                  id: `temp-${Date.now()}-${data.current}`,
                  saved: false,
                  saving: false,
                  error: null
                };

                // Add question immediately (real-time appearance)
                setGeneratedQuestions(prev => [...prev, newQuestion]);

                // Update progress counter
                setStreamProgress({
                  current: data.current,
                  total: data.total,
                  message: `Generated question ${data.current} of ${data.total}...`,
                  error: false
                });
              }

              if (data.stage === 'done' && data.questions) {
                // Only add if no questions were added via question_generated (fallback)
                if (generatedQuestions.length === 0) {
                  const questionsWithTempIds = data.questions.map((q, idx) => ({
                    ...q,
                    id: `temp-${Date.now()}-${idx}`,
                    saved: false,
                    saving: false,
                    error: null
                  }));

                  setGeneratedQuestions(questionsWithTempIds);
                }
                setGenerationMode('review');
              }

              if (data.stage === 'error') {
                setStreamProgress({
                  current: 0,
                  total: 0,
                  message: data.message || 'Generation failed',
                  error: true
                });
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to generate questions:', error);
      setStreamProgress({
        current: 0,
        total: 0,
        message: error.message || 'Failed to generate questions',
        error: true
      });
    }
  };

  // Save individual question
  const handleSaveQuestion = async (question) => {
    setGeneratedQuestions(prev => prev.map(q =>
      q.id === question.id
        ? { ...q, saving: true, error: null }
        : q
    ));

    try {
      const response = await api.storeQuestionsFromRAG([question]);

      if (response.data.success && response.data.data.inserted.length > 0) {
        const savedId = response.data.data.inserted[0]?.id;

        setGeneratedQuestions(prev => prev.map(q =>
          q.id === question.id
            ? { ...q, id: savedId, saved: true, saving: false }
            : q
        ));
      } else {
        throw new Error('Failed to save question');
      }
    } catch (error) {
      setGeneratedQuestions(prev => prev.map(q =>
        q.id === question.id
          ? { ...q, saving: false, error: error.message || 'Failed to save' }
          : q
      ));
    }
  };

  // Remove question from temporary list
  const handleRemoveQuestion = (questionId) => {
    if (confirm('Remove this question from the list?')) {
      setGeneratedQuestions(prev => prev.filter(q => q.id !== questionId));
    }
  };

  // Edit question (placeholder for now)
  const handleEditQuestion = (question) => {
    console.log('Edit question:', question);
    // TODO: Open edit modal/sheet
    alert('Edit functionality coming soon!');
  };

  // Save all unsaved questions
  const handleSaveAll = async () => {
    const unsaved = generatedQuestions.filter(q => !q.saved);

    if (unsaved.length === 0) return;

    // Mark all as saving
    setGeneratedQuestions(prev => prev.map(q =>
      !q.saved ? { ...q, saving: true, error: null } : q
    ));

    try {
      const response = await api.storeQuestionsFromRAG(unsaved);

      if (response.data.success) {
        // Create map of temp IDs to real IDs
        const insertedMap = {};
        response.data.data.inserted.forEach((item, idx) => {
          if (unsaved[idx]) {
            insertedMap[unsaved[idx].id] = item.id;
          }
        });

        setGeneratedQuestions(prev => prev.map(q =>
          insertedMap[q.id]
            ? { ...q, id: insertedMap[q.id], saved: true, saving: false }
            : q
        ));
      } else {
        throw new Error('Failed to save questions');
      }
    } catch (error) {
      setGeneratedQuestions(prev => prev.map(q =>
        !q.saved ? { ...q, saving: false, error: error.message || 'Failed to save' } : q
      ));
    }
  };

  // Discard all generated questions
  const handleDiscardAll = () => {
    if (confirm('Discard all generated questions?')) {
      setGeneratedQuestions([]);
      setGenerationMode('idle');
    }
  };

  // Close panel and refresh questions list
  const handleClosePanel = async () => {
    const unsavedCount = generatedQuestions.filter(q => !q.saved).length;

    if (unsavedCount > 0) {
      if (!confirm(`You have ${unsavedCount} unsaved questions. Close anyway?`)) {
        return;
      }
    }

    setSheetOpen(false); // Close sheet
    setGeneratedQuestions([]);
    setGenerationMode('idle');

    // Refresh questions list in background
    await fetchQuestions();
  };

  const handlePublish = async (questionIds) => {
    try {
      await api.publishQuestions(questionIds);
      await fetchQuestions();
    } catch (error) {
      console.error('Failed to publish questions:', error);
      alert('Failed to publish questions. Please try again.');
    }
  };

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    if (filter === 'all') return true;
    return q.status === filter;
  }).filter(q => {
    if (!selectedType) return true;
    return q.type === selectedType;
  });

  const stats = {
    total: questions.length,
    draft: questions.filter(q => q.status === 'draft').length,
    published: questions.filter(q => q.status === 'published').length,
    rejected: questions.filter(q => q.status === 'rejected').length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Generate Form */}
      <GenerateForm onGenerate={handleGenerate} generating={generationMode === 'generating'} />

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-bg-secondary border border-bg-tertiary rounded-lg p-4">
          <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
          <p className="text-xs text-text-secondary font-mono uppercase">Total</p>
        </div>
        <div className="bg-bg-secondary border border-bg-tertiary rounded-lg p-4">
          <p className="text-2xl font-bold text-warning">{stats.draft}</p>
          <p className="text-xs text-text-secondary font-mono uppercase">Draft</p>
        </div>
        <div className="bg-bg-secondary border border-bg-tertiary rounded-lg p-4">
          <p className="text-2xl font-bold text-success">{stats.published}</p>
          <p className="text-xs text-text-secondary font-mono uppercase">Published</p>
        </div>
        <div className="bg-bg-secondary border border-bg-tertiary rounded-lg p-4">
          <p className="text-2xl font-bold text-error">{stats.rejected}</p>
          <p className="text-xs text-text-secondary font-mono uppercase">Rejected</p>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-bg-secondary border border-bg-tertiary rounded-xl p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <h2 className="text-sm font-mono uppercase tracking-widest text-accent-primary">
            Questions ({filteredQuestions.length})
          </h2>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                filter === 'all' ? 'bg-text-tertiary text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                filter === 'draft' ? 'bg-warning text-bg-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Draft
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                filter === 'published' ? 'bg-success text-bg-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                filter === 'rejected' ? 'bg-error text-bg-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Rejected
            </button>
          </div>
        </div>

        {/* Type Filter */}
        <div className="mb-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-bg-secondary border border-bg-tertiary rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary appearance-none"
          >
            <option value="">All Types</option>
            <option value="mcq">MCQ</option>
            <option value="short">Short Answer</option>
            <option value="broad">Broad Question</option>
            <option value="creative">Creative</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <p className="text-sm mb-2">
              {filter === 'all' ? 'No questions yet. Generate some questions to get started!' : `No ${filter} questions found.`}
            </p>
            {questions.length === 0 && (
              <p className="text-xs text-text-tertiary">Use the form above to generate your first questions.</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredQuestions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onUpdate={fetchQuestions}
              />
            ))}
          </div>
        )}
      </div>

      {/* Slide-out Sheet for Question Generation */}
      <SlideOutSheet
        isOpen={sheetOpen}
        onClose={handleClosePanel}
        title={generationMode === 'generating' ? 'Generating Questions...' : 'Review Generated Questions'}
        width="700px"
      >
        <GeneratedQuestionsPanel
          mode={generationMode}
          questions={generatedQuestions}
          streamProgress={streamProgress}
          stageHistory={stageMessages}
          onSaveQuestion={handleSaveQuestion}
          onRemoveQuestion={handleRemoveQuestion}
          onEditQuestion={handleEditQuestion}
          onSaveAll={handleSaveAll}
          onDiscardAll={handleDiscardAll}
          onClose={handleClosePanel}
          hideHeader={true}
        />
      </SlideOutSheet>
    </div>
  );
}
