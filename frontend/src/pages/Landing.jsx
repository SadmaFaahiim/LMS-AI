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
