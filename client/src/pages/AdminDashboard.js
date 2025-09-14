import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { campaignsAPI, influencersAPI, assignmentsAPI } from '../services/api';
import { 
  Plus, 
  Users, 
  Campaign, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch campaigns
  const { data: campaignsData, refetch: refetchCampaigns } = useQuery(
    ['campaigns', { status: statusFilter }],
    () => campaignsAPI.getAll({ status: statusFilter }),
    { refetchOnWindowFocus: false }
  );

  // Fetch influencers
  const { data: influencersData } = useQuery(
    'influencers',
    () => influencersAPI.getAll({ limit: 50 }),
    { refetchOnWindowFocus: false }
  );

  // Fetch assignments for selected campaign
  const { data: assignmentsData, refetch: refetchAssignments } = useQuery(
    ['assignments', selectedCampaign?.id],
    () => selectedCampaign ? assignmentsAPI.getByCampaign(selectedCampaign.id) : null,
    { enabled: !!selectedCampaign }
  );

  const campaigns = campaignsData?.data?.campaigns || [];
  const influencers = influencersData?.data?.influencers || [];
  const assignments = assignmentsData?.data?.assignments || [];

  const handleAssignInfluencer = async (influencerId) => {
    try {
      await assignmentsAPI.create({
        campaignId: selectedCampaign.id,
        influencerId: influencerId
      });
      
      toast.success('Influencer assigned successfully!');
      setShowAssignModal(false);
      refetchAssignments();
      refetchCampaigns();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to assign influencer');
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    try {
      await assignmentsAPI.delete(assignmentId);
      toast.success('Assignment removed successfully!');
      refetchAssignments();
      refetchCampaigns();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to remove assignment');
    }
  };

  const handleUpdateCampaignStatus = async (campaignId, status) => {
    try {
      await campaignsAPI.updateStatus(campaignId, status);
      toast.success('Campaign status updated!');
      refetchCampaigns();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { class: 'badge-gray', text: 'Draft' },
      pending_approval: { class: 'badge-warning', text: 'Pending' },
      active: { class: 'badge-success', text: 'Active' },
      completed: { class: 'badge-info', text: 'Completed' },
      cancelled: { class: 'badge-danger', text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalInfluencers: influencers.length,
    pendingApprovals: campaigns.filter(c => c.status === 'pending_approval').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage campaigns and influencers</p>
        </div>
        <button
          onClick={() => setShowAssignModal(true)}
          className="btn btn-primary"
          disabled={!selectedCampaign}
        >
          <Plus className="h-5 w-5" />
          Assign Influencer
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
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Influencers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInfluencers}</p>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaigns List */}
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Campaigns</h2>
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
                      <p className="text-sm text-gray-600">{campaign.company_name}</p>
                      <p className="text-sm text-gray-500">
                        Budget: ${campaign.budget} • {campaign.assigned_influencers} influencers
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {getStatusBadge(campaign.status)}
                      <div className="flex space-x-1">
                        {campaign.status === 'pending_approval' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateCampaignStatus(campaign.id, 'active');
                              }}
                              className="btn btn-success btn-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateCampaignStatus(campaign.id, 'cancelled');
                              }}
                              className="btn btn-danger btn-sm"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Campaign Details & Assignments */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">
              {selectedCampaign ? 'Campaign Details' : 'Select a Campaign'}
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
                  <h4 className="font-medium mb-2">Assigned Influencers</h4>
                  {assignments.length > 0 ? (
                    <div className="space-y-2">
                      {assignments.map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{assignment.first_name} {assignment.last_name}</p>
                            <p className="text-sm text-gray-600">
                              {assignment.instagram_handle && `@${assignment.instagram_handle}`}
                              {assignment.payment_amount && ` • $${assignment.payment_amount}`}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`badge ${
                              assignment.status === 'accepted' ? 'badge-success' :
                              assignment.status === 'declined' ? 'badge-danger' : 'badge-warning'
                            }`}>
                              {assignment.status}
                            </span>
                            <button
                              onClick={() => handleRemoveAssignment(assignment.id)}
                              className="btn btn-danger btn-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No influencers assigned yet</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Select a campaign to view details and manage assignments
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Assign Influencer Modal */}
      {showAssignModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Assign Influencer to {selectedCampaign.title}</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              <div className="grid grid-cols-1 gap-2">
                {influencers.map((influencer) => (
                  <div
                    key={influencer.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">{influencer.first_name} {influencer.last_name}</p>
                      <p className="text-sm text-gray-600">
                        {influencer.niche} • {influencer.follower_count?.toLocaleString()} followers
                      </p>
                    </div>
                    <button
                      onClick={() => handleAssignInfluencer(influencer.id)}
                      className="btn btn-primary btn-sm"
                    >
                      Assign
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
