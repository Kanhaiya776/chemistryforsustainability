import React, { useState, KeyboardEvent, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  inializedSearch: () => void
}

function SearchBar({ onSearch, inializedSearch }: SearchBarProps): JSX.Element {
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  //@todo fix initila loading
  useEffect(() => {
    window.onload = () => {
      const params = new URLSearchParams(window.location.search);
      const searchParams = params.get('q');
      if (searchParams) {
        setSearchTerm(searchParams);
        onSearch(searchParams);
      }

      inializedSearch()
    };
  }, []);

  const handleSearch = (): void => {
    onSearch(searchTerm || '');
  };


  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-bar">
      <div className="background-image"><span className={"scroll-icon fade-element"}></span></div>
      <span className="display-medium title-page">Explore all our content</span>
      <div className="input-group rounded">
        <input
          type="text"
          className="form-control"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          className="icon-search"
          type="button"
          onClick={handleSearch}
        >
        </button>
      </div>
    </div>
  );
}

export default SearchBar;
