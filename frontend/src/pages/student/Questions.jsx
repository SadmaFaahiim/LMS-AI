import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { useLanguage } from "../../contexts/LanguageContext";
import QuestionDrawer from "../../components/QuestionDrawer";

export default function StudentQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [filter, setFilter] = useState("all");
  const { language } = useLanguage();

  useEffect(() => {
    fetchQuestions();
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

  const handleAnswerSubmit = (submission) => {
    console.log("Answer submitted:", submission);
    // TODO: Update submissions list or show notification
  };

  // Get localized text helper
  const getLocalText = (item, field) => {
    const isBengaliExist = /[\u0980-\u09FF]/.test(item[field] || "");
    return !!item[field] && isBengaliExist
      ? item[field]
      : item[`${field}_en`] || "";
  };
  // Filter questions by type
  const filteredQuestions = questions.filter((q) => {
    if (filter === "all") return true;
    return q.type === filter;
  });

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin w-8 h-8 border-2 border-accent-secondary border-t-transparent rounded-full'></div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto space-y-6'>
      <div className='flex items-center justify-between flex-wrap gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-text-primary'>Questions</h1>
          <p className='text-sm text-text-secondary mt-1'>
            {questions.length} questions available
          </p>
        </div>

        {/* Type Filter */}
        <div className='flex gap-2'>
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
              filter === "all"
                ? "bg-accent-secondary text-bg-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}>
            All
          </button>
          <button
            onClick={() => setFilter("mcq")}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
              filter === "mcq"
                ? "bg-info/20 text-info"
                : "text-text-secondary hover:text-text-primary"
            }`}>
            MCQ
          </button>
          <button
            onClick={() => setFilter("short")}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
              filter === "short"
                ? "bg-accent-secondary/20 text-accent-secondary"
                : "text-text-secondary hover:text-text-primary"
            }`}>
            Short
          </button>
          <button
            onClick={() => setFilter("broad")}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
              filter === "broad"
                ? "bg-accent-secondary/20 text-accent-secondary"
                : "text-text-secondary hover:text-text-primary"
            }`}>
            Broad
          </button>
          <button
            onClick={() => setFilter("creative")}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
              filter === "creative"
                ? "bg-accent-secondary/20 text-accent-secondary"
                : "text-text-secondary hover:text-text-primary"
            }`}>
            Creative
          </button>
        </div>
      </div>

      {filteredQuestions.length === 0 ? (
        <div className='bg-bg-secondary border border-bg-tertiary rounded-xl p-12 text-center'>
          <p className='text-text-secondary'>
            {questions.length === 0
              ? "No questions available yet. Check back later!"
              : `No ${filter} questions found.`}
          </p>
        </div>
      ) : (
        <div className='grid gap-4'>
          {filteredQuestions.map((question) => {
            const questionText = getLocalText(question, "question_text");
            const isMCQ = question.type === "mcq";

            return (
              <div
                key={question.id}
                className='bg-bg-secondary border border-bg-tertiary rounded-xl p-6 hover:border-accent-secondary/50 transition-colors'>
                <div className='flex items-start justify-between gap-4 mb-3'>
                  <div className='flex-1'>
                    <p className='text-base text-text-primary leading-relaxed mb-3'>
                      {questionText}
                    </p>

                    {/* MCQ Options Preview */}
                    {isMCQ && question.options && (
                      <div className='grid grid-cols-2 gap-2 mt-3'>
                        {(typeof question.options === "string"
                          ? JSON.parse(question.options)
                          : question.options
                        )
                          .slice(0, 4)
                          .map((opt, i) => (
                            <div
                              key={i}
                              className='text-xs px-3 py-1.5 rounded bg-bg-primary border border-bg-tertiary text-text-secondary'>
                              {opt}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  <div className='flex flex-col items-end gap-2 shrink-0'>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                        isMCQ
                          ? "bg-info/20 text-info"
                          : "bg-accent-secondary/20 text-accent-secondary"
                      }`}>
                      {question.type}
                    </span>
                    <span className='text-xs text-text-secondary font-mono'>
                      {question.marks} {question.marks === 1 ? "mark" : "marks"}
                    </span>
                  </div>
                </div>

                <div className='flex items-center justify-between mt-4 pt-4 border-t border-bg-tertiary'>
                  <div className='flex items-center gap-3 text-xs text-text-secondary'>
                    <span className='font-mono'>{question.difficulty}</span>
                    {question.topic && (
                      <>
                        <span>·</span>
                        <span>{question.topic}</span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedQuestion(question)}
                    className='px-4 py-2 bg-accent-secondary text-bg-primary rounded-lg text-sm font-bold hover:bg-accent-secondary/80 transition-colors'>
                    {isMCQ ? "Answer Question" : "Submit Answer"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Question Drawer */}
      <QuestionDrawer
        isOpen={!!selectedQuestion}
        question={selectedQuestion}
        onClose={() => setSelectedQuestion(null)}
        onSubmit={handleAnswerSubmit}
      />
    </div>
  );
}
