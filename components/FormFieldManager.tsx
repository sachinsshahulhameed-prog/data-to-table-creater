
import React, { useState } from 'react';
import { FormField } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface FormFieldManagerProps {
  fields: FormField[];
  addField: (name: string) => void;
  removeField: (id: number) => void;
}

const FormFieldManager: React.FC<FormFieldManagerProps> = ({ fields, addField, removeField }) => {
  const [newFieldName, setNewFieldName] = useState('');

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    addField(newFieldName.trim());
    setNewFieldName('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg h-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Manage Form Fields</h2>
      <form onSubmit={handleAddField} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newFieldName}
          onChange={(e) => setNewFieldName(e.target.value)}
          placeholder="New field name"
          className="flex-grow bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition"
        />
        <button
          type="submit"
          className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center gap-2 transition dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
        >
          <PlusIcon />
          Add
        </button>
      </form>

      <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">Current Fields</h3>
      <div className="space-y-2">
        {fields.length > 0 ? (
          fields.map((field) => (
            <div
              key={field.id}
              className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-md"
            >
              <span className="text-gray-800 dark:text-gray-200">{field.name}</span>
              <button
                onClick={() => removeField(field.id)}
                className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition"
                aria-label={`Remove ${field.name} field`}
              >
                <TrashIcon />
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No fields defined yet.</p>
        )}
      </div>
    </div>
  );
};

export default FormFieldManager;
