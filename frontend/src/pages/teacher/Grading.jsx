import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import SubmissionDetailSheet from "../../components/SubmissionDetailSheet";

export default function TeacherGrading() {
  const [submissions, setSubmissions] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExam) {
      fetchSubmissions(selectedExam);
    }
  }, [selectedExam]);

  // Poll for status updates every 30 seconds
  useEffect(() => {
    if (!selectedExam) return;

    const interval = setInterval(() => {
      fetchSubmissions(selectedExam, true); // true = silent refresh
    }, 30000); // 30 seconds

    // Cleanup function - destroys interval on unmount or when selectedExam changes
    return () => clearInterval(interval);
  }, [selectedExam]);

  const fetchExams = async () => {
    try {
      const { data } = await api.getExams();
      setExams(data.data || []);
      if (data.data && data.data.length > 0) {
        setSelectedExam(data.data[0].id.toString());
      }
    } catch (error) {
      console.error("Failed to fetch exams:", error);
    }
  };

  const fetchSubmissions = async (examId, silent = false) => {
    try {
      if (!silent) setLoading(true);
      const { data } = await api.getExamSubmissions(examId);
      setSubmissions(data.data || []);
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-warning/20 text-warning";
      case "processing":
        return "bg-info/20 text-info";
      case "completed":
        return "bg-success/20 text-success";
      default:
        return "bg-bg-tertiary/50 text-text-secondary";
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (statusFilter === "all") return true;
    return sub.status === statusFilter;
  });

  const stats = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === "pending").length,
    processing: submissions.filter((s) => s.status === "processing").length,
    completed: submissions.filter((s) => s.status === "completed").length,
  };

  return (
    <div className='max-w-7xl mx-auto space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between flex-wrap gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-text-primary'>Grading</h1>
          <p className='text-sm text-text-secondary mt-1'>
            View and grade student submissions
          </p>
        </div>

        {/* Exam Selector */}
        {exams.length > 0 && (
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className='bg-bg-secondary border border-bg-tertiary rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary appearance-none cursor-pointer'>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Stats Bar */}
      {selectedExam && (
        <div className='grid grid-cols-4 gap-4'>
          <div className='bg-bg-secondary border border-bg-tertiary rounded-lg p-4'>
            <p className='text-2xl font-bold text-text-primary'>
              {stats.total}
            </p>
            <p className='text-xs text-text-secondary font-mono uppercase'>
              Total
            </p>
          </div>
          <div className='bg-bg-secondary border border-bg-tertiary rounded-lg p-4'>
            <p className='text-2xl font-bold text-warning'>{stats.pending}</p>
            <p className='text-xs text-text-secondary font-mono uppercase'>
              Pending
            </p>
          </div>
          <div className='bg-bg-secondary border border-bg-tertiary rounded-lg p-4'>
            <p className='text-2xl font-bold text-info'>{stats.processing}</p>
            <p className='text-xs text-text-secondary font-mono uppercase'>
              Processing
            </p>
          </div>
          <div className='bg-bg-secondary border border-bg-tertiary rounded-lg p-4'>
            <p className='text-2xl font-bold text-success'>{stats.completed}</p>
            <p className='text-xs text-text-secondary font-mono uppercase'>
              Completed
            </p>
          </div>
        </div>
      )}

      {!selectedExam && (
        <div className='bg-bg-secondary border border-bg-tertiary rounded-xl p-12 text-center'>
          <p className='text-text-secondary'>
            Select an exam to view submissions
          </p>
        </div>
      )}

      {/* Submissions Table */}
      {selectedExam && (
        <div className='bg-bg-secondary border border-bg-tertiary rounded-xl overflow-hidden'>
          {/* Filters */}
          <div className='p-4 border-b border-bg-tertiary flex items-center justify-between'>
            <h2 className='text-sm font-mono uppercase tracking-widest text-accent-primary'>
              Submissions ({filteredSubmissions.length})
            </h2>
            <div className='flex gap-2'>
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                  statusFilter === "all"
                    ? "bg-text-tertiary text-text-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}>
                All
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                  statusFilter === "pending"
                    ? "bg-warning text-bg-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}>
                Pending
              </button>
              <button
                onClick={() => setStatusFilter("processing")}
                className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                  statusFilter === "processing"
                    ? "bg-info text-bg-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}>
                Processing
              </button>
              <button
                onClick={() => setStatusFilter("completed")}
                className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                  statusFilter === "completed"
                    ? "bg-success text-bg-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}>
                Completed
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full'></div>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className='text-center py-12 text-text-secondary'>
              <p className='text-sm'>
                {statusFilter === "all"
                  ? "No submissions yet."
                  : `No ${statusFilter} submissions found.`}
              </p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-bg-primary'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-mono text-text-secondary uppercase'>
                      Student
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-mono text-text-secondary uppercase'>
                      Submitted
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-mono text-text-secondary uppercase'>
                      MCQ Score
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-mono text-text-secondary uppercase'>
                      Total
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-mono text-text-secondary uppercase'>
                      Status
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-mono text-text-secondary uppercase'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-bg-tertiary'>
                  {filteredSubmissions.map((submission) => (
                    <tr
                      key={submission.id}
                      className='hover:bg-bg-primary/50 transition-colors cursor-pointer'
                      onClick={() => setSelectedSubmission(submission.id)}>
                      <td className='px-6 py-4 text-sm text-text-primary font-medium'>
                        {submission.student_name}
                      </td>
                      <td className='px-6 py-4 text-sm text-text-secondary'>
                        {new Date(submission.submitted_at).toLocaleString()}
                      </td>
                      <td className='px-6 py-4 text-sm text-success'>
                        {submission.mcq_score || 0}
                      </td>
                      <td className='px-6 py-4 text-sm font-bold text-text-primary'>
                        {submission.score || 0}
                      </td>
                      <td className='px-6 py-4'>
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-right'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSubmission(submission.id);
                          }}
                          className='text-xs text-accent-primary hover:text-accent-hover font-medium'>
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Submission Detail Sheet */}
      <SubmissionDetailSheet
        isOpen={!!selectedSubmission}
        submissionId={selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
      />
    </div>
  );
}
