import { useState, useEffect } from "react";
import { api } from "../../lib/api";

const PerformanceDashboard = ({ studentName }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [showNewReportForm, setShowNewReportForm] = useState(false);

  // New report form state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [polling, setPolling] = useState(false);

  // Fetch reports on mount
  useEffect(() => {
    fetchReports();
  }, [studentName]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.listPerformanceReports({
        student_name: studentName,
      });
      if (response.data.success) {
        setReports(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to load performance reports");
    } finally {
      setLoading(false);
    }
  };

  // Handle new report generation
  const handleGenerateReport = async (e) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      setError("Please select start and end dates");
      return;
    }

    setGenerating(true);
    setError("");

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
      console.error("Error generating report:", err);
      setError(err.response?.data?.message || "Failed to generate report");
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

        if (status === "completed") {
          clearInterval(pollInterval);
          setPolling(false);
          setGenerating(false);
          fetchReports(); // Refresh the list
        } else if (status === "failed") {
          clearInterval(pollInterval);
          setPolling(false);
          setGenerating(false);
          setError("Report generation failed. Please try again.");
        }
      } catch (err) {
        clearInterval(pollInterval);
        setPolling(false);
        setGenerating(false);
        setError("Error checking report status");
      }
    }, 3000);

    setTimeout(() => {
      clearInterval(pollInterval);
      if (polling) {
        setPolling(false);
        setGenerating(false);
        setError("Report generation is taking longer than expected");
      }
    }, 120000);
  };

  // Set default date range (last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    setEndDate(today.toISOString().split("T")[0]);
    setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
  }, []);

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>My Performance Reports</h1>
        <button
          onClick={() => setShowNewReportForm(!showNewReportForm)}
          className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          disabled={generating || polling}>
          {generating || polling ? "Generating..." : "Generate New Report"}
        </button>
      </div>

      {/* New Report Form */}
      {showNewReportForm && (
        <div className='bg-bg-secondary rounded-lg shadow-md p-6 mb-6'>
          <h2 className='text-xl font-bold mb-4'>
            Generate Performance Report
          </h2>
          <form onSubmit={handleGenerateReport} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Start Date
                </label>
                <input
                  type='date'
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                  disabled={generating}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  End Date
                </label>
                <input
                  type='date'
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                  disabled={generating}
                />
              </div>
            </div>
            <div className='flex space-x-3'>
              <button
                type='submit'
                disabled={generating || polling}
                className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400'>
                {generating ? "Generating..." : "Generate Report"}
              </button>
              <button
                type='button'
                onClick={() => setShowNewReportForm(false)}
                className='px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400'>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700'>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className='bg-white rounded-lg shadow-md p-6'>
          <div className='flex items-center justify-center space-x-3'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            <p className='text-gray-600'>Loading reports...</p>
          </div>
        </div>
      ) : reports.length === 0 ? (
        <div className='bg-bg-secondary rounded-lg shadow-md p-6 text-center'>
          <p className='text-gray-500'>
            No performance reports found. Generate your first report!
          </p>
        </div>
      ) : (
        <>
          {/* Reports List */}
          {!selectedReport && (
            <div className='bg-bg-secondary rounded-lg shadow-md p-6'>
              <h2 className='text-xl font-bold mb-4'>Report History</h2>
              <div className='space-y-3'>
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer'
                    onClick={() => setSelectedReport(report)}>
                    <div className='flex justify-between items-start'>
                      <div className='flex-1'>
                        <div className='flex items-center space-x-3 mb-2'>
                          <h3 className='font-semibold text-lg'>
                            {report.overall_performance_rating ||
                              "Processing..."}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              report.report_status === "completed"
                                ? "bg-green-100 text-green-800"
                                : report.report_status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}>
                            {report.report_status}
                          </span>
                        </div>
                        <p className='text-sm text-gray-600'>
                          {report.start_date} to {report.end_date}
                        </p>
                        <p className='text-sm text-gray-500 mt-1'>
                          {report.total_answers_evaluated} answers evaluated •
                          Score:{" "}
                          {report.total_mcq_score + report.total_ai_score}
                        </p>
                      </div>
                      <svg
                        className='w-5 h-5 text-gray-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 5l7 7-7 7'
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Report Detail */}
          {selectedReport && (
            <div className='space-y-6'>
              {/* Back Button */}
              <button
                onClick={() => setSelectedReport(null)}
                className='flex items-center text-blue-600 hover:text-blue-800 transition-colors'>
                <svg
                  className='w-5 h-5 mr-2'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 19l-7-7 7-7'
                  />
                </svg>
                Back to Reports
              </button>

              {/* Report Content */}
              <div className='bg-bg-secondary rounded-lg shadow-md p-6'>
                <div className='flex justify-between items-start mb-6'>
                  <div>
                    <h2 className='text-2xl font-bold mb-2'>
                      Performance Report
                    </h2>
                    <p className='text-gray-600'>
                      {selectedReport.start_date} to {selectedReport.end_date}
                    </p>
                  </div>
                  <div className='text-right'>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
                        selectedReport.report_status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                      {selectedReport.report_status}
                    </span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
                  <div className='bg-blue-50 p-4 rounded-lg'>
                    <p className='text-sm text-gray-600'>Rating</p>
                    <p className='text-xl font-bold text-blue-600'>
                      {selectedReport.overall_performance_rating || "N/A"}
                    </p>
                  </div>
                  <div className='bg-green-50 p-4 rounded-lg'>
                    <p className='text-sm text-gray-600'>MCQ Score</p>
                    <p className='text-xl font-bold text-green-600'>
                      {selectedReport.total_mcq_score || 0}
                    </p>
                  </div>
                  <div className='bg-purple-50 p-4 rounded-lg'>
                    <p className='text-sm text-gray-600'>AI Score</p>
                    <p className='text-xl font-bold text-purple-600'>
                      {selectedReport.total_ai_score || 0}
                    </p>
                  </div>
                  <div className='bg-orange-50 p-4 rounded-lg'>
                    <p className='text-sm text-gray-600'>Total Score</p>
                    <p className='text-xl font-bold text-orange-600'>
                      {(selectedReport.total_mcq_score || 0) +
                        (selectedReport.total_ai_score || 0)}
                    </p>
                  </div>
                </div>

                {/* AI Feedback */}
                {selectedReport.ai_feedback && (
                  <div className='mb-6'>
                    <h3 className='text-lg font-bold mb-3 flex items-center'>
                      <svg
                        className='w-5 h-5 mr-2 text-blue-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
                        />
                      </svg>
                      AI Feedback
                    </h3>
                    <div className='bg-gray-50 p-4 rounded-lg'>
                      {selectedReport.ai_feedback &&
                        selectedReport.ai_feedback?.summary && (
                          <p className='text-gray-700 whitespace-pre-line'>
                            {selectedReport.ai_feedback?.summary}
                          </p>
                        )}
                      {typeof selectedReport.ai_feedback === "string" ? (
                        <p className='text-gray-700 whitespace-pre-line'>
                          {selectedReport.ai_feedback}
                        </p>
                      ) : (
                        <div className='text-gray-700'>
                          {selectedReport.ai_feedback.en && (
                            <p className='mb-2'>
                              {selectedReport.ai_feedback.en}
                            </p>
                          )}
                          {selectedReport.ai_feedback.bn && (
                            <p className='text-gray-600 italic'>
                              {selectedReport.ai_feedback.bn}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Strengths */}
                {selectedReport.strength_analysis && (
                  <div className='mb-6'>
                    <h3 className='text-lg font-bold mb-3 flex items-center text-green-600'>
                      <svg
                        className='w-5 h-5 mr-2'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                      My Strengths
                    </h3>
                    <div className='bg-green-50 p-4 rounded-lg'>
                      {typeof selectedReport.strength_analysis === "string" ? (
                        <p className='text-gray-700 whitespace-pre-line'>
                          {selectedReport.strength_analysis}
                        </p>
                      ) : typeof selectedReport.strength_analysis ===
                          "object" &&
                        selectedReport.strength_analysis !== null ? (
                        <>
                          {selectedReport.strength_analysis.positive_points &&
                            selectedReport.strength_analysis.positive_points
                              .length > 0 && (
                              <ul className='list-disc list-inside text-gray-700 space-y-2'>
                                {selectedReport.strength_analysis.positive_points.map(
                                  (point, idx) => (
                                    <li key={idx}>{point}</li>
                                  ),
                                )}
                              </ul>
                            )}
                          {selectedReport.strength_analysis.subjects &&
                            selectedReport.strength_analysis.subjects.length >
                              0 && (
                              <div className='mt-4'>
                                <p className='font-semibold text-green-800 mb-2'>
                                  Strong Subjects:
                                </p>
                                <div className='space-y-2'>
                                  {selectedReport.strength_analysis.subjects.map(
                                    (subject, idx) => (
                                      <div
                                        key={idx}
                                        className='bg-white p-3 rounded border border-green-200'>
                                        <p className='font-medium text-green-700'>
                                          {subject.subject || subject.topic || 'Unknown Subject'}
                                        </p>
                                        {subject.reason && (
                                          <p className='text-sm text-gray-600 mt-1'>
                                            {subject.reason}
                                          </p>
                                        )}
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                        </>
                      ) : (
                        <p className='text-gray-700'>
                          {JSON.stringify(selectedReport.strength_analysis)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Weaknesses */}
                {selectedReport.weakness_analysis && (
                  <div className='mb-6'>
                    <h3 className='text-lg font-bold mb-3 flex items-center text-red-600'>
                      <svg
                        className='w-5 h-5 mr-2'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                        />
                      </svg>
                      Areas to Improve
                    </h3>
                    <div className='bg-red-50 p-4 rounded-lg'>
                      {typeof selectedReport.weakness_analysis === "string" ? (
                        <p className='text-gray-700 whitespace-pre-line'>
                          {selectedReport.weakness_analysis}
                        </p>
                      ) : typeof selectedReport.weakness_analysis ===
                          "object" &&
                        selectedReport.weakness_analysis !== null ? (
                        <>
                          {selectedReport.weakness_analysis.suggested_focus &&
                            selectedReport.weakness_analysis.suggested_focus
                              .length > 0 && (
                              <div className='mb-4'>
                                <p className='font-semibold text-red-800 mb-2'>
                                  Suggested Focus Areas:
                                </p>
                                <ul className='list-disc list-inside text-gray-700 space-y-2'>
                                  {selectedReport.weakness_analysis.suggested_focus.map(
                                    (focus, idx) => (
                                      <li key={idx}>{focus}</li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            )}
                          {selectedReport.weakness_analysis.subjects &&
                            selectedReport.weakness_analysis.subjects.length >
                              0 && (
                              <div className='mb-4'>
                                <p className='font-semibold text-red-800 mb-2'>
                                  Subjects Needing Improvement:
                                </p>
                                <div className='space-y-2'>
                                  {selectedReport.weakness_analysis.subjects.map(
                                    (subject, idx) => (
                                      <div
                                        key={idx}
                                        className='bg-white p-3 rounded border border-red-200'>
                                        <p className='font-medium text-red-700'>
                                          {subject.subject || subject.topic || 'Unknown Subject'}
                                        </p>
                                        <p className='text-sm text-gray-600 mt-1'>
                                          {subject.reason}
                                        </p>
                                        {subject.improvement_score && (
                                          <p className='text-xs text-gray-500 mt-1'>
                                            Improvement Score:{" "}
                                            {subject.improvement_score}
                                          </p>
                                        )}
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                          {selectedReport.weakness_analysis.question_types &&
                            selectedReport.weakness_analysis.question_types
                              .length > 0 && (
                              <div>
                                <p className='font-semibold text-red-800 mb-2'>
                                  Question Types to Improve:
                                </p>
                                <div className='space-y-2'>
                                  {selectedReport.weakness_analysis.question_types.map(
                                    (qt, idx) => (
                                      <div
                                        key={idx}
                                        className='bg-white p-3 rounded border border-red-200'>
                                        <div className='flex justify-between items-start'>
                                          <p className='font-medium text-red-700'>
                                            {qt.question_type}
                                          </p>
                                          {qt.avg_score !== undefined && (
                                            <span className='text-xs bg-red-100 text-red-800 px-2 py-1 rounded'>
                                              Avg Score: {qt.avg_score}
                                            </span>
                                          )}
                                        </div>
                                        <p className='text-sm text-gray-600 mt-1'>
                                          {qt.issues}
                                        </p>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                        </>
                      ) : (
                        <p className='text-gray-700'>
                          {JSON.stringify(selectedReport.weakness_analysis)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Study Plan */}
                {selectedReport.study_plan && (
                  <div className='mb-6'>
                    <h3 className='text-lg font-bold mb-3 flex items-center text-purple-600'>
                      <svg
                        className='w-5 h-5 mr-2'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
                        />
                      </svg>
                      Study Plan
                    </h3>
                    <div className='bg-purple-50 p-4 rounded-lg'>
                      {/* Handle structured study plan */}
                      {typeof selectedReport.study_plan === "object" &&
                      !Array.isArray(selectedReport.study_plan) &&
                      (selectedReport.study_plan.resources ||
                        selectedReport.study_plan.daily_schedule ||
                        selectedReport.study_plan.short_term_goals ||
                        selectedReport.study_plan.long_term_goals) ? (
                        <div className='space-y-4'>
                          {/* Resources Section */}
                          {selectedReport.study_plan.resources &&
                            selectedReport.study_plan.resources.length > 0 && (
                              <div className='bg-white p-4 rounded-lg border border-purple-200'>
                                <h4 className='font-semibold text-purple-800 mb-3 flex items-center'>
                                  <svg
                                    className='w-5 h-5 mr-2'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'>
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                                    />
                                  </svg>
                                  Learning Resources
                                </h4>
                                <ul className='list-disc list-inside text-gray-700 space-y-1'>
                                  {selectedReport.study_plan.resources.map(
                                    (resource, idx) => (
                                      <li key={idx} className='text-sm'>
                                        {resource}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            )}

                          {/* Daily Schedule Section */}
                          {selectedReport.study_plan.daily_schedule &&
                            Object.keys(
                              selectedReport.study_plan.daily_schedule,
                            ).length > 0 && (
                              <div className='bg-white p-4 rounded-lg border border-purple-200'>
                                <h4 className='font-semibold text-purple-800 mb-3 flex items-center'>
                                  <svg
                                    className='w-5 h-5 mr-2'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'>
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                                    />
                                  </svg>
                                  Daily Study Schedule
                                </h4>
                                <div className='overflow-x-auto'>
                                  <table className='min-w-full divide-y divide-purple-200'>
                                    <thead className='bg-purple-50'>
                                      <tr>
                                        <th className='px-4 py-2 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider'>
                                          Activity
                                        </th>
                                        <th className='px-4 py-2 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider'>
                                          Duration
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className='divide-y divide-purple-200 bg-white'>
                                      {Object.entries(
                                        selectedReport.study_plan
                                          .daily_schedule,
                                      ).map(([activity, duration], idx) => (
                                        <tr
                                          key={idx}
                                          className={
                                            idx % 2 === 0
                                              ? "bg-white"
                                              : "bg-purple-50/30"
                                          }>
                                          <td className='px-4 py-3 text-sm text-gray-700 font-medium'>
                                            {activity}
                                          </td>
                                          <td className='px-4 py-3 text-sm text-purple-700 font-semibold'>
                                            {duration}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                          {/* Short-term Goals Section */}
                          {selectedReport.study_plan.short_term_goals &&
                            selectedReport.study_plan.short_term_goals.length >
                              0 && (
                              <div className='bg-white p-4 rounded-lg border border-purple-200'>
                                <h4 className='font-semibold text-purple-800 mb-3 flex items-center'>
                                  <svg
                                    className='w-5 h-5 mr-2'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'>
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                                    />
                                  </svg>
                                  Short-term Goals
                                </h4>
                                <ul className='space-y-2'>
                                  {selectedReport.study_plan.short_term_goals.map(
                                    (goal, idx) => (
                                      <li
                                        key={idx}
                                        className='flex items-start'>
                                        <div className='flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold mr-3 mt-0.5'>
                                          {idx + 1}
                                        </div>
                                        <span className='text-sm text-gray-700 flex-1'>
                                          {goal}
                                        </span>
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            )}

                          {/* Long-term Goals Section */}
                          {selectedReport.study_plan.long_term_goals &&
                            selectedReport.study_plan.long_term_goals.length >
                              0 && (
                              <div className='bg-white p-4 rounded-lg border border-purple-200'>
                                <h4 className='font-semibold text-purple-800 mb-3 flex items-center'>
                                  <svg
                                    className='w-5 h-5 mr-2'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'>
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M13 10V3L4 14h7v7l9-11h-7z'
                                    />
                                  </svg>
                                  Long-term Goals
                                </h4>
                                <ul className='space-y-2'>
                                  {selectedReport.study_plan.long_term_goals.map(
                                    (goal, idx) => (
                                      <li
                                        key={idx}
                                        className='flex items-start'>
                                        <svg
                                          className='w-5 h-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0'
                                          fill='none'
                                          stroke='currentColor'
                                          viewBox='0 0 24 24'>
                                          <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M5 13l4 4L19 7'
                                          />
                                        </svg>
                                        <span className='text-sm text-gray-700'>
                                          {goal}
                                        </span>
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      ) : (
                        /* Fallback for old format */
                        <>
                          {typeof selectedReport.study_plan === "string" ? (
                            <p className='text-gray-700 whitespace-pre-line'>
                              {selectedReport.study_plan}
                            </p>
                          ) : (
                            <div className='text-gray-700'>
                              {selectedReport.study_plan.en && (
                                <p className='mb-2'>
                                  {selectedReport.study_plan.en}
                                </p>
                              )}
                              {selectedReport.study_plan.bn && (
                                <p className='text-gray-600 italic'>
                                  {selectedReport.study_plan.bn}
                                </p>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Recommended Topics */}
                {selectedReport.recommended_topics && (
                  <div>
                    <h3 className='text-lg font-bold mb-3 flex items-center text-orange-600'>
                      <svg
                        className='w-5 h-5 mr-2'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                        />
                      </svg>
                      Topics to Focus On
                    </h3>
                    <div className='bg-orange-50 p-4 rounded-lg'>
                      {Array.isArray(selectedReport.recommended_topics) ? (
                        <div className='space-y-3'>
                          {selectedReport.recommended_topics.map(
                            (item, idx) => (
                              <div
                                key={idx}
                                className='bg-white p-4 rounded-lg border border-orange-200 shadow-sm'>
                                <div className='flex justify-between items-start mb-2'>
                                  <h4 className='font-semibold text-orange-800 text-lg'>
                                    {typeof item === "string"
                                      ? item
                                      : item.topic || "Topic"}
                                  </h4>
                                  {typeof item !== "string" &&
                                    item.priority && (
                                      <span
                                        className={`px-2 py-1 rounded text-xs font-medium ${
                                          item.priority === "high"
                                            ? "bg-red-100 text-red-800"
                                            : item.priority === "medium"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : "bg-gray-100 text-gray-800"
                                        }`}>
                                        {item.priority}
                                      </span>
                                    )}
                                </div>
                                {typeof item !== "string" && item.subject && (
                                  <p className='text-sm text-gray-600 mb-2'>
                                    <span className='font-medium'>
                                      Subject:
                                    </span>{" "}
                                    {item.subject}
                                  </p>
                                )}
                                {typeof item !== "string" &&
                                  item.estimated_time && (
                                    <p className='text-sm text-gray-600 mb-2'>
                                      <span className='font-medium'>
                                        Estimated Time:
                                      </span>{" "}
                                      {item.estimated_time}
                                    </p>
                                  )}
                                {typeof item !== "string" &&
                                  item.resources &&
                                  Array.isArray(item.resources) &&
                                  item.resources.length > 0 && (
                                    <div className='mt-3'>
                                      <p className='text-sm font-medium text-gray-700 mb-1'>
                                        Resources:
                                      </p>
                                      <ul className='list-disc list-inside text-sm text-gray-600 space-y-1'>
                                        {item.resources.map(
                                          (resource, ridx) => (
                                            <li key={ridx}>{resource}</li>
                                          ),
                                        )}
                                      </ul>
                                    </div>
                                  )}
                              </div>
                            ),
                          )}
                        </div>
                      ) : typeof selectedReport.recommended_topics ===
                        "string" ? (
                        <span className='px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium'>
                          {selectedReport.recommended_topics}
                        </span>
                      ) : (
                        <span className='text-gray-700'>
                          {JSON.stringify(selectedReport.recommended_topics)}
                        </span>
                      )}
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
