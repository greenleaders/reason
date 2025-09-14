import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { campaignsAPI, contentAPI } from '../services/api';
import { 
  Plus, 
  Campaign, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import CreateCampaignModal from '../components/CreateCampaignModal';

const BusinessDashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch campaigns
  const { data: campaignsData, refetch: refetchCampaigns } = useQuery(
    ['campaigns', { status: statusFilter }],
    () => campaignsAPI.getAll({ status: statusFilter }),
    { refetchOnWindowFocus: false }
  );

  // Fetch content submissions for selected campaign
  const { data: contentData, refetch: refetchContent } = useQuery(
    ['content', selectedCampaign?.id],
    () => selectedCampaign ? contentAPI.getByCampaign(selectedCampaign.id) : null,
    { enabled: !!selectedCampaign }
  );

  const campaigns = campaignsData?.data?.campaigns || [];
  const contentSubmissions = contentData?.data?.submissions || [];

  const handleCreateCampaign = () => {
    setShowCreateModal(true);
  };

  const handleEditCampaign = (campaign) => {
    // TODO: Implement edit functionality
    toast.info('Edit functionality coming soon!');
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await campaignsAPI.delete(campaignId);
        toast.success('Campaign deleted successfully!');
        refetchCampaigns();
        if (selectedCampaign?.id === campaignId) {
          setSelectedCampaign(null);
        }
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete campaign');
      }
    }
  };

  const handleReviewContent = async (submissionId, status, feedback = '') => {
    try {
      await contentAPI.review(submissionId, { status, feedback });
      toast.success('Content review updated!');
      refetchContent();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update review');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { class: 'badge-gray', text: 'Draft' },
      pending_approval: { class: 'badge-warning', text: 'Pending Approval' },
      active: { class: 'badge-success', text: 'Active' },
      completed: { class: 'badge-info', text: 'Completed' },
      cancelled: { class: 'badge-danger', text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
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

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    pendingApprovals: campaigns.filter(c => c.status === 'pending_approval').length,
    totalSubmissions: contentSubmissions.length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Dashboard</h1>
          <p className="text-gray-600">Manage your marketing campaigns</p>
        </div>
        <button
          onClick={handleCreateCampaign}
          className="btn btn-primary"
        >
          <Plus className="h-5 w-5" />
          Create Campaign
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Campaign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</p>
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
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCampaigns}</p>
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
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
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
                <p className="text-sm font-medium text-gray-600">Content Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaigns List */}
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">My Campaigns</h2>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    className="form-input pl-10 pr-4 py-2 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="form-input form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="pending_approval">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="max-h-96 overflow-y-auto">
              {filteredCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                    selectedCampaign?.id === campaign.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => setSelectedCampaign(campaign)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{campaign.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{campaign.description}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Budget: ${campaign.budget} • {campaign.assigned_influencers} influencers
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {getStatusBadge(campaign.status)}
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCampaign(campaign);
                          }}
                          className="btn btn-outline btn-sm"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {campaign.status === 'draft' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCampaign(campaign.id);
                            }}
                            className="btn btn-danger btn-sm"
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* Campaign Details & Content Review */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">
              {selectedCampaign ? 'Campaign Details & Content' : 'Select a Campaign'}
            </h2>
          </div>
          <div className="card-body">
            {selectedCampaign ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedCampaign.title}</h3>
                  <p className="text-gray-600">{selectedCampaign.description}</p>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span>Budget: ${selectedCampaign.budget}</span>
                    <span>•</span>
                    <span>{selectedCampaign.start_date} - {selectedCampaign.end_date}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Content Submissions</h4>
                  {contentSubmissions.length > 0 ? (
                    <div className="space-y-3">
                      {contentSubmissions.map((submission) => (
                        <div key={submission.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-medium text-sm">
                                  {submission.influencer_first_name} {submission.influencer_last_name}
                                </span>
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
                                <p className="text-xs text-gray-500 mt-1">
                                  Feedback: {submission.feedback}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              {getContentStatusBadge(submission.status)}
                              {submission.status === 'submitted' && (
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => handleReviewContent(submission.id, 'approved')}
                                    className="btn btn-success btn-sm"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      const feedback = prompt('Please provide feedback for revision:');
                                      if (feedback) {
                                        handleReviewContent(submission.id, 'revision_requested', feedback);
                                      }
                                    }}
                                    className="btn btn-warning btn-sm"
                                  >
                                    Request Revision
                                  </button>
                                  <button
                                    onClick={() => {
                                      const feedback = prompt('Please provide reason for rejection:');
                                      if (feedback) {
                                        handleReviewContent(submission.id, 'rejected', feedback);
                                      }
                                    }}
                                    className="btn btn-danger btn-sm"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No content submissions yet</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Select a campaign to view details and review content
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <CreateCampaignModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refetchCampaigns();
          }}
        />
      )}
    </div>
  );
};

export default BusinessDashboard;
