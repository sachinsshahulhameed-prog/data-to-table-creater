import React, { useState } from 'react';
import { Table } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';

interface TableManagerProps {
  tables: Table[];
  activeTableId: number;
  onSelectTable: (id: number) => void;
  onAddTable: () => void;
  onRenameTable: (id: number, newName: string) => void;
  onRemoveTable: (id: number) => void;
}

const TableManager: React.FC<TableManagerProps> = ({
  tables,
  activeTableId,
  onSelectTable,
  onAddTable,
  onRenameTable,
  onRemoveTable,
}) => {
    const [editingTableId, setEditingTableId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');

    const handleStartEdit = (table: Table) => {
        setEditingTableId(table.id);
        setEditingName(table.name);
    }

    const handleCancelEdit = () => {
        setEditingTableId(null);
        setEditingName('');
    }

    const handleSaveRename = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTableId) {
            onRenameTable(editingTableId, editingName);
            handleCancelEdit();
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            handleCancelEdit();
        }
    }

    const confirmRemove = (tableId: number, tableName: string) => {
        if (window.confirm(`Are you sure you want to delete the table "${tableName}" and all its data? This action cannot be undone.`)) {
            onRemoveTable(tableId);
        }
    }


  return (
    <aside className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
        My Tables
      </h2>
      <nav className="flex-grow space-y-1.5 overflow-y-auto -mr-2 pr-2">
        {tables.map((table) => (
          <div key={table.id} className="group flex items-center">
            {editingTableId === table.id ? (
                <form onSubmit={handleSaveRename} className="w-full">
                    <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={handleSaveRename}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="w-full bg-gray-100 dark:bg-gray-700 border border-blue-500 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 transition"
                    />
                </form>
            ) : (
                <button
                    onClick={() => onSelectTable(table.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex justify-between items-center ${
                    activeTableId === table.id
                        ? 'bg-blue-100 dark:bg-gray-900 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    <span className="truncate" title={table.name}>{table.name}</span>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                       <button
                         onClick={(e) => { e.stopPropagation(); handleStartEdit(table); }}
                         className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 p-1 rounded-full"
                         aria-label={`Rename ${table.name}`}
                       >
                           <EditIcon />
                       </button>
                        {tables.length > 1 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); confirmRemove(table.id, table.name); }}
                                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 p-1 rounded-full"
                                aria-label={`Remove ${table.name}`}
                            >
                                <TrashIcon />
                            </button>
                        )}
                    </div>
                </button>
            )}
            </div>
        ))}
      </nav>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onAddTable}
          className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center justify-center gap-2 transition dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
        >
          <PlusIcon />
          New Table
        </button>
      </div>
    </aside>
  );
};

export default TableManager;
