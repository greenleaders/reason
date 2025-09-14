import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileImage } from 'lucide-react';

const ExportButton = ({
  data = [],
  filename = 'export',
  format = 'csv', // csv, json, xlsx, pdf
  onExport,
  className = '',
  disabled = false
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const getIcon = () => {
    switch (format) {
      case 'json':
        return <FileText className="h-4 w-4" />;
      case 'xlsx':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'pdf':
        return <FileImage className="h-4 w-4" />;
      case 'csv':
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  const getMimeType = () => {
    switch (format) {
      case 'json':
        return 'application/json';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'pdf':
        return 'application/pdf';
      case 'csv':
      default:
        return 'text/csv';
    }
  };

  const convertToCSV = (data) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  const convertToJSON = (data) => {
    return JSON.stringify(data, null, 2);
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (disabled || isExporting) return;

    setIsExporting(true);

    try {
      if (onExport) {
        // Use custom export function
        await onExport(data, format);
      } else {
        // Use default export logic
        let content;
        
        switch (format) {
          case 'csv':
            content = convertToCSV(data);
            break;
          case 'json':
            content = convertToJSON(data);
            break;
          case 'xlsx':
            // For Excel export, you might want to use a library like xlsx
            console.warn('Excel export requires additional library. Falling back to CSV.');
            content = convertToCSV(data);
            break;
          case 'pdf':
            // For PDF export, you might want to use a library like jsPDF
            console.warn('PDF export requires additional library. Falling back to JSON.');
            content = convertToJSON(data);
            break;
          default:
            content = convertToCSV(data);
        }

        downloadFile(content, filename, getMimeType());
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || isExporting}
      className={`btn btn-outline ${className}`}
    >
      {isExporting ? (
        <>
          <div className="spinner"></div>
          Exporting...
        </>
      ) : (
        <>
          {getIcon()}
          Export {format.toUpperCase()}
        </>
      )}
    </button>
  );
};

export default ExportButton;
