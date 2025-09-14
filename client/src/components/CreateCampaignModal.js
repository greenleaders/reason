import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { campaignsAPI } from '../services/api';
import { X, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateCampaignModal = ({ onClose, onSuccess }) => {
  const [deliverables, setDeliverables] = useState(['']);
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      title: '',
      description: '',
      budget: '',
      currency: 'USD',
      startDate: '',
      endDate: '',
      deliverables: [''],
      targetAudience: {
        ageRange: '',
        interests: '',
        location: '',
        demographics: ''
      },
      contentGuidelines: '',
      approvalRequired: true,
      maxInfluencers: 1
    }
  });

  const addDeliverable = () => {
    setDeliverables([...deliverables, '']);
  };

  const removeDeliverable = (index) => {
    if (deliverables.length > 1) {
      const newDeliverables = deliverables.filter((_, i) => i !== index);
      setDeliverables(newDeliverables);
      setValue('deliverables', newDeliverables);
    }
  };

  const updateDeliverable = (index, value) => {
    const newDeliverables = [...deliverables];
    newDeliverables[index] = value;
    setDeliverables(newDeliverables);
    setValue('deliverables', newDeliverables);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      const campaignData = {
        ...data,
        deliverables: deliverables.filter(d => d.trim() !== ''),
        targetAudience: {
          ageRange: data.targetAudience.ageRange,
          interests: data.targetAudience.interests,
          location: data.targetAudience.location,
          demographics: data.targetAudience.demographics
        }
      };

      await campaignsAPI.create(campaignData);
      toast.success('Campaign created successfully!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Create New Campaign</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Campaign Title *</label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  className="form-input"
                  placeholder="Enter campaign title"
                />
                {errors.title && (
                  <p className="form-error">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">Budget *</label>
                <div className="flex">
                  <select
                    {...register('currency')}
                    className="form-input form-select rounded-r-none border-r-0"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                  <input
                    {...register('budget', { 
                      required: 'Budget is required',
                      min: { value: 1, message: 'Budget must be greater than 0' }
                    })}
                    type="number"
                    step="0.01"
                    className="form-input rounded-l-none"
                    placeholder="0.00"
                  />
                </div>
                {errors.budget && (
                  <p className="form-error">{errors.budget.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="form-label">Description *</label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                className="form-input form-textarea"
                rows={3}
                placeholder="Describe your campaign goals and requirements"
              />
              {errors.description && (
                <p className="form-error">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Start Date *</label>
                <input
                  {...register('startDate', { required: 'Start date is required' })}
                  type="date"
                  className="form-input"
                />
                {errors.startDate && (
                  <p className="form-error">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">End Date *</label>
                <input
                  {...register('endDate', { required: 'End date is required' })}
                  type="date"
                  className="form-input"
                />
                {errors.endDate && (
                  <p className="form-error">{errors.endDate.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Deliverables */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Deliverables</h3>
              <button
                type="button"
                onClick={addDeliverable}
                className="btn btn-outline btn-sm"
              >
                <Plus className="h-4 w-4" />
                Add Deliverable
              </button>
            </div>
            
            {deliverables.map((deliverable, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  value={deliverable}
                  onChange={(e) => updateDeliverable(index, e.target.value)}
                  className="form-input flex-1"
                  placeholder="Enter deliverable requirement"
                />
                {deliverables.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDeliverable(index)}
                    className="btn btn-danger btn-sm"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Target Audience */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Target Audience</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Age Range</label>
                <input
                  {...register('targetAudience.ageRange')}
                  className="form-input"
                  placeholder="e.g., 18-35"
                />
              </div>

              <div>
                <label className="form-label">Location</label>
                <input
                  {...register('targetAudience.location')}
                  className="form-input"
                  placeholder="e.g., United States, Global"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Interests</label>
              <input
                {...register('targetAudience.interests')}
                className="form-input"
                placeholder="e.g., fitness, technology, fashion"
              />
            </div>

            <div>
              <label className="form-label">Demographics</label>
              <input
                {...register('targetAudience.demographics')}
                className="form-input"
                placeholder="e.g., urban professionals, college students"
              />
            </div>
          </div>

          {/* Additional Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Additional Settings</h3>
            
            <div>
              <label className="form-label">Content Guidelines</label>
              <textarea
                {...register('contentGuidelines')}
                className="form-input form-textarea"
                rows={3}
                placeholder="Any specific guidelines for content creation"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Maximum Influencers</label>
                <input
                  {...register('maxInfluencers', { 
                    min: { value: 1, message: 'Must be at least 1' }
                  })}
                  type="number"
                  min="1"
                  className="form-input"
                />
                {errors.maxInfluencers && (
                  <p className="form-error">{errors.maxInfluencers.message}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  {...register('approvalRequired')}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Require content approval
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Creating...
                </>
              ) : (
                'Create Campaign'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaignModal;
