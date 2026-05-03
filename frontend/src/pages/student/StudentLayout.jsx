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
            <nav className="hidden md:flex gap-6">
              <Link to="/student/questions" className="text-sm text-text-secondary hover:text-accent-secondary transition-colors">Questions</Link>
              <Link to="/student/exams" className="text-sm text-text-secondary hover:text-accent-secondary transition-colors">Exams</Link>
              <Link to="/student/submissions" className="text-sm text-text-secondary hover:text-accent-secondary transition-colors">Submissions</Link>
              <Link to="/student/results" className="text-sm text-text-secondary hover:text-accent-secondary transition-colors">Results</Link>
              <Link to="/student/performance" className="text-sm text-text-secondary hover:text-accent-secondary transition-colors">Performance</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <button onClick={handleLogout} className="text-xs text-text-secondary hover:text-text-primary transition-colors">Logout</button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
