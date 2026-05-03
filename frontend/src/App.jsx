import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import Landing from './pages/Landing';
import TeacherLayout from './pages/teacher/TeacherLayout';
import StudentLayout from './pages/student/StudentLayout';
import TeacherQuestions from './pages/teacher/Questions';
import TeacherExams from './pages/teacher/Exams';
import TeacherGrading from './pages/teacher/Grading';
import TeacherPerformancePanel from './pages/teacher/PerformancePanel';
import StudentQuestions from './pages/student/Questions';
import StudentExams from './pages/student/Exams';
import StudentSubmissions from './pages/student/Submissions';
import StudentResults from './pages/student/Results';
import StudentPerformanceDashboard from './pages/student/PerformanceDashboard';
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
            <Route path="exams" element={<TeacherExams />} />
            <Route path="grading" element={<TeacherGrading />} />
            <Route path="performance" element={<TeacherPerformancePanel />} />
            <Route path="feedback" element={<div className="text-text-primary">Feedback Page - Coming Soon</div>} />
          </Route>

          <Route path="/student/*" element={
            <ProtectedStudentRoute>
              <StudentLayout />
            </ProtectedStudentRoute>
          }>
            <Route path="questions" element={<StudentQuestions />} />
            <Route path="exams" element={<StudentExams />} />
            <Route path="submissions" element={<StudentSubmissions />} />
            <Route path="results" element={<StudentResults />} />
            <Route path="performance" element={<StudentPerformanceDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
