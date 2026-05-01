import { useEffect, useMemo, useState } from "react";

const initialQuestionForm = {
  subject: "Biology",
  topic: "Photosynthesis",
  exam: "HSC",
  grade: "12",
  type: "mcq",
  difficulty: "medium",
  count: 5,
  language: "en",
  focusOnBoardStyle: true,
};

const initialExamForm = {
  title: "",
  description: "",
  duration_minutes: 60,
};

const tabs = [
  { id: "generate", label: "Generate" },
  { id: "questions", label: "Questions" },
  { id: "create-exam", label: "Create Exam" },
  { id: "exams", label: "Exams" },
];

function createDraft(question) {
  return {
    question_text: question.question_text || "",
    type: question.type || "mcq",
    difficulty: question.difficulty || "medium",
    marks: question.marks || 1,
    topic: question.topic || "",
    subtopic: question.subtopic || "",
    hint: question.hint || "",
    answer: question.answer || "",
    explanation: question.explanation || "",
    optionsText: Array.isArray(question.options) ? question.options.join("\n") : "",
  };
}

function normalizeEvent(event) {
  if (typeof event === "string") {
    return { stage: "message", message: event };
  }

  return {
    stage: event.stage || "update",
    message: event.message || event.status || "",
    questions: Array.isArray(event.questions) ? event.questions : [],
  };
}

async function apiRequest(url, options = {}) {
  let response;

  try {
    response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (error) {
    throw new Error("Unable to reach the API server. Check that the backend is running on http://localhost:3000.");
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      payload.message ||
      payload.error ||
      `Request failed with status ${response.status}`
    );
  }

  return payload;
}

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState("generate");
  const [questionForm, setQuestionForm] = useState(initialQuestionForm);
  const [examForm, setExamForm] = useState(initialExamForm);
  const [questions, setQuestions] = useState([]);
  const [exams, setExams] = useState([]);
  const [submittedExamIds, setSubmittedExamIds] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [streamEvents, setStreamEvents] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [questionError, setQuestionError] = useState("");
  const [examError, setExamError] = useState("");
  const [globalMessage, setGlobalMessage] = useState("");
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isLoadingExams, setIsLoadingExams] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCreatingExam, setIsCreatingExam] = useState(false);
  const [isSubmittingExam, setIsSubmittingExam] = useState(false);
  const [saveState, setSaveState] = useState({});

  const streamSummary = useMemo(() => {
    const lastEvent = streamEvents[streamEvents.length - 1];
    return lastEvent ? `${lastEvent.stage}: ${lastEvent.message || "event received"}` : "No stream started yet";
  }, [streamEvents]);

  const visibleExams = useMemo(
    () => exams.filter((exam) => !submittedExamIds.includes(exam.id)),
    [exams, submittedExamIds]
  );

  useEffect(() => {
    loadQuestions();
    loadExams();
  }, []);

  useEffect(() => {
    if (!selectedExam) {
      setTimeLeft(null);
      return;
    }

    setTimeLeft(Number(selectedExam.duration_minutes || 0) * 60);
  }, [selectedExam]);

  useEffect(() => {
    if (!selectedExam || timeLeft === null) {
      return;
    }

    if (timeLeft <= 0) {
      handleSubmitExam();
      return;
    }

    const timerId = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current === null) {
          return null;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [selectedExam, timeLeft]);

  async function loadQuestions() {
    setIsLoadingQuestions(true);
    setQuestionError("");

    try {
      const payload = await apiRequest("/api/questions?limit=50&offset=0");
      setQuestions(payload.data || []);
    } catch (requestError) {
      setQuestionError(requestError.message);
    } finally {
      setIsLoadingQuestions(false);
    }
  }

  async function loadExams() {
    setIsLoadingExams(true);
    setExamError("");

    try {
      const payload = await apiRequest("/api/exams");
      setExams(payload.data || []);
    } catch (requestError) {
      setExamError(requestError.message);
    } finally {
      setIsLoadingExams(false);
    }
  }

  function updateQuestionForm(field, value) {
    setQuestionForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateExamForm(field, value) {
    setExamForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleGenerate(event) {
    event.preventDefault();
    setQuestionError("");
    setGlobalMessage("");
    setIsStreaming(true);
    setStreamEvents([]);

    try {
      const response = await fetch("/api/questions/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...questionForm,
          count: Number(questionForm.count),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Unable to start stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() || "";

        for (const chunk of chunks) {
          const line = chunk.split("\n").find((entry) => entry.startsWith("data: "));
          if (!line) {
            continue;
          }

          const rawData = line.slice(6);

          try {
            const parsed = JSON.parse(rawData);
            setStreamEvents((current) => [...current, normalizeEvent(parsed)]);
          } catch {
            setStreamEvents((current) => [...current, normalizeEvent(rawData)]);
          }
        }
      }

      await loadQuestions();
      setGlobalMessage("Questions generated and refreshed from the API.");
    } catch (requestError) {
      setQuestionError(requestError.message);
      setStreamEvents((current) => [
        ...current,
        { stage: "error", message: requestError.message, questions: [] },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }

  function startEditing(question) {
    setEditingId(question.id);
    setDrafts((current) => ({
      ...current,
      [question.id]: createDraft(question),
    }));
  }

  function cancelEditing() {
    setEditingId(null);
  }

  function updateDraft(questionId, field, value) {
    setDrafts((current) => ({
      ...current,
      [questionId]: {
        ...(current[questionId] || {}),
        [field]: value,
      },
    }));
  }

  async function saveQuestion(questionId) {
    const draft = drafts[questionId];
    if (!draft) {
      return;
    }

    setSaveState((current) => ({ ...current, [questionId]: "saving" }));
    setQuestionError("");
    setGlobalMessage("");

    try {
      const payload = {
        question_text: draft.question_text,
        type: draft.type,
        difficulty: draft.difficulty,
        marks: Number(draft.marks) || 1,
        topic: draft.topic,
        subtopic: draft.subtopic,
        hint: draft.hint,
        answer: draft.answer,
        explanation: draft.explanation,
        options:
          draft.type === "mcq"
            ? draft.optionsText
                .split("\n")
                .map((option) => option.trim())
                .filter(Boolean)
            : null,
      };

      const response = await apiRequest(`/api/questions/${questionId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setQuestions((current) =>
        current.map((question) => (question.id === questionId ? response.data : question))
      );
      setSaveState((current) => ({ ...current, [questionId]: "saved" }));
      setEditingId(null);
      setGlobalMessage(`Question #${questionId} saved.`);
    } catch (requestError) {
      setSaveState((current) => ({ ...current, [questionId]: "error" }));
      setQuestionError(requestError.message);
    }
  }

  function toggleQuestionSelection(questionId) {
    setSelectedQuestionIds((current) =>
      current.includes(questionId)
        ? current.filter((id) => id !== questionId)
        : [...current, questionId]
    );
  }

  async function handleCreateExam(event) {
    event.preventDefault();
    setExamError("");
    setGlobalMessage("");

    if (selectedQuestionIds.length === 0) {
      setExamError("Select at least one question before creating an exam.");
      return;
    }

    setIsCreatingExam(true);

    try {
      const response = await apiRequest("/api/exams", {
        method: "POST",
        body: JSON.stringify({
          title: examForm.title,
          description: examForm.description,
          duration_minutes: Number(examForm.duration_minutes),
          question_ids: selectedQuestionIds,
        }),
      });

      setExamForm(initialExamForm);
      setSelectedQuestionIds([]);
      await loadExams();
      setActiveTab("exams");
      setGlobalMessage(`Exam created successfully: ${response.data.title}`);
    } catch (requestError) {
      setExamError(requestError.message);
    } finally {
      setIsCreatingExam(false);
    }
  }

  async function openExam(examId) {
    setExamError("");
    setSubmissionResult(null);

    try {
      const response = await apiRequest(`/api/exams/${examId}`);
      setSelectedExam(response.data);
      setAnswers({});
      setStudentName("");
    } catch (requestError) {
      setExamError(requestError.message);
    }
  }

  function updateAnswer(question, value) {
    setAnswers((current) => ({
      ...current,
      [question.id]:
        question.type === "mcq"
          ? { question_id: question.id, selected_option: value }
          : { question_id: question.id, answer_text: value },
    }));
  }

  async function handleSubmitExam(event) {
    if (event) {
      event.preventDefault();
    }

    if (!selectedExam || isSubmittingExam) {
      return;
    }

    setExamError("");
    setGlobalMessage("");
    setIsSubmittingExam(true);

    try {
      const payload = {
        exam_id: selectedExam.id,
        student_name: studentName,
        answers: selectedExam.questions.map((question) => ({
          question_id: question.id,
          question_type: question.type,
          selected_option: answers[question.id]?.selected_option || null,
          answer_text: answers[question.id]?.answer_text || null,
        })),
      };

      const response = await apiRequest("/api/exams/submit", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSubmissionResult(response.data);
      setSubmittedExamIds((current) => [...new Set([...current, selectedExam.id])]);
      setExams((current) => current.filter((exam) => exam.id !== selectedExam.id));
      setSelectedExam(null);
      setTimeLeft(null);
      setStudentName("");
      setAnswers({});
      setGlobalMessage("Exam submitted successfully. It has been removed from the Exams tab.");
    } catch (requestError) {
      setExamError(requestError.message);
    } finally {
      setIsSubmittingExam(false);
    }
  }

  function renderGenerateTab() {
    return (
      <section className="panel">
        <div className="panel-heading">
          <h2>Generate Questions</h2>
          <p>Start the RAG stream and store generated questions through the API.</p>
        </div>

        <form className="generator-grid" onSubmit={handleGenerate}>
          <label>
            Subject
            <input value={questionForm.subject} onChange={(event) => updateQuestionForm("subject", event.target.value)} />
          </label>
          <label>
            Topic
            <input value={questionForm.topic} onChange={(event) => updateQuestionForm("topic", event.target.value)} />
          </label>
          <label>
            Exam
            <input value={questionForm.exam} onChange={(event) => updateQuestionForm("exam", event.target.value)} />
          </label>
          <label>
            Grade
            <input value={questionForm.grade} onChange={(event) => updateQuestionForm("grade", event.target.value)} />
          </label>
          <label>
            Type
            <select value={questionForm.type} onChange={(event) => updateQuestionForm("type", event.target.value)}>
              <option value="mcq">MCQ</option>
              <option value="short">Short</option>
              <option value="broad">Broad</option>
              <option value="creative">Creative</option>
            </select>
          </label>
          <label>
            Difficulty
            <select value={questionForm.difficulty} onChange={(event) => updateQuestionForm("difficulty", event.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <label>
            Count
            <input type="number" min="1" max="20" value={questionForm.count} onChange={(event) => updateQuestionForm("count", event.target.value)} />
          </label>
          <label>
            Language
            <input value={questionForm.language} onChange={(event) => updateQuestionForm("language", event.target.value)} />
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={questionForm.focusOnBoardStyle}
              onChange={(event) => updateQuestionForm("focusOnBoardStyle", event.target.checked)}
            />
            Board style
          </label>
          <button className="primary-button" type="submit" disabled={isStreaming}>
            {isStreaming ? "Streaming..." : "Start Stream"}
          </button>
        </form>

        <div className="stream-log">
          {streamEvents.length === 0 ? (
            <p className="muted">Stream updates will appear here.</p>
          ) : (
            streamEvents.map((entry, index) => (
              <div className={`stream-entry stream-${entry.stage}`} key={`${entry.stage}-${index}`}>
                <strong>{entry.stage}</strong>
                <span>{entry.message || `${entry.questions.length} questions received`}</span>
              </div>
            ))
          )}
        </div>
      </section>
    );
  }

  function renderQuestionsTab() {
    return (
      <section className="panel">
        <div className="panel-heading panel-heading-inline">
          <div>
            <h2>Question Bank</h2>
            <p>Edit stored questions and choose which ones belong in an exam.</p>
          </div>
          <button className="secondary-button" type="button" onClick={loadQuestions}>
            Refresh
          </button>
        </div>

        {isLoadingQuestions ? <p className="muted">Loading questions...</p> : null}

        <div className="question-list">
          {questions.map((question) => {
            const isEditing = editingId === question.id;
            const draft = drafts[question.id] || createDraft(question);
            const isSelected = selectedQuestionIds.includes(question.id);

            return (
              <article className="question-card" key={question.id}>
                <div className="question-card-top">
                  <div className="question-meta">
                    <span>#{question.id}</span>
                    <span>{question.type}</span>
                    <span>{question.difficulty}</span>
                    <span>{question.status}</span>
                  </div>
                  <label className="select-toggle">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleQuestionSelection(question.id)}
                    />
                    Select for exam
                  </label>
                </div>

                {isEditing ? (
                  <div className="editor-grid">
                    <label>
                      Question
                      <textarea
                        rows="4"
                        value={draft.question_text}
                        onChange={(event) => updateDraft(question.id, "question_text", event.target.value)}
                      />
                    </label>
                    <label>
                      Answer
                      <textarea
                        rows="3"
                        value={draft.answer}
                        onChange={(event) => updateDraft(question.id, "answer", event.target.value)}
                      />
                    </label>
                    <label>
                      Explanation
                      <textarea
                        rows="3"
                        value={draft.explanation}
                        onChange={(event) => updateDraft(question.id, "explanation", event.target.value)}
                      />
                    </label>
                    <label>
                      Options
                      <textarea
                        rows="4"
                        value={draft.optionsText}
                        onChange={(event) => updateDraft(question.id, "optionsText", event.target.value)}
                        placeholder="One option per line"
                      />
                    </label>
                    <label>
                      Type
                      <select value={draft.type} onChange={(event) => updateDraft(question.id, "type", event.target.value)}>
                        <option value="mcq">MCQ</option>
                        <option value="short">Short</option>
                        <option value="broad">Broad</option>
                        <option value="creative">Creative</option>
                      </select>
                    </label>
                    <label>
                      Difficulty
                      <select value={draft.difficulty} onChange={(event) => updateDraft(question.id, "difficulty", event.target.value)}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </label>
                    <label>
                      Marks
                      <input type="number" min="1" value={draft.marks} onChange={(event) => updateDraft(question.id, "marks", event.target.value)} />
                    </label>
                    <label>
                      Topic
                      <input value={draft.topic} onChange={(event) => updateDraft(question.id, "topic", event.target.value)} />
                    </label>
                    <label>
                      Subtopic
                      <input value={draft.subtopic} onChange={(event) => updateDraft(question.id, "subtopic", event.target.value)} />
                    </label>
                    <label>
                      Hint
                      <input value={draft.hint} onChange={(event) => updateDraft(question.id, "hint", event.target.value)} />
                    </label>

                    <div className="editor-actions">
                      <button className="primary-button" type="button" onClick={() => saveQuestion(question.id)}>
                        Save
                      </button>
                      <button className="secondary-button" type="button" onClick={cancelEditing}>
                        Cancel
                      </button>
                      <span className="save-state">{saveState[question.id] || ""}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3>{question.question_text}</h3>
                    {Array.isArray(question.options) && question.options.length > 0 ? (
                      <ol className="option-list">
                        {question.options.map((option, index) => (
                          <li key={`${question.id}-option-${index}`}>{option}</li>
                        ))}
                      </ol>
                    ) : null}
                    <p><strong>Answer:</strong> {question.answer || "N/A"}</p>
                    <p><strong>Explanation:</strong> {question.explanation || "N/A"}</p>
                    <div className="card-actions">
                      <button className="secondary-button" type="button" onClick={() => startEditing(question)}>
                        Edit question
                      </button>
                    </div>
                  </>
                )}
              </article>
            );
          })}

          {!isLoadingQuestions && questions.length === 0 ? <p className="muted">No questions found.</p> : null}
        </div>
      </section>
    );
  }

  function renderCreateExamTab() {
    const selectedQuestions = questions.filter((question) => selectedQuestionIds.includes(question.id));

    return (
      <section className="panel">
        <div className="panel-heading">
          <h2>Create Exam</h2>
          <p>Create an exam using the selected question IDs from the Questions tab.</p>
        </div>

        <form className="exam-builder" onSubmit={handleCreateExam}>
          <div className="generator-grid">
            <label>
              Title
              <input value={examForm.title} onChange={(event) => updateExamForm("title", event.target.value)} />
            </label>
            <label>
              Duration in minutes
              <input
                type="number"
                min="1"
                value={examForm.duration_minutes}
                onChange={(event) => updateExamForm("duration_minutes", event.target.value)}
              />
            </label>
            <label className="full-width">
              Description
              <textarea rows="4" value={examForm.description} onChange={(event) => updateExamForm("description", event.target.value)} />
            </label>
          </div>

          <div className="selection-summary">
            <strong>Selected questions: {selectedQuestionIds.length}</strong>
            {selectedQuestions.length > 0 ? (
              <div className="selected-chip-row">
                {selectedQuestions.map((question) => (
                  <button
                    className="selected-chip"
                    type="button"
                    key={question.id}
                    onClick={() => toggleQuestionSelection(question.id)}
                  >
                    #{question.id}
                  </button>
                ))}
              </div>
            ) : (
              <p className="muted">Go to the Questions tab and select the questions you want to include.</p>
            )}
          </div>

          <button className="primary-button" type="submit" disabled={isCreatingExam}>
            {isCreatingExam ? "Creating..." : "Create Exam"}
          </button>
        </form>
      </section>
    );
  }

  function renderExamsTab() {
    return (
      <section className="panel">
        <div className="panel-heading panel-heading-inline">
          <div>
            <h2>Exams</h2>
            <p>Open an exam, answer its questions, and submit it. Submitted exams disappear from this tab.</p>
          </div>
          <button className="secondary-button" type="button" onClick={loadExams}>
            Refresh
          </button>
        </div>

        <div className="exam-layout">
          <div className="exam-list">
            {isLoadingExams ? <p className="muted">Loading exams...</p> : null}
            {!isLoadingExams && visibleExams.length === 0 ? <p className="muted">No available exams.</p> : null}

            {visibleExams.map((exam) => (
              <article className="exam-card" key={exam.id}>
                <div className="question-meta">
                  <span>#{exam.id}</span>
                  <span>{exam.duration_minutes} min</span>
                </div>
                <h3>{exam.title}</h3>
                <p>{exam.description || "No description"}</p>
                <button className="secondary-button" type="button" onClick={() => openExam(exam.id)}>
                  Open exam
                </button>
              </article>
            ))}
          </div>

          <div className="exam-workspace">
            {selectedExam ? (
              <form className="exam-taker" onSubmit={handleSubmitExam}>
                <div className="panel-heading">
                  <h2>{selectedExam.title}</h2>
                  <p>Duration: {selectedExam.duration_minutes} minutes</p>
                </div>

                <div className={`timer-badge ${timeLeft !== null && timeLeft <= 60 ? "timer-danger" : ""}`}>
                  Time left: {formatTime(timeLeft ?? 0)}
                </div>

                <label>
                  Student name
                  <input value={studentName} onChange={(event) => setStudentName(event.target.value)} />
                </label>

                <div className="take-question-list">
                  {selectedExam.questions.map((question, index) => (
                    <article className="take-question-card" key={question.id}>
                      <h3>{index + 1}. {question.question_text}</h3>
                      {question.hint ? <p className="muted">Hint: {question.hint}</p> : null}

                      {question.type === "mcq" ? (
                        <div className="mcq-options">
                          {(question.options || []).map((option) => (
                            <label className="option-row" key={`${question.id}-${option}`}>
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                checked={answers[question.id]?.selected_option === option}
                                onChange={() => updateAnswer(question, option)}
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <textarea
                          rows="4"
                          value={answers[question.id]?.answer_text || ""}
                          onChange={(event) => updateAnswer(question, event.target.value)}
                          placeholder="Write the answer here"
                        />
                      )}
                    </article>
                  ))}
                </div>

                <div className="editor-actions">
                  <button className="primary-button" type="submit" disabled={isSubmittingExam}>
                    {isSubmittingExam ? "Submitting..." : "Submit Exam"}
                  </button>
                  <button className="secondary-button" type="button" onClick={() => setSelectedExam(null)}>
                    Close
                  </button>
                </div>
              </form>
            ) : (
              <div className="empty-workspace">
                <p>Select an exam from the list to open it.</p>
              </div>
            )}
          </div>
        </div>

        {submissionResult ? (
          <div className="result-panel">
            <h3>Last Submission</h3>
            <p>Submission ID: {submissionResult.submission_id}</p>
            <p>Total Score: {submissionResult.total_score}</p>
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Question And Exam Studio</p>
          <h1>Generate, edit, assemble, and submit questions through separate workflow tabs.</h1>
        </div>
        <div className="hero-card">
          <span>Live stream</span>
          <strong>{isStreaming ? "Running" : "Idle"}</strong>
          <p>{streamSummary}</p>
        </div>
      </header>

      <nav className="tab-bar">
        {tabs.map((tab) => (
          <button
            className={`tab-button ${activeTab === tab.id ? "tab-active" : ""}`}
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {globalMessage ? <div className="success-banner">{globalMessage}</div> : null}
      {questionError ? <div className="error-banner">{questionError}</div> : null}
      {examError ? <div className="error-banner">{examError}</div> : null}

      <main className="tab-content">
        {activeTab === "generate" ? renderGenerateTab() : null}
        {activeTab === "questions" ? renderQuestionsTab() : null}
        {activeTab === "create-exam" ? renderCreateExamTab() : null}
        {activeTab === "exams" ? renderExamsTab() : null}
      </main>
    </div>
  );
}
