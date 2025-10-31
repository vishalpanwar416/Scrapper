import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from './ui';

export const Header = ({ onSearch, placeholder = 'Search...' }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
      <div className="md:ml-64 px-4 md:px-8 py-4 flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleSearch}
            icon={Search}
            size="md"
          />
        </div>
      </div>
    </div>
  );
};
