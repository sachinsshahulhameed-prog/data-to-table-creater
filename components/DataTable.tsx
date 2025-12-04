import React, { useState } from 'react';
import { FormField, DataRow } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { SyncIcon } from './icons/SyncIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';

interface DataTableProps {
  fields: FormField[];
  data: DataRow[];
  tableName: string;
  isGoogleLoggedIn: boolean;
  onSyncToSheet: () => Promise<void>;
  sheetUrl?: string;
}

const DataTable: React.FC<DataTableProps> = ({ fields, data, tableName, isGoogleLoggedIn, onSyncToSheet, sheetUrl }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  
  const handleDownload = () => {
    if (data.length === 0) {
      alert("No data to download.");
      return;
    }

    const headers = fields.map(field => `"${field.name.replace(/"/g, '""')}"`).join(',');
    
    const rows = data.map(row => 
      fields.map(field => {
        const value = row[field.name] || '';
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      }).join(',')
    );

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    const filename = `${tableName.replace(/\s+/g, '_')}_data.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await onSyncToSheet();
    setIsSyncing(false);
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Collected Data</h2>
            {sheetUrl && (
                <a 
                    href={sheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:underline"
                >
                    <ExternalLinkIcon />
                    Open Sheet
                </a>
            )}
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={handleSync}
                className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-800"
                disabled={!isGoogleLoggedIn || data.length === 0 || isSyncing}
                title={!isGoogleLoggedIn ? "Connect to Google to enable sync" : ""}
            >
                <SyncIcon spinning={isSyncing} />
                {isSyncing ? "Syncing..." : "Sync to Sheet"}
            </button>
            <button
            onClick={handleDownload}
            className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
            disabled={data.length === 0}
            >
            <DownloadIcon />
            Download CSV
            </button>
        </div>
      </div>

      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              {fields.map(field => (
                <th key={field.id} scope="col" className="py-3 px-6">
                  {field.name}
                </th>
              ))}
              {fields.length === 0 && <th scope="col" className="py-3 px-6">No fields defined</th>}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, index) => (
                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  {fields.map(field => (
                    <td key={`${index}-${field.id}`} className="py-4 px-6 text-gray-900 dark:text-white whitespace-nowrap">
                      {row[field.name] || ''}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={fields.length || 1} className="text-center py-10 text-gray-500 dark:text-gray-400">
                  No data entries yet. Go to the Form & Data Entry tab to add some.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;