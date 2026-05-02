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
            <nav className="hidden md:flex gap-6">
              <Link to="/teacher/questions" className="text-sm text-text-secondary hover:text-accent-primary transition-colors">Questions</Link>
              <Link to="/teacher/exams" className="text-sm text-text-secondary hover:text-accent-primary transition-colors">Exams</Link>
              <Link to="/teacher/grading" className="text-sm text-text-secondary hover:text-accent-primary transition-colors">Grading</Link>
              <Link to="/teacher/feedback" className="text-sm text-text-secondary hover:text-accent-primary transition-colors">Feedback</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <button onClick={handleLogout} className="text-xs text-text-secondary hover:text-text-primary transition-colors">Logout</button>
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
