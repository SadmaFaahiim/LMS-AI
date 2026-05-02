import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { getSession } from '../../lib/session';

export default function StudentSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const session = getSession();

  useEffect(() => {
    fetchSubmissions();
    // Poll for status updates every 5 seconds
    const interval = setInterval(() => {
      fetchSubmissions(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchSubmissions = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      // TODO: Need to implement this endpoint
      // const { data } = await api.getSubmissions({ student_name: session.studentName });
      // setSubmissions(data.data || []);
      // For now, set empty array
      setSubmissions([]);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/20 text-warning';
      case 'processing':
        return 'bg-info/20 text-info';
      case 'completed':
        return 'bg-success/20 text-success';
      default:
        return 'bg-bg-tertiary/50 text-text-secondary';
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (statusFilter === 'all') return true;
    return sub.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Submissions</h1>
          <p className="text-sm text-text-secondary mt-1">Track your answer submissions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.href = '/student/questions'}
            className="px-4 py-2 bg-accent-secondary text-bg-primary rounded-lg text-sm font-bold hover:bg-accent-secondary/80 transition-colors"
          >
            Answer More Questions
          </button>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-bg-secondary border border-bg-tertiary rounded-xl overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-bg-tertiary flex items-center justify-between">
          <h2 className="text-sm font-mono uppercase tracking-widest text-accent-secondary">
            Submissions ({filteredSubmissions.length})
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                statusFilter === 'all' ? 'bg-text-tertiary text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                statusFilter === 'pending' ? 'bg-warning text-bg-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('processing')}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                statusFilter === 'processing' ? 'bg-info text-bg-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Processing
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                statusFilter === 'completed' ? 'bg-success text-bg-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-accent-secondary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <p className="text-sm mb-2">
              {submissions.length === 0
                ? "You haven't submitted any answers yet."
                : `No ${statusFilter} submissions found.`}
            </p>
            {submissions.length === 0 && (
              <button
                onClick={() => window.location.href = '/student/questions'}
                className="mt-4 px-4 py-2 bg-accent-secondary text-bg-primary rounded-lg text-sm font-bold hover:bg-accent-secondary/80 transition-colors"
              >
                Browse Questions
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-bg-tertiary">
            {filteredSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="p-5 hover:bg-bg-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-semibold text-text-primary">
                        {submission.exam_title || submission.question_text}
                      </h3>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${getStatusColor(submission.status)}`}>
                        {submission.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-text-secondary">
                      <span>Submitted {new Date(submission.submitted_at).toLocaleString()}</span>
                      {submission.type && (
                        <>
                          <span>·</span>
                          <span className="font-mono">{submission.type}</span>
                        </>
                      )}
                      {submission.marks && (
                        <>
                          <span>·</span>
                          <span>{submission.marks} marks</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Score (if completed) */}
                  {submission.status === 'completed' && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-text-primary">
                        {submission.score || 0}
                      </p>
                      <p className="text-xs text-text-secondary">Score</p>
                    </div>
                  )}

                  {/* View Details Button */}
                  <button
                    onClick={() => window.location.href = `/student/results?submission=${submission.id}`}
                    className="px-4 py-2 border border-bg-tertiary text-text-secondary rounded text-sm hover:border-accent-secondary hover:text-text-primary transition-colors"
                  >
                    View Details
                  </button>
                </div>

                {/* Progress indicator for processing */}
                {submission.status === 'processing' && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                      <span>AI is evaluating your answer...</span>
                      <span>This may take a few moments</span>
                    </div>
                    <div className="w-full bg-bg-tertiary rounded-full h-1.5">
                      <div className="bg-info h-1.5 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
