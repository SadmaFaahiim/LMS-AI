# LMS Frontend Migration - Implementation Status & Next Steps

## Completed So Far

### ✅ Phase 1: Foundation Setup
- [x] Installed dependencies: React Router v6, Axios, Tailwind CSS
- [x] Configured Tailwind with design system colors
- [x] Created folder structure: components/, pages/, lib/, contexts/

### ✅ Phase 2: Core Infrastructure
- [x] Created API client (`src/lib/api.js`) with all endpoints
- [x] Created session management (`src/lib/session.js`)
- [x] Created LanguageContext provider
- [x] Created SlideOutSheet component

### ✅ Phase 3: Backend Enhancement
- [x] Created subjectController.js with listSubjects and listTopics
- [x] Added routes to api.js for subjects and topics

---

## Next Steps - Critical Files to Create

### 1. Base Components (Priority: HIGH)

Create these files in `src/components/`:

#### a) GenerateForm.jsx
```jsx
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function GenerateForm({ onGenerate, generating }) {
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [subtopic, setSubtopic] = useState('');
  const [examType, setExamType] = useState('HSC');
  const [grade, setGrade] = useState('12');
  const [questionType, setQuestionType] = useState('mcq');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(10);
  const [language, setLanguage] = useState('bn');

  useEffect(() => {
    api.getSubjects().then(res => setSubjects(res.data.data || []));
  }, []);

  useEffect(() => {
    if (!subjectId) return;
    setTopicId('');
    api.getTopics(subjectId).then(res => setTopics(res.data.data || []));
  }, [subjectId]);

  const handleSubmit = () => {
    if (!subjectId || !topicId) return;
    onGenerate({
      subject_id: parseInt(subjectId),
      topic_id: parseInt(topicId),
      subtopic: subtopic || undefined,
      exam: examType,
      grade,
      type: questionType,
      difficulty,
      count,
      language,
    });
  };

  return (
    <div className="bg-bg-secondary border border-bg-tertiary rounded-xl p-6">
      <h2 className="text-sm font-mono uppercase tracking-widest text-accent-primary mb-4">
        Generate Questions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Subject */}
        <div>
          <label className="block text-xs text-text-secondary mb-1.5 font-mono">Subject *</label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full bg-bg-secondary border border-bg-tertiary rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary appearance-none"
          >
            <option value="">Select subject…</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Topic */}
        <div>
          <label className="block text-xs text-text-secondary mb-1.5 font-mono">Topic *</label>
          <select
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            disabled={!subjectId}
            className="w-full bg-bg-secondary border border-bg-tertiary rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary appearance-none disabled:opacity-40"
          >
            <option value="">Select topic…</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Subtopic */}
        <div>
          <label className="block text-xs text-text-secondary mb-1.5 font-mono">Subtopic</label>
          <input
            type="text"
            value={subtopic}
            onChange={(e) => setSubtopic(e.target.value)}
            placeholder="Optional"
            className="w-full bg-bg-secondary border border-bg-tertiary rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
          />
        </div>

        {/* Exam Type */}
        <div>
          <label className="block text-xs text-text-secondary mb-1.5 font-mono">Exam Type</label>
          <select
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
            className="w-full bg-bg-secondary border border-bg-tertiary rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary appearance-none"
          >
            <option value="HSC">HSC</option>
            <option value="Admission">Admission</option>
            <option value="General">General</option>
          </select>
        </div>

        {/* Grade */}
        <div>
          <label className="block text-xs text-text-secondary mb-1.5 font-mono">Grade</label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full bg-bg-secondary border border-bg-tertiary rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary appearance-none"
          >
            <option value="9">Class 9</option>
            <option value="10">Class 10 (SSC)</option>
            <option value="11">Class 11</option>
            <option value="12">Class 12 (HSC)</option>
          </select>
        </div>

        {/* Question Type */}
        <div>
          <label className="block text-xs text-text-secondary mb-1.5 font-mono">Question Type</label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            className="w-full bg-bg-secondary border border-bg-tertiary rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary appearance-none"
          >
            <option value="mcq">MCQ</option>
            <option value="short">Short Answer</option>
            <option value="broad">Broad Question</option>
            <option value="creative">Creative</option>
          </select>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-xs text-text-secondary mb-1.5 font-mono">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full bg-bg-secondary border border-bg-tertiary rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary appearance-none"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Count */}
        <div>
          <label className="block text-xs text-text-secondary mb-1.5 font-mono">Count</label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
            min="1"
            max="50"
            className="w-full bg-bg-secondary border border-bg-tertiary rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
          />
        </div>

        {/* Language */}
        <div>
          <label className="block text-xs text-text-secondary mb-1.5 font-mono">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-bg-secondary border border-bg-tertiary rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary appearance-none"
          >
            <option value="bn">বাংলা (Bengali)</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={handleSubmit}
          disabled={!subjectId || !topicId || generating}
          className="px-6 py-2.5 bg-accent-primary text-bg-primary rounded-lg text-sm font-bold hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {generating ? (
            <>
              <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-bg-primary border-t-transparent rounded-full" />
              Generating…
            </>
          ) : (
            '⚡ Generate Questions'
          )}
        </button>
      </div>
    </div>
  );
}
```

#### b) QuestionCard.jsx
(Simplified version - adapt from reference, use api.updateQuestion)

#### c) QuestionEditForm.jsx
(Adapt from reference, include language toggle for bn/en fields)

#### d) LanguageToggle.jsx
```jsx
import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
      className="px-3 py-1.5 text-xs font-mono border border-bg-tertiary rounded-lg hover:border-accent-primary transition-colors text-text-secondary hover:text-text-primary"
    >
      {language === 'bn' ? '🇧🇩 বাংলা' : '🇬🇧 English'}
    </button>
  );
}
```

---

### 2. Pages (Priority: HIGH)

#### a) Landing.jsx (src/pages/Landing.jsx)
```jsx
import { useNavigate } from 'react-router-dom';
import { loginTeacher, loginStudent } from '../lib/session';

export default function Landing() {
  const navigate = useNavigate();

  const handleTeacherLogin = () => {
    loginTeacher();
    navigate('/teacher/questions');
  };

  const handleStudentLogin = () => {
    const name = prompt('Enter your name:');
    if (name) {
      loginStudent(name);
      navigate('/student/questions');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">LMS AI</h1>
          <p className="text-text-secondary">AI-Powered Learning Management System</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleTeacherLogin}
            className="w-full p-6 bg-bg-secondary border border-bg-tertiary rounded-xl hover:border-accent-primary transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-primary/10 rounded-lg flex items-center justify-center text-accent-primary text-2xl group-hover:scale-110 transition-transform">
                👨‍🏫
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-text-primary">Teacher Portal</h2>
                <p className="text-sm text-text-secondary">Generate questions, create exams, grade submissions</p>
              </div>
            </div>
          </button>

          <button
            onClick={handleStudentLogin}
            className="w-full p-6 bg-bg-secondary border border-bg-tertiary rounded-xl hover:border-accent-secondary transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-secondary/10 rounded-lg flex items-center justify-center text-accent-secondary text-2xl group-hover:scale-110 transition-transform">
                👨‍🎓
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-text-primary">Student Portal</h2>
                <p className="text-sm text-text-secondary">View questions, submit answers, track results</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### b) Teacher Layout (src/pages/teacher/TeacherLayout.jsx)
```jsx
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { logout } from '../../lib/session';
import LanguageToggle from '../../components/LanguageToggle';

export default function TeacherLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="bg-bg-secondary border-b border-bg-tertiary sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-accent-primary">LMS AI - Teacher</h1>
            <nav className="flex gap-6">
              <Link to="/teacher/questions" className="text-sm text-text-secondary hover:text-accent-primary transition-colors">Questions</Link>
              <Link to="/teacher/exams" className="text-sm text-text-secondary hover:text-accent-primary transition-colors">Exams</Link>
              <Link to="/teacher/grading" className="text-sm text-text-secondary hover:text-accent-primary transition-colors">Grading</Link>
              <Link to="/teacher/feedback" className="text-sm text-text-secondary hover:text-accent-primary transition-colors">Feedback</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <button onClick={handleLogout} className="text-xs text-text-secondary hover:text-text-primary">Logout</button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
```

#### c) Student Layout (src/pages/student/StudentLayout.jsx)
```jsx
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { logout } from '../../lib/session';
import LanguageToggle from '../../components/LanguageToggle';

export default function StudentLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="bg-bg-secondary border-b border-bg-tertiary sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-accent-secondary">LMS AI - Student</h1>
            <nav className="flex gap-6">
              <Link to="/student/questions" className="text-sm text-text-secondary hover:text-accent-secondary transition-colors">Questions</Link>
              <Link to="/student/submissions" className="text-sm text-text-secondary hover:text-accent-secondary transition-colors">Submissions</Link>
              <Link to="/student/results" className="text-sm text-text-secondary hover:text-accent-secondary transition-colors">Results</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <button onClick={handleLogout} className="text-xs text-text-secondary hover:text-text-primary">Logout</button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
```

#### d) Teacher Questions Page (src/pages/teacher/Questions.jsx)
This is the most complex page. Key features:
- GenerateForm component
- Question list with filters
- QuestionCard components
- Streaming question generation
- Edit/Publish functionality

See reference implementation for full details.

---

### 3. Main App.jsx Update

Replace the entire `src/App.jsx` with:

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import Landing from './pages/Landing';
import TeacherLayout from './pages/teacher/TeacherLayout';
import StudentLayout from './pages/student/StudentLayout';
import TeacherQuestions from './pages/teacher/Questions';
import StudentQuestions from './pages/student/Questions';
import { requireTeacherRole, requireStudentRole } from './lib/session';

function ProtectedTeacherRoute({ children }) {
  const session = requireTeacherRole();
  return session ? children : <Navigate to="/" replace />;
}

function ProtectedStudentRoute({ children }) {
  const session = requireStudentRole();
  return session ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route path="/teacher/*" element={
            <ProtectedTeacherRoute>
              <TeacherLayout />
            </ProtectedTeacherRoute>
          }>
            <Route path="questions" element={<TeacherQuestions />} />
            <Route path="exams" element={<div>Exams Page - Coming Soon</div>} />
            <Route path="grading" element={<div>Grading Page - Coming Soon</div>} />
            <Route path="feedback" element={<div>Feedback Page - Coming Soon</div>} />
          </Route>

          <Route path="/student/*" element={
            <ProtectedStudentRoute>
              <StudentLayout />
            </ProtectedStudentRoute>
          }>
            <Route path="questions" element={<StudentQuestions />} />
            <Route path="submissions" element={<div>Submissions Page - Coming Soon</div>} />
            <Route path="results" element={<div>Results Page - Coming Soon</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
```

---

### 4. Update main.jsx

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

---

## Testing Steps

1. Start backend: `cd /home/xeron/Haki/neo/LMS-AI && npm start`
2. Start frontend: `cd /home/xeron/Haki/neo/LMS-AI/frontend && npm run dev`
3. Test teacher login → should redirect to /teacher/questions
4. Test student login → should redirect to /student/questions
5. Test language toggle
6. Test question generation flow

---

## Remaining Work

After creating the files above, you still need to:

1. Complete all page components (Questions, Exams, Grading, Feedback for both teacher/student)
2. Implement streaming question generation with SSE
3. Add polling for evaluation status
4. Test all workflows end-to-end
5. Remove old App.jsx code
6. Add proper error handling
7. Add loading states
8. Test responsive design

---

## Design System Quick Reference

```css
/* Colors */
bg-primary: #0f1117
bg-secondary: #1a1f2e
bg-tertiary: #2d3748
accent-primary: #6ee7b7 (teacher green)
accent-hover: #a7f3d0
accent-secondary: #a78bfa (student purple)
text-primary: #ffffff
text-secondary: #94a3b8
text-tertiary: #4a5568

/* Status Colors */
success: #6ee7b7
warning: #fbbf24
error: #f87171
info: #60a5fa
```

```jsx
/* Common Button Styles */
<button className="px-6 py-2.5 bg-accent-primary text-bg-primary rounded-lg text-sm font-bold hover:bg-accent-hover transition-colors">
  Primary Button
</button>

<button className="px-4 py-1.5 border border-bg-tertiary text-text-secondary rounded text-xs hover:border-accent-primary/50 hover:text-text-primary transition-colors">
  Secondary Button
</button>

/* Common Input Styles */
<select className="w-full bg-bg-secondary border border-bg-tertiary rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary appearance-none">
  {/* Options */}
</select>

/* Card Style */
<div className="bg-bg-secondary border border-bg-tertiary rounded-xl p-6">
  {/* Content */}
</div>
```

---

## API Integration Quick Reference

```javascript
import { api } from '../lib/api';

// Get questions
const { data } = await api.getQuestions({ status: 'draft', type: 'mcq' });

// Stream questions
const response = await api.streamQuestions({ subject_id: 1, topic_id: 2 });
const reader = response.body.getReader();
// Parse SSE...

// Update question
await api.updateQuestion(questionId, { question_text: 'New text' });

// Publish questions
await api.publishQuestions([1, 2, 3]);

// Create exam
await api.createExam({ title: 'Exam 1', question_ids: [1, 2, 3] });

// Submit exam
await api.submitExam({ exam_id: 1, student_name: 'John', answers: [...] });
```

---

This guide provides all the essential code and structure. Copy and adapt the reference components, and you'll have a working modern frontend!
