import React, { useState } from 'react';
import DataTable from './DataTable';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import EmptyState from './EmptyState';
import StatusBadge from './StatusBadge';
import StatsCard from './StatsCard';
import SearchInput from './SearchInput';
import FilterDropdown from './FilterDropdown';
import DateRangePicker from './DateRangePicker';
import ExportButton from './ExportButton';
import ProgressBar from './ProgressBar';
import Tooltip from './Tooltip';
import { 
  Users, 
  Campaign, 
  TrendingUp, 
  Bell,
  Download,
  Filter
} from 'lucide-react';

const ComponentShowcase = () => {
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Sample data for DataTable
  const sampleData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', revenue: 1500 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'pending', revenue: 2300 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'inactive', revenue: 800 },
  ];

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { 
      key: 'status', 
      label: 'Status', 
      render: (value) => <StatusBadge status={value} type="assignment" />
    },
    { 
      key: 'revenue', 
      label: 'Revenue', 
      type: 'currency',
      sortable: true 
    }
  ];

  const filterOptions = [
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'inactive', label: 'Inactive' }
  ];

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Component Showcase</h1>
      
      {/* Stats Cards */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Stats Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Total Users"
            value={1250}
            change={12}
            changeType="positive"
            icon={Users}
            color="blue"
          />
          <StatsCard
            title="Active Campaigns"
            value={45}
            change={-5}
            changeType="negative"
            icon={Campaign}
            color="green"
          />
          <StatsCard
            title="Revenue"
            value={125000}
            change={8}
            changeType="positive"
            icon={TrendingUp}
            color="purple"
            formatValue={(val) => `$${val.toLocaleString()}`}
          />
        </div>
      </section>

      {/* Search and Filters */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Search and Filters</h2>
        <div className="flex space-x-4 mb-4">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search users..."
            className="w-64"
          />
          <FilterDropdown
            options={filterOptions}
            value={selectedFilters}
            onChange={setSelectedFilters}
            placeholder="Filter by status..."
            className="w-48"
          />
          <DateRangePicker
            startDate={dateRange.start}
            endDate={dateRange.end}
            onChange={(start, end) => setDateRange({ start, end })}
            className="w-64"
          />
        </div>
      </section>

      {/* Data Table */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Data Table</h2>
        <DataTable
          data={sampleData}
          columns={columns}
          onEdit={(row) => console.log('Edit:', row)}
          onDelete={(row) => setShowConfirm(true)}
          searchable={false}
          pagination={true}
          pageSize={2}
        />
      </section>

      {/* Progress Bars */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Progress Bars</h2>
        <div className="space-y-4">
          <ProgressBar value={75} max={100} label="Campaign Completion" />
          <ProgressBar value={60} max={100} color="green" striped animated />
          <ProgressBar value={30} max={100} color="red" size="sm" />
        </div>
      </section>

      {/* Status Badges */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Status Badges</h2>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="active" type="campaign" />
          <StatusBadge status="pending" type="assignment" />
          <StatusBadge status="approved" type="content" />
          <StatusBadge status="completed" type="payment" />
        </div>
      </section>

      {/* Modals */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Modals</h2>
        <div className="space-x-4">
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
          >
            Open Modal
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="btn btn-danger"
          >
            Show Confirm Dialog
          </button>
        </div>
      </section>

      {/* Empty States */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Empty States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EmptyState
            icon="campaigns"
            title="No campaigns yet"
            description="Create your first campaign to get started"
            action={() => console.log('Create campaign')}
            actionText="Create Campaign"
          />
          <EmptyState
            icon="search"
            title="No results found"
            description="Try adjusting your search terms"
          />
        </div>
      </section>

      {/* Tooltips */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Tooltips</h2>
        <div className="flex space-x-4">
          <Tooltip content="This is a tooltip">
            <button className="btn btn-outline">Hover me</button>
          </Tooltip>
          <Tooltip content="Tooltip on the right" position="right">
            <button className="btn btn-outline">Right tooltip</button>
          </Tooltip>
        </div>
      </section>

      {/* Export Button */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Export Functionality</h2>
        <div className="flex space-x-2">
          <ExportButton
            data={sampleData}
            filename="users"
            format="csv"
          />
          <ExportButton
            data={sampleData}
            filename="users"
            format="json"
          />
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Sample Modal"
          size="md"
        >
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              This is a sample modal with some content.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-primary"
              >
                Confirm
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Dialog */}
      {showConfirm && (
        <ConfirmDialog
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={() => {
            console.log('Confirmed');
            setShowConfirm(false);
          }}
          title="Delete Item"
          message="Are you sure you want to delete this item? This action cannot be undone."
          type="danger"
          confirmText="Delete"
        />
      )}
    </div>
  );
};

export default ComponentShowcase;
