import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { contentAPI } from '../services/api';
import { X, Upload, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const SubmitContentModal = ({ onClose, onSuccess, assignments }) => {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      assignmentId: '',
      contentType: '',
      contentUrl: '',
      caption: '',
      platform: ''
    }
  });

  const watchedAssignmentId = watch('assignmentId');
  const watchedContentType = watch('contentType');

  // Update selected assignment when form changes
  React.useEffect(() => {
    if (watchedAssignmentId) {
      const assignment = assignments.find(a => a.id === watchedAssignmentId);
      setSelectedAssignment(assignment);
    }
  }, [watchedAssignmentId, assignments]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // You would typically upload the file here and get a URL
      // For now, we'll just store the file name
      setValue('contentUrl', file.name);
    }
  };

  const onSubmit = async (data) => {
    if (!selectedAssignment) {
      toast.error('Please select an assignment');
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('assignmentId', data.assignmentId);
      formData.append('contentType', data.contentType);
      formData.append('contentUrl', data.contentUrl);
      formData.append('caption', data.caption);
      formData.append('platform', data.platform);
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await contentAPI.submit(formData);
      toast.success('Content submitted successfully!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit content');
    } finally {
      setLoading(false);
    }
  };

  const contentTypes = [
    { value: 'image', label: 'Image' },
    { value: 'video', label: 'Video' },
    { value: 'post', label: 'Social Media Post' },
    { value: 'story', label: 'Story' },
    { value: 'reel', label: 'Reel' }
  ];

  const platforms = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'linkedin', label: 'LinkedIn' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Submit Content</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Assignment Selection */}
          <div>
            <label className="form-label">Select Assignment *</label>
            <select
              {...register('assignmentId', { required: 'Please select an assignment' })}
              className="form-input form-select"
            >
              <option value="">Choose an assignment...</option>
              {assignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.campaign_title} - {assignment.company_name}
                </option>
              ))}
            </select>
            {errors.assignmentId && (
              <p className="form-error">{errors.assignmentId.message}</p>
            )}
          </div>

          {/* Assignment Details */}
          {selectedAssignment && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Assignment Details</h3>
              <p className="text-sm text-blue-800 mb-2">{selectedAssignment.campaign_description}</p>
              <div className="text-xs text-blue-700">
                <p>Budget: ${selectedAssignment.payment_amount || 'TBD'}</p>
                <p>Deadline: {selectedAssignment.end_date}</p>
                <p>Company: {selectedAssignment.company_name}</p>
              </div>
            </div>
          )}

          {/* Content Type and Platform */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Content Type *</label>
              <select
                {...register('contentType', { required: 'Content type is required' })}
                className="form-input form-select"
              >
                <option value="">Select content type...</option>
                {contentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.contentType && (
                <p className="form-error">{errors.contentType.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Platform *</label>
              <select
                {...register('platform', { required: 'Platform is required' })}
                className="form-input form-select"
              >
                <option value="">Select platform...</option>
                {platforms.map((platform) => (
                  <option key={platform.value} value={platform.value}>
                    {platform.label}
                  </option>
                ))}
              </select>
              {errors.platform && (
                <p className="form-error">{errors.platform.message}</p>
              )}
            </div>
          </div>

          {/* Content Upload/URL */}
          <div>
            <label className="form-label">Content *</label>
            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">Images, videos, or PDFs</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*,video/*,.pdf"
                    />
                  </label>
                </div>
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or provide a URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('contentUrl', { required: 'Content URL is required' })}
                    type="url"
                    className="form-input pl-10"
                    placeholder="https://example.com/content"
                  />
                </div>
                {errors.contentUrl && (
                  <p className="form-error">{errors.contentUrl.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="form-label">Caption/Description</label>
            <textarea
              {...register('caption')}
              className="form-input form-textarea"
              rows={4}
              placeholder="Add a caption or description for your content..."
              maxLength={2200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {watch('caption')?.length || 0}/2200 characters
            </p>
          </div>

          {/* Guidelines */}
          {selectedAssignment && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Content Guidelines</h4>
              <p className="text-sm text-yellow-800">
                {selectedAssignment.content_guidelines || 
                  'Please ensure your content aligns with the campaign objectives and brand guidelines.'}
              </p>
            </div>
          )}

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
                  Submitting...
                </>
              ) : (
                'Submit Content'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitContentModal;
