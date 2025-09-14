import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { campaignsAPI, paymentsAPI, contentAPI } from '../services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  FileText,
  Calendar,
  Filter
} from 'lucide-react';

const Analytics = () => {
  const [dateRange, setDateRange] = useState('30');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  // Fetch analytics data
  const { data: campaignsData } = useQuery(
    ['campaigns-analytics', { status: 'all' }],
    () => campaignsAPI.getAll({ status: 'all' }),
    { refetchOnWindowFocus: false }
  );

  const { data: paymentsData } = useQuery(
    'payments-analytics',
    () => paymentsAPI.getStats(),
    { refetchOnWindowFocus: false }
  );

  const { data: contentData } = useQuery(
    'content-analytics',
    () => contentAPI.getByCampaign('all'),
    { refetchOnWindowFocus: false }
  );

  const campaigns = campaignsData?.data?.campaigns || [];
  const payments = paymentsData?.data || {};
  const contentSubmissions = contentData?.data?.submissions || [];

  // Calculate metrics
  const metrics = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    completedCampaigns: campaigns.filter(c => c.status === 'completed').length,
    totalRevenue: payments.overall?.total_amount || 0,
    platformRevenue: payments.overall?.total_platform_fee || 0,
    influencerPayouts: payments.overall?.total_influencer_amount || 0,
    totalSubmissions: contentSubmissions.length,
    approvedSubmissions: contentSubmissions.filter(c => c.status === 'approved').length,
    pendingSubmissions: contentSubmissions.filter(c => c.status === 'submitted').length
  };

  // Campaign status distribution
  const campaignStatusData = [
    { name: 'Draft', value: campaigns.filter(c => c.status === 'draft').length, color: '#6B7280' },
    { name: 'Pending', value: campaigns.filter(c => c.status === 'pending_approval').length, color: '#F59E0B' },
    { name: 'Active', value: campaigns.filter(c => c.status === 'active').length, color: '#10B981' },
    { name: 'Completed', value: campaigns.filter(c => c.status === 'completed').length, color: '#3B82F6' },
    { name: 'Cancelled', value: campaigns.filter(c => c.status === 'cancelled').length, color: '#EF4444' }
  ];

  // Content status distribution
  const contentStatusData = [
    { name: 'Submitted', value: contentSubmissions.filter(c => c.status === 'submitted').length, color: '#F59E0B' },
    { name: 'Under Review', value: contentSubmissions.filter(c => c.status === 'under_review').length, color: '#3B82F6' },
    { name: 'Approved', value: contentSubmissions.filter(c => c.status === 'approved').length, color: '#10B981' },
    { name: 'Revision Requested', value: contentSubmissions.filter(c => c.status === 'revision_requested').length, color: '#F59E0B' },
    { name: 'Rejected', value: contentSubmissions.filter(c => c.status === 'rejected').length, color: '#EF4444' }
  ];

  // Monthly revenue data
  const monthlyRevenueData = payments.monthly?.map(month => ({
    month: new Date(month.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    revenue: parseFloat(month.total_amount) || 0,
    platformFee: parseFloat(month.platform_fee) || 0,
    influencerPayout: (parseFloat(month.total_amount) - parseFloat(month.platform_fee)) || 0
  })) || [];

  // Top performing campaigns
  const topCampaigns = campaigns
    .filter(c => c.status === 'completed')
    .sort((a, b) => (b.assigned_influencers || 0) - (a.assigned_influencers || 0))
    .slice(0, 5);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track performance and insights</p>
        </div>
        <div className="flex space-x-3">
          <select
            className="form-input form-select"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <select
            className="form-input form-select"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
          >
            <option value="overview">Overview</option>
            <option value="campaigns">Campaigns</option>
            <option value="content">Content</option>
            <option value="revenue">Revenue</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalCampaigns}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${metrics.totalRevenue.toLocaleString()}</p>
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
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.activeCampaigns}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Content Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalSubmissions}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Status Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Campaign Status Distribution</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={campaignStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {campaignStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Status Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Content Status Distribution</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Monthly Revenue Trend</h3>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Total Revenue"
              />
              <Line 
                type="monotone" 
                dataKey="platformFee" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Platform Fee"
              />
              <Line 
                type="monotone" 
                dataKey="influencerPayout" 
                stroke="#F59E0B" 
                strokeWidth={2}
                name="Influencer Payout"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performing Campaigns */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Top Performing Campaigns</h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {topCampaigns.map((campaign, index) => (
              <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{campaign.title}</h4>
                    <p className="text-sm text-gray-600">{campaign.company_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {campaign.assigned_influencers || 0} influencers
                  </p>
                  <p className="text-sm text-gray-600">${campaign.budget}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body text-center">
            <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600">${metrics.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Platform Fee</h3>
            <p className="text-3xl font-bold text-blue-600">${metrics.platformRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Influencer Payouts</h3>
            <p className="text-3xl font-bold text-purple-600">${metrics.influencerPayouts.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
