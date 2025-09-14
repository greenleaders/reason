import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { influencersAPI, contentAPI } from '../services/api';
import { 
  UserCheck, 
  FileText, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Upload,
  Eye,
  Calendar,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import SubmitContentModal from '../components/SubmitContentModal';
import ProfileModal from '../components/ProfileModal';

const InfluencerDashboard = () => {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch influencer's assignments
  const { data: assignmentsData, refetch: refetchAssignments } = useQuery(
    ['assignments', { status: statusFilter }],
    () => influencersAPI.getCampaigns('me', { status: statusFilter }),
    { refetchOnWindowFocus: false }
  );

  // Fetch content submissions
  const { data: contentData, refetch: refetchContent } = useQuery(
    'content-submissions',
    () => contentAPI.getByInfluencer('me'),
    { refetchOnWindowFocus: false }
  );

  const assignments = assignmentsData?.data?.campaigns || [];
  const contentSubmissions = contentData?.data?.submissions || [];

  const handleAcceptAssignment = async (assignmentId) => {
    try {
      await influencersAPI.updateAssignmentStatus(assignmentId, 'accepted');
      toast.success('Assignment accepted!');
      refetchAssignments();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to accept assignment');
    }
  };

  const handleDeclineAssignment = async (assignmentId) => {
    if (window.confirm('Are you sure you want to decline this assignment?')) {
      try {
        await influencersAPI.updateAssignmentStatus(assignmentId, 'declined');
        toast.success('Assignment declined');
        refetchAssignments();
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to decline assignment');
      }
    }
  };

  const handleSubmitContent = (assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmitModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      assigned: { class: 'badge-warning', text: 'Assigned' },
      accepted: { class: 'badge-success', text: 'Accepted' },
      declined: { class: 'badge-danger', text: 'Declined' },
      completed: { class: 'badge-info', text: 'Completed' }
    };
    
    const config = statusConfig[status] || statusConfig.assigned;
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getContentStatusBadge = (status) => {
    const statusConfig = {
      submitted: { class: 'badge-warning', text: 'Submitted' },
      under_review: { class: 'badge-info', text: 'Under Review' },
      approved: { class: 'badge-success', text: 'Approved' },
      revision_requested: { class: 'badge-warning', text: 'Revision Requested' },
      rejected: { class: 'badge-danger', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || statusConfig.submitted;
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (statusFilter === 'all') return true;
    return assignment.assignment_status === statusFilter;
  });

  const stats = {
    totalAssignments: assignments.length,
    acceptedAssignments: assignments.filter(a => a.assignment_status === 'accepted').length,
    completedAssignments: assignments.filter(a => a.assignment_status === 'completed').length,
    pendingSubmissions: contentSubmissions.filter(c => c.status === 'submitted').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Influencer Dashboard</h1>
          <p className="text-gray-600">Manage your campaign assignments and content</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowProfileModal(true)}
            className="btn btn-outline"
          >
            <UserCheck className="h-5 w-5" />
            Update Profile
          </button>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="btn btn-primary"
            disabled={!assignments.some(a => a.assignment_status === 'accepted')}
          >
            <Upload className="h-5 w-5" />
            Submit Content
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-gray-900">{stats.acceptedAssignments}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedAssignments}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingSubmissions}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignments List */}
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">My Assignments</h2>
              <select
                className="form-input form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="assigned">Assigned</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="max-h-96 overflow-y-auto">
              {filteredAssignments.map((assignment) => (
                <div key={assignment.id} className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{assignment.campaign_title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{assignment.campaign_description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {assignment.payment_amount ? `$${assignment.payment_amount}` : 'TBD'}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {assignment.end_date}
                        </span>
                        <span>{assignment.company_name}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {getStatusBadge(assignment.assignment_status)}
                      <div className="flex space-x-1">
                        {assignment.assignment_status === 'assigned' && (
                          <>
                            <button
                              onClick={() => handleAcceptAssignment(assignment.id)}
                              className="btn btn-success btn-sm"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleDeclineAssignment(assignment.id)}
                              className="btn btn-danger btn-sm"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {assignment.assignment_status === 'accepted' && (
                          <button
                            onClick={() => handleSubmitContent(assignment)}
                            className="btn btn-primary btn-sm"
                          >
                            Submit Content
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Submissions */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Content Submissions</h2>
          </div>
          <div className="card-body">
            {contentSubmissions.length > 0 ? (
              <div className="space-y-3">
                {contentSubmissions.map((submission) => (
                  <div key={submission.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-sm">{submission.campaign_title}</span>
                          <span className="text-xs text-gray-500">
                            {submission.platform} • {submission.content_type}
                          </span>
                        </div>
                        {submission.caption && (
                          <p className="text-sm text-gray-600 mb-2">{submission.caption}</p>
                        )}
                        {submission.content_url && (
                          <a
                            href={submission.content_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View Content →
                          </a>
                        )}
                        {submission.feedback && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-xs text-yellow-800">
                              <strong>Feedback:</strong> {submission.feedback}
                            </p>
                          </div>
                        )}
                        {submission.revision_notes && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                            <p className="text-xs text-red-800">
                              <strong>Revision Notes:</strong> {submission.revision_notes}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {getContentStatusBadge(submission.status)}
                        <span className="text-xs text-gray-500">
                          {new Date(submission.submitted_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No content submissions yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Submit Content Modal */}
      {showSubmitModal && (
        <SubmitContentModal
          onClose={() => setShowSubmitModal(false)}
          onSuccess={() => {
            setShowSubmitModal(false);
            refetchContent();
          }}
          assignments={assignments.filter(a => a.assignment_status === 'accepted')}
        />
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          onClose={() => setShowProfileModal(false)}
          onSuccess={() => {
            setShowProfileModal(false);
            toast.success('Profile updated successfully!');
          }}
        />
      )}
    </div>
  );
};

export default InfluencerDashboard;
