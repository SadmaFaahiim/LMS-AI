import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

const PerformanceDashboard = ({ studentName }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [showNewReportForm, setShowNewReportForm] = useState(false);

  // New report form state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [polling, setPolling] = useState(false);

  // Fetch reports on mount
  useEffect(() => {
    fetchReports();
  }, [studentName]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.listPerformanceReports({ student_name: studentName });
      if (response.data.success) {
        setReports(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load performance reports');
    } finally {
      setLoading(false);
    }
  };

  // Handle new report generation
  const handleGenerateReport = async (e) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      setError('Please select start and end dates');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const response = await api.analyzePerformance({
        student_name: studentName,
        start_date: startDate,
        end_date: endDate,
      });

      if (response.data.success) {
        const reportId = response.data.data.report_id;
        setShowNewReportForm(false);
        pollForNewReport(reportId);
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err.response?.data?.message || 'Failed to generate report');
      setGenerating(false);
    }
  };

  // Poll for new report completion
  const pollForNewReport = (reportId) => {
    setPolling(true);

    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await api.getAnalysisStatus(reportId);
        const status = statusResponse.data.data.report_status;

        if (status === 'completed') {
          clearInterval(pollInterval);
          setPolling(false);
          setGenerating(false);
          fetchReports(); // Refresh the list
        } else if (status === 'failed') {
          clearInterval(pollInterval);
          setPolling(false);
          setGenerating(false);
          setError('Report generation failed. Please try again.');
        }
      } catch (err) {
        clearInterval(pollInterval);
        setPolling(false);
        setGenerating(false);
        setError('Error checking report status');
      }
    }, 3000);

    setTimeout(() => {
      clearInterval(pollInterval);
      if (polling) {
        setPolling(false);
        setGenerating(false);
        setError('Report generation is taking longer than expected');
      }
    }, 120000);
  };

  // Set default date range (last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Performance Reports</h1>
        <button
          onClick={() => setShowNewReportForm(!showNewReportForm)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={generating || polling}
        >
          {generating || polling ? 'Generating...' : 'Generate New Report'}
        </button>
      </div>

      {/* New Report Form */}
      {showNewReportForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Generate Performance Report</h2>
          <form onSubmit={handleGenerateReport} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={generating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={generating}
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={generating || polling}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {generating ? 'Generating...' : 'Generate Report'}
              </button>
              <button
                type="button"
                onClick={() => setShowNewReportForm(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Loading reports...</p>
          </div>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">No performance reports found. Generate your first report!</p>
        </div>
      ) : (
        <>
          {/* Reports List */}
          {!selectedReport && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Report History</h2>
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {report.overall_performance_rating || 'Processing...'}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              report.report_status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : report.report_status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {report.report_status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {report.start_date} to {report.end_date}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {report.total_answers_evaluated} answers evaluated • Score: {report.total_mcq_score + report.total_ai_score}
                        </p>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Report Detail */}
          {selectedReport && (
            <div className="space-y-6">
              {/* Back Button */}
              <button
                onClick={() => setSelectedReport(null)}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Reports
              </button>

              {/* Report Content */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Performance Report</h2>
                    <p className="text-gray-600">
                      {selectedReport.start_date} to {selectedReport.end_date}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
                        selectedReport.report_status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {selectedReport.report_status}
                    </span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Rating</p>
                    <p className="text-xl font-bold text-blue-600">
                      {selectedReport.overall_performance_rating || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">MCQ Score</p>
                    <p className="text-xl font-bold text-green-600">
                      {selectedReport.total_mcq_score || 0}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">AI Score</p>
                    <p className="text-xl font-bold text-purple-600">
                      {selectedReport.total_ai_score || 0}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Score</p>
                    <p className="text-xl font-bold text-orange-600">
                      {(selectedReport.total_mcq_score || 0) + (selectedReport.total_ai_score || 0)}
                    </p>
                  </div>
                </div>

                {/* AI Feedback */}
                {selectedReport.ai_feedback && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      AI Feedback
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {typeof selectedReport.ai_feedback === 'string' ? (
                        <p className="text-gray-700 whitespace-pre-line">{selectedReport.ai_feedback}</p>
                      ) : (
                        <div className="text-gray-700">
                          {selectedReport.ai_feedback.en && <p className="mb-2">{selectedReport.ai_feedback.en}</p>}
                          {selectedReport.ai_feedback.bn && <p className="text-gray-600 italic">{selectedReport.ai_feedback.bn}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Strengths */}
                {selectedReport.strength_analysis && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-3 flex items-center text-green-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      My Strengths
                    </h3>
                    <div className="bg-green-50 p-4 rounded-lg">
                      {typeof selectedReport.strength_analysis === 'string' ? (
                        <p className="text-gray-700 whitespace-pre-line">{selectedReport.strength_analysis}</p>
                      ) : Array.isArray(selectedReport.strength_analysis) ? (
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          {selectedReport.strength_analysis.map((strength, idx) => (
                            <li key={idx}>{strength}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-700">{JSON.stringify(selectedReport.strength_analysis)}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Weaknesses */}
                {selectedReport.weakness_analysis && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-3 flex items-center text-red-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Areas to Improve
                    </h3>
                    <div className="bg-red-50 p-4 rounded-lg">
                      {typeof selectedReport.weakness_analysis === 'string' ? (
                        <p className="text-gray-700 whitespace-pre-line">{selectedReport.weakness_analysis}</p>
                      ) : Array.isArray(selectedReport.weakness_analysis) ? (
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          {selectedReport.weakness_analysis.map((weakness, idx) => (
                            <li key={idx}>{weakness}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-700">{JSON.stringify(selectedReport.weakness_analysis)}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Study Plan */}
                {selectedReport.study_plan && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-3 flex items-center text-purple-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      Study Plan
                    </h3>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      {typeof selectedReport.study_plan === 'string' ? (
                        <p className="text-gray-700 whitespace-pre-line">{selectedReport.study_plan}</p>
                      ) : (
                        <div className="text-gray-700">
                          {selectedReport.study_plan.en && <p className="mb-2">{selectedReport.study_plan.en}</p>}
                          {selectedReport.study_plan.bn && <p className="text-gray-600 italic">{selectedReport.study_plan.bn}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Recommended Topics */}
                {selectedReport.recommended_topics && (
                  <div>
                    <h3 className="text-lg font-bold mb-3 flex items-center text-orange-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Topics to Focus On
                    </h3>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(selectedReport.recommended_topics) ? (
                          selectedReport.recommended_topics.map((topic, idx) => (
                            <span
                              key={idx}
                              className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                            >
                              {topic}
                            </span>
                          ))
                        ) : typeof selectedReport.recommended_topics === 'string' ? (
                          <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                            {selectedReport.recommended_topics}
                          </span>
                        ) : (
                          <span className="text-gray-700">{JSON.stringify(selectedReport.recommended_topics)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PerformanceDashboard;
