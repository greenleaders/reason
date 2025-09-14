import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { X, Plus, Minus, Instagram, Youtube, Twitter, Linkedin } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfileModal = ({ onClose, onSuccess }) => {
  const { updateProfile } = useAuth();
  const [languages, setLanguages] = useState(['']);
  const [portfolioUrls, setPortfolioUrls] = useState(['']);
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      bio: '',
      niche: '',
      followerCount: '',
      engagementRate: '',
      instagramHandle: '',
      tiktokHandle: '',
      youtubeHandle: '',
      twitterHandle: '',
      linkedinHandle: '',
      location: '',
      rates: {
        post: '',
        story: '',
        video: '',
        reel: ''
      }
    }
  });

  const addLanguage = () => {
    setLanguages([...languages, '']);
  };

  const removeLanguage = (index) => {
    if (languages.length > 1) {
      const newLanguages = languages.filter((_, i) => i !== index);
      setLanguages(newLanguages);
    }
  };

  const updateLanguage = (index, value) => {
    const newLanguages = [...languages];
    newLanguages[index] = value;
    setLanguages(newLanguages);
  };

  const addPortfolioUrl = () => {
    setPortfolioUrls([...portfolioUrls, '']);
  };

  const removePortfolioUrl = (index) => {
    if (portfolioUrls.length > 1) {
      const newPortfolioUrls = portfolioUrls.filter((_, i) => i !== index);
      setPortfolioUrls(newPortfolioUrls);
    }
  };

  const updatePortfolioUrl = (index, value) => {
    const newPortfolioUrls = [...portfolioUrls];
    newPortfolioUrls[index] = value;
    setPortfolioUrls(newPortfolioUrls);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      const profileData = {
        ...data,
        followerCount: data.followerCount ? parseInt(data.followerCount) : 0,
        engagementRate: data.engagementRate ? parseFloat(data.engagementRate) : 0,
        languages: languages.filter(l => l.trim() !== ''),
        portfolioUrls: portfolioUrls.filter(url => url.trim() !== ''),
        rates: {
          post: data.rates.post || '',
          story: data.rates.story || '',
          video: data.rates.video || '',
          reel: data.rates.reel || ''
        }
      };

      const result = await updateProfile(profileData);
      
      if (result.success) {
        toast.success('Profile updated successfully!');
        onSuccess();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const socialIcons = {
    instagram: Instagram,
    youtube: Youtube,
    twitter: Twitter,
    linkedin: Linkedin
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Update Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div>
              <label className="form-label">Bio</label>
              <textarea
                {...register('bio')}
                className="form-input form-textarea"
                rows={3}
                placeholder="Tell us about yourself and your content..."
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {watch('bio')?.length || 0}/1000 characters
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Niche/Category</label>
                <input
                  {...register('niche')}
                  className="form-input"
                  placeholder="e.g., Fitness, Technology, Fashion"
                />
              </div>

              <div>
                <label className="form-label">Location</label>
                <input
                  {...register('location')}
                  className="form-input"
                  placeholder="e.g., New York, USA"
                />
              </div>
            </div>
          </div>

          {/* Social Media Stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Social Media Stats</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Total Followers</label>
                <input
                  {...register('followerCount', { 
                    min: { value: 0, message: 'Must be 0 or greater' }
                  })}
                  type="number"
                  min="0"
                  className="form-input"
                  placeholder="0"
                />
                {errors.followerCount && (
                  <p className="form-error">{errors.followerCount.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">Engagement Rate (%)</label>
                <input
                  {...register('engagementRate', { 
                    min: { value: 0, message: 'Must be 0 or greater' },
                    max: { value: 100, message: 'Must be 100 or less' }
                  })}
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className="form-input"
                  placeholder="0.00"
                />
                {errors.engagementRate && (
                  <p className="form-error">{errors.engagementRate.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Social Media Handles */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Social Media Handles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label flex items-center">
                  <Instagram className="h-4 w-4 mr-2 text-pink-500" />
                  Instagram Handle
                </label>
                <input
                  {...register('instagramHandle')}
                  className="form-input"
                  placeholder="@username"
                />
              </div>

              <div>
                <label className="form-label flex items-center">
                  <Youtube className="h-4 w-4 mr-2 text-red-500" />
                  YouTube Handle
                </label>
                <input
                  {...register('youtubeHandle')}
                  className="form-input"
                  placeholder="@username"
                />
              </div>

              <div>
                <label className="form-label flex items-center">
                  <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                  Twitter Handle
                </label>
                <input
                  {...register('twitterHandle')}
                  className="form-input"
                  placeholder="@username"
                />
              </div>

              <div>
                <label className="form-label flex items-center">
                  <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
                  LinkedIn Handle
                </label>
                <input
                  {...register('linkedinHandle')}
                  className="form-input"
                  placeholder="@username"
                />
              </div>

              <div>
                <label className="form-label">TikTok Handle</label>
                <input
                  {...register('tiktokHandle')}
                  className="form-input"
                  placeholder="@username"
                />
              </div>
            </div>
          </div>

          {/* Languages */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Languages</h3>
              <button
                type="button"
                onClick={addLanguage}
                className="btn btn-outline btn-sm"
              >
                <Plus className="h-4 w-4" />
                Add Language
              </button>
            </div>
            
            {languages.map((language, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  value={language}
                  onChange={(e) => updateLanguage(index, e.target.value)}
                  className="form-input flex-1"
                  placeholder="Enter language"
                />
                {languages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLanguage(index)}
                    className="btn btn-danger btn-sm"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Rates */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Content Rates (USD)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Post Rate</label>
                <input
                  {...register('rates.post')}
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="form-label">Story Rate</label>
                <input
                  {...register('rates.story')}
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="form-label">Video Rate</label>
                <input
                  {...register('rates.video')}
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="form-label">Reel Rate</label>
                <input
                  {...register('rates.reel')}
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Portfolio URLs */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Portfolio URLs</h3>
              <button
                type="button"
                onClick={addPortfolioUrl}
                className="btn btn-outline btn-sm"
              >
                <Plus className="h-4 w-4" />
                Add URL
              </button>
            </div>
            
            {portfolioUrls.map((url, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  value={url}
                  onChange={(e) => updatePortfolioUrl(index, e.target.value)}
                  type="url"
                  className="form-input flex-1"
                  placeholder="https://example.com/portfolio"
                />
                {portfolioUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePortfolioUrl(index)}
                    className="btn btn-danger btn-sm"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
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
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
