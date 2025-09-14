import React, { useEffect } from 'react';

const KeyboardShortcuts = ({ shortcuts = {}, disabled = false }) => {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const ctrlKey = event.ctrlKey || event.metaKey;
      const shiftKey = event.shiftKey;
      const altKey = event.altKey;

      // Create key combination string
      const combination = [
        ctrlKey && 'ctrl',
        altKey && 'alt',
        shiftKey && 'shift',
        key
      ].filter(Boolean).join('+');

      // Find matching shortcut
      const shortcut = shortcuts[combination];
      
      if (shortcut) {
        event.preventDefault();
        shortcut.handler(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, disabled]);

  return null;
};

// Common keyboard shortcuts
export const commonShortcuts = {
  'ctrl+s': {
    description: 'Save',
    handler: (event) => {
      event.preventDefault();
      // Trigger save action
    }
  },
  'ctrl+n': {
    description: 'New',
    handler: (event) => {
      event.preventDefault();
      // Trigger new action
    }
  },
  'ctrl+f': {
    description: 'Search',
    handler: (event) => {
      event.preventDefault();
      // Focus search input
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]');
      if (searchInput) {
        searchInput.focus();
      }
    }
  },
  'ctrl+z': {
    description: 'Undo',
    handler: (event) => {
      event.preventDefault();
      // Trigger undo action
    }
  },
  'ctrl+y': {
    description: 'Redo',
    handler: (event) => {
      event.preventDefault();
      // Trigger redo action
    }
  },
  'escape': {
    description: 'Close/Cancel',
    handler: (event) => {
      // Close modals, dropdowns, etc.
      const modals = document.querySelectorAll('[role="dialog"]');
      if (modals.length > 0) {
        const lastModal = modals[modals.length - 1];
        const closeButton = lastModal.querySelector('[aria-label="Close"], [data-dismiss="modal"]');
        if (closeButton) {
          closeButton.click();
        }
      }
    }
  }
};

export default KeyboardShortcuts;