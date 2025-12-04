
import React, { useState, useEffect } from 'react';
import { FormField, DataRow } from '../types';

interface DataEntryFormProps {
  fields: FormField[];
  onAddData: (data: DataRow) => void;
}

const DataEntryForm: React.FC<DataEntryFormProps> = ({ fields, onAddData }) => {
  const [formData, setFormData] = useState<DataRow>({});

  useEffect(() => {
    // Reset form data if fields change
    const initialData = fields.reduce((acc, field) => {
      acc[field.name] = '';
      return acc;
    }, {} as DataRow);
    setFormData(initialData);
  }, [fields]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddData(formData);
    // Clear form after submission
    const clearedData = fields.reduce((acc, field) => {
        acc[field.name] = '';
        return acc;
    }, {} as DataRow);
    setFormData(clearedData);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg h-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Enter Data</h2>
      {fields.length > 0 ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(field => (
            <div key={field.id}>
              <label htmlFor={field.name} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                {field.name}
              </label>
              <input
                type="text"
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition"
                required
              />
            </div>
          ))}
          <button
            type="submit"
            className="w-full text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-800"
          >
            Add Data Entry
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-center h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">Add some fields to start entering data.</p>
        </div>
      )}
    </div>
  );
};

export default DataEntryForm;
