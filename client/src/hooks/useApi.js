import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

// Custom hook for API calls with loading and error states
export const useApi = (apiFunction, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      setData(result.data);
      return result.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  return { data, loading, error, execute };
};

// Custom hook for paginated data
export const usePaginatedQuery = (queryKey, queryFn, options = {}) => {
  const {
    page = 1,
    limit = 10,
    ...queryOptions
  } = options;

  return useQuery(
    [...queryKey, { page, limit }],
    () => queryFn({ page, limit }),
    {
      keepPreviousData: true,
      ...queryOptions
    }
  );
};

// Custom hook for infinite scroll
export const useInfiniteQuery = (queryKey, queryFn, options = {}) => {
  const {
    limit = 10,
    ...queryOptions
  } = options;

  return useQuery(
    queryKey,
    ({ pageParam = 1 }) => queryFn({ page: pageParam, limit }),
    {
      getNextPageParam: (lastPage, pages) => {
        const { pagination } = lastPage;
        return pagination.page < pagination.pages ? pagination.page + 1 : undefined;
      },
      ...queryOptions
    }
  );
};

// Custom hook for optimistic updates
export const useOptimisticMutation = (mutationFn, options = {}) => {
  const queryClient = useQueryClient();
  const {
    queryKey,
    onMutate,
    onSuccess,
    onError,
    onSettled,
    ...mutationOptions
  } = options;

  return useMutation(mutationFn, {
    onMutate: async (variables) => {
      if (queryKey) {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries(queryKey);

        // Snapshot the previous value
        const previousData = queryClient.getQueryData(queryKey);

        // Optimistically update to the new value
        if (onMutate) {
          const optimisticData = onMutate(variables, previousData);
          queryClient.setQueryData(queryKey, optimisticData);
        }

        return { previousData };
      }
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData && queryKey) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      toast.error(errorMessage);
      
      if (onError) {
        onError(err, variables, context);
      }
    },
    onSuccess: (data, variables, context) => {
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    onSettled: (data, error, variables, context) => {
      // Always refetch after error or success
      if (queryKey) {
        queryClient.invalidateQueries(queryKey);
      }
      
      if (onSettled) {
        onSettled(data, error, variables, context);
      }
    },
    ...mutationOptions
  });
};

// Custom hook for form submission with API
export const useFormSubmission = (submitFn, options = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const {
    onSuccess,
    onError,
    successMessage = 'Operation completed successfully',
    errorMessage = 'An error occurred'
  } = options;

  const submit = useCallback(async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await submitFn(data);
      
      if (successMessage) {
        toast.success(successMessage);
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || errorMessage;
      setSubmitError(errorMsg);
      
      if (errorMessage) {
        toast.error(errorMsg);
      }
      
      if (onError) {
        onError(error);
      }
      
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [submitFn, onSuccess, onError, successMessage, errorMessage]);

  return {
    submit,
    isSubmitting,
    submitError,
    clearError: () => setSubmitError(null)
  };
};

// Custom hook for data fetching with retry logic
export const useRetryQuery = (queryKey, queryFn, options = {}) => {
  const {
    retry = 3,
    retryDelay = 1000,
    ...queryOptions
  } = options;

  return useQuery(queryKey, queryFn, {
    retry: (failureCount, error) => {
      if (failureCount < retry) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...queryOptions
  });
};

// Custom hook for real-time data updates
export const useRealtimeQuery = (queryKey, queryFn, options = {}) => {
  const {
    refetchInterval = 30000, // 30 seconds
    ...queryOptions
  } = options;

  return useQuery(queryKey, queryFn, {
    refetchInterval,
    refetchIntervalInBackground: false,
    ...queryOptions
  });
};

// Custom hook for batch operations
export const useBatchMutation = (mutationFn, options = {}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState([]);

  const execute = useCallback(async (items, batchSize = 5) => {
    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    setErrors([]);

    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    const allResults = [];
    const allErrors = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      try {
        const batchResults = await Promise.allSettled(
          batch.map(item => mutationFn(item))
        );

        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            allResults.push(result.value);
          } else {
            allErrors.push({
              item: batch[index],
              error: result.reason
            });
          }
        });

        setResults([...allResults]);
        setErrors([...allErrors]);
        setProgress(((i + 1) / batches.length) * 100);
      } catch (error) {
        allErrors.push({
          batch,
          error
        });
        setErrors([...allErrors]);
      }
    }

    setIsProcessing(false);
    return { results: allResults, errors: allErrors };
  }, [mutationFn]);

  return {
    execute,
    isProcessing,
    progress,
    results,
    errors
  };
};

// Custom hook for search with debouncing
export const useSearch = (searchFn, options = {}) => {
  const {
    debounceMs = 300,
    minLength = 2,
    ...queryOptions
  } = options;

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  const query = useQuery(
    ['search', debouncedSearchTerm],
    () => searchFn(debouncedSearchTerm),
    {
      enabled: debouncedSearchTerm.length >= minLength,
      ...queryOptions
    }
  );

  return {
    ...query,
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm
  };
};

// Custom hook for file upload
export const useFileUpload = (uploadFn, options = {}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadError, setUploadError] = useState(null);

  const {
    onSuccess,
    onError,
    onProgress,
    multiple = false,
    maxFiles = 5,
    maxSize = 10 * 1024 * 1024 // 10MB
  } = options;

  const upload = useCallback(async (files) => {
    const fileArray = Array.isArray(files) ? files : [files];
    
    if (fileArray.length > maxFiles) {
      throw new Error(`Maximum ${maxFiles} files allowed`);
    }

    // Validate file sizes
    for (const file of fileArray) {
      if (file.size > maxSize) {
        throw new Error(`File ${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
      }
    }

    setUploading(true);
    setProgress(0);
    setUploadError(null);

    try {
      const results = [];
      
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const formData = new FormData();
        formData.append('file', file);

        const result = await uploadFn(formData, {
          onUploadProgress: (progressEvent) => {
            const fileProgress = (progressEvent.loaded / progressEvent.total) * 100;
            const totalProgress = ((i + fileProgress / 100) / fileArray.length) * 100;
            setProgress(totalProgress);
            
            if (onProgress) {
              onProgress(totalProgress, file, i);
            }
          }
        });

        results.push(result);
      }

      setUploadedFiles(prev => [...prev, ...results]);
      
      if (onSuccess) {
        onSuccess(results);
      }

      return results;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Upload failed';
      setUploadError(errorMessage);
      
      if (onError) {
        onError(error);
      }
      
      throw error;
    } finally {
      setUploading(false);
    }
  }, [uploadFn, onSuccess, onError, onProgress, multiple, maxFiles, maxSize]);

  const clearUploads = () => {
    setUploadedFiles([]);
    setUploadError(null);
    setProgress(0);
  };

  return {
    upload,
    uploading,
    progress,
    uploadedFiles,
    uploadError,
    clearUploads
  };
};
