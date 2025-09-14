import { useState, useEffect } from 'react';

// Custom hook for localStorage with React state
export const useLocalStorage = (key, initialValue) => {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

// Hook for managing theme preference
export const useTheme = () => {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return [theme, toggleTheme];
};

// Hook for managing user preferences
export const useUserPreferences = () => {
  const [preferences, setPreferences] = useLocalStorage('userPreferences', {
    notifications: true,
    emailUpdates: true,
    darkMode: false,
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD'
  });

  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetPreferences = () => {
    setPreferences({
      notifications: true,
      emailUpdates: true,
      darkMode: false,
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD'
    });
  };

  return [preferences, updatePreference, resetPreferences];
};

// Hook for managing form data with localStorage persistence
export const usePersistedForm = (key, initialValue) => {
  const [formData, setFormData] = useLocalStorage(key, initialValue);

  const updateFormData = (updates) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  };

  const resetFormData = () => {
    setFormData(initialValue);
  };

  const clearFormData = () => {
    window.localStorage.removeItem(key);
    setFormData(initialValue);
  };

  return [formData, updateFormData, resetFormData, clearFormData];
};

// Hook for managing recent searches
export const useRecentSearches = (maxItems = 10) => {
  const [searches, setSearches] = useLocalStorage('recentSearches', []);

  const addSearch = (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    setSearches(prev => {
      const filtered = prev.filter(item => item !== searchTerm);
      return [searchTerm, ...filtered].slice(0, maxItems);
    });
  };

  const clearSearches = () => {
    setSearches([]);
  };

  const removeSearch = (searchTerm) => {
    setSearches(prev => prev.filter(item => item !== searchTerm));
  };

  return [searches, addSearch, clearSearches, removeSearch];
};

// Hook for managing favorite items
export const useFavorites = (key = 'favorites') => {
  const [favorites, setFavorites] = useLocalStorage(key, []);

  const addToFavorites = (item) => {
    setFavorites(prev => {
      if (prev.some(fav => fav.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  const removeFromFavorites = (itemId) => {
    setFavorites(prev => prev.filter(item => item.id !== itemId));
  };

  const isFavorite = (itemId) => {
    return favorites.some(item => item.id === itemId);
  };

  const toggleFavorite = (item) => {
    if (isFavorite(item.id)) {
      removeFromFavorites(item.id);
    } else {
      addToFavorites(item);
    }
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    clearFavorites
  };
};

// Hook for managing pagination state
export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [pagination, setPagination] = useLocalStorage('pagination', {
    page: initialPage,
    limit: initialLimit,
    total: 0
  });

  const setPage = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const setLimit = (limit) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  const setTotal = (total) => {
    setPagination(prev => ({ ...prev, total }));
  };

  const nextPage = () => {
    const maxPage = Math.ceil(pagination.total / pagination.limit);
    if (pagination.page < maxPage) {
      setPage(pagination.page + 1);
    }
  };

  const prevPage = () => {
    if (pagination.page > 1) {
      setPage(pagination.page - 1);
    }
  };

  const goToPage = (page) => {
    const maxPage = Math.ceil(pagination.total / pagination.limit);
    const targetPage = Math.max(1, Math.min(page, maxPage));
    setPage(targetPage);
  };

  const resetPagination = () => {
    setPagination({
      page: initialPage,
      limit: initialLimit,
      total: 0
    });
  };

  return {
    ...pagination,
    setPage,
    setLimit,
    setTotal,
    nextPage,
    prevPage,
    goToPage,
    resetPagination,
    hasNextPage: pagination.page < Math.ceil(pagination.total / pagination.limit),
    hasPrevPage: pagination.page > 1,
    totalPages: Math.ceil(pagination.total / pagination.limit)
  };
};

// Hook for managing filters
export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useLocalStorage('filters', initialFilters);

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const removeFilter = (key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => 
      value !== null && value !== undefined && value !== '' && 
      (Array.isArray(value) ? value.length > 0 : true)
    );
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => 
      value !== null && value !== undefined && value !== '' && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length;
  };

  return {
    filters,
    updateFilter,
    removeFilter,
    clearFilters,
    hasActiveFilters,
    getActiveFilterCount
  };
};
