import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { ChevronDown } from 'lucide-react';

interface CategoryDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CategoryDropdown({ value, onChange }: CategoryDropdownProps) {
  const { categories, loadCategories } = useStore();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'ADD_NEW') {
      setIsAddingNew(true);
      onChange('');
    } else {
      setIsAddingNew(false);
      onChange(val);
    }
  };

  const handleNewCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewCategory(val);
    onChange(val);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        {!isAddingNew ? (
          <select
            className="w-full appearance-none bg-white border border-slate-300 rounded-md py-2 pl-3 pr-10 focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer text-black font-medium"
            value={value}
            onChange={handleSelect}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value="ADD_NEW" className="text-primary font-semibold font-bold">
              + Add New Category...
            </option>
          </select>
        ) : (
          <div className="flex gap-2">
            <input
              autoFocus
              type="text"
              placeholder="Enter new category name..."
              className="flex-1 border border-primary rounded-md py-2 px-3 focus:ring-2 focus:ring-primary outline-none animate-in slide-in-from-left-2 duration-200"
              value={newCategory}
              onChange={handleNewCategoryChange}
            />
            <button
              type="button"
              onClick={() => {
                setIsAddingNew(false);
                setNewCategory('');
                onChange('');
              }}
              className="px-3 py-2 bg-slate-100 text-slate-500 rounded-md hover:bg-slate-200 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        )}
        {!isAddingNew && (
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
        )}
      </div>
    </div>
  );
}
