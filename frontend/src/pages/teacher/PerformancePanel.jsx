import { useState } from 'react';
import { api } from '../../lib/api';

const PerformancePanel = () => {
  const [studentName, setStudentName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [polling, setPolling] = useState(false);
  const [currentReportId, setCurrentReportId] = useState(null);

  // Get unique students from submissions
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  // Fetch students list on mount
  useState(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.getSubmissions();
        // Extract unique student names
        const uniqueStudents = [...new Set(response.data.data.map(s => s.student_name))];
        setStudents(uniqueStudents);
      } catch (err) {
        console.error('Error fetching students:', err);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, []);

  // Handle form submission
  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!studentName || !startDate || !endDate) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setReport(null);

    try {
      const response = await api.analyzePerformance({
        student_name: studentName,
        start_date: startDate,
        end_date: endDate,
      });

      if (response.data.success) {
        const reportId = response.data.data.report_id;
        setCurrentReportId(reportId);

        // Start polling for report completion
        pollForReport(reportId);
      }
    } catch (err) {
      console.error('Error analyzing performance:', err);
      setError(err.response?.data?.message || 'Failed to analyze performance');
      setLoading(false);
    }
  };

  // Poll for report completion
  const pollForReport = async (reportId) => {
    setPolling(true);

    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await api.getAnalysisStatus(reportId);

        if (statusResponse.data.success) {
          const status = statusResponse.data.data.report_status;

          if (status === 'completed') {
            clearInterval(pollInterval);
            setPolling(false);
            setLoading(false);

            // Fetch full report
            const reportResponse = await api.getPerformanceReport(reportId);
            setReport(reportResponse.data.data);
          } else if (status === 'failed') {
            clearInterval(pollInterval);
            setPolling(false);
            setLoading(false);
            setError('Performance analysis failed. Please try again.');
          }
          // If still pending, continue polling
        }
      } catch (err) {
        clearInterval(pollInterval);
        setPolling(false);
        setLoading(false);
        setError('Error checking analysis status');
        console.error('Error polling for report:', err);
      }
    }, 3000); // Poll every 3 seconds

    // Timeout after 2 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (polling) {
        setPolling(false);
        setLoading(false);
        setError('Analysis is taking longer than expected. Please check back later.');
      }
    }, 120000);
  };

  // Set default date range (last 30 days)
  useState(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Student Performance Analysis</h1>

      {/* Analysis Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Student Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Student
              </label>
              <select
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loadingStudents || loading}
              >
                <option value="">Choose a student...</option>
                {students.map((student) => (
                  <option key={student} value={student}>
                    {student}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || polling || !studentName}
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Analyzing...' : polling ? 'Processing...' : 'Generate Report'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Loading State */}
      {(loading || polling) && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">
              {polling
                ? 'AI is analyzing the performance data... This may take a moment.'
                : 'Preparing analysis...'}
            </p>
          </div>
        </div>
      )}

      {/* Report Display */}
      {report && (
        <div className="space-y-6">
          {/* Overall Rating */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Performance Report</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Overall Rating</p>
                <p className="text-2xl font-bold text-blue-600">
                  {report.overall_performance_rating || 'N/A'}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">MCQ Score</p>
                <p className="text-2xl font-bold text-green-600">
                  {report.total_mcq_score || 0}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">AI Score</p>
                <p className="text-2xl font-bold text-purple-600">
                  {report.total_ai_score || 0}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Answers Evaluated</p>
                <p className="text-2xl font-bold text-orange-600">
                  {report.total_answers_evaluated || 0}
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <p>Report Period: {report.start_date} to {report.end_date}</p>
              <p>Generated: {new Date(report.analysis_completed_at).toLocaleString()}</p>
            </div>
          </div>

          {/* AI Feedback */}
          {report.ai_feedback && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-3 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Feedback
              </h3>
              <div className="prose max-w-none">
                {typeof report.ai_feedback === 'string' ? (
                  <p className="text-gray-700 whitespace-pre-line">{report.ai_feedback}</p>
                ) : (
                  <div className="text-gray-700">
                    {report.ai_feedback.en && <p className="mb-2">{report.ai_feedback.en}</p>}
                    {report.ai_feedback.bn && <p className="text-gray-600 italic">{report.ai_feedback.bn}</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Strength Analysis */}
          {report.strength_analysis && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-3 flex items-center text-green-600">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Strengths
              </h3>
              <div className="prose max-w-none">
                {typeof report.strength_analysis === 'string' ? (
                  <p className="text-gray-700 whitespace-pre-line">{report.strength_analysis}</p>
                ) : (
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {Array.isArray(report.strength_analysis) ? (
                      report.strength_analysis.map((strength, idx) => (
                        <li key={idx}>{strength}</li>
                      ))
                    ) : (
                      <li>{JSON.stringify(report.strength_analysis)}</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Weakness Analysis */}
          {report.weakness_analysis && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-3 flex items-center text-red-600">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Areas for Improvement
              </h3>
              <div className="prose max-w-none">
                {typeof report.weakness_analysis === 'string' ? (
                  <p className="text-gray-700 whitespace-pre-line">{report.weakness_analysis}</p>
                ) : (
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {Array.isArray(report.weakness_analysis) ? (
                      report.weakness_analysis.map((weakness, idx) => (
                        <li key={idx}>{weakness}</li>
                      ))
                    ) : (
                      <li>{JSON.stringify(report.weakness_analysis)}</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Study Plan */}
          {report.study_plan && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-3 flex items-center text-purple-600">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Recommended Study Plan
              </h3>
              <div className="prose max-w-none">
                {typeof report.study_plan === 'string' ? (
                  <p className="text-gray-700 whitespace-pre-line">{report.study_plan}</p>
                ) : (
                  <div className="text-gray-700">
                    {report.study_plan.en && <p className="mb-2">{report.study_plan.en}</p>}
                    {report.study_plan.bn && <p className="text-gray-600 italic">{report.study_plan.bn}</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recommended Topics */}
          {report.recommended_topics && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-3 flex items-center text-orange-600">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Recommended Topics to Focus On
              </h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(report.recommended_topics) ? (
                  report.recommended_topics.map((topic, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                    >
                      {topic}
                    </span>
                  ))
                ) : typeof report.recommended_topics === 'string' ? (
                  <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                    {report.recommended_topics}
                  </span>
                ) : (
                  <span className="text-gray-700">{JSON.stringify(report.recommended_topics)}</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PerformancePanel;
