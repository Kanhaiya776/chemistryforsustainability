import React, { useState, useEffect, useRef } from "react";
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import DataList from "acs_search_react/component/DataList";
import SearchBar from "acs_search_react/component/SearchBar";
import Constants from "acs_search_react/utils/Constants";
import RestHelper from "acs_search_react/services/RestHelper";
import { ApiResponse } from "acs_search_react/interfaces/DataInterface";

interface ControlledTabsProps { }

interface CustomCheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ id, checked, onChange, label }) => {
  const handleCheckboxChange = () => {
    onChange(!checked);
  };

  return (
    <Form.Check>
      <Form.Check.Input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={handleCheckboxChange}
      />
      <Form.Check.Label htmlFor={id} onClick={handleCheckboxChange}>
        {label}
      </Form.Check.Label>
    </Form.Check>
  );
};

function ControlledTabs(props: ControlledTabsProps) {

  const [selectedTabs, setSelectedTabs] = useState<string[]>(() => Object.keys(Constants.TAB_LABELS));
  const [otherData, setOtherData] = useState<ApiResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sortingOption, setSortingOption] = useState<string>('most_recent');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isSearchInitialized, setIsSearchInitialized] = useState(false);

  useEffect(() => {
    const fetchCombinedData = async () => {
      try {
        setIsLoading(true);
        const combinedData = await RestHelper.getCombinedData(searchTerm, currentPage - 1 >= 0 ? currentPage - 1 : currentPage, selectedTabs, 15, Constants.SORTING_OPTIONS[sortingOption].sortBy, Constants.SORTING_OPTIONS[sortingOption].sortOrder);
        setOtherData((prevData) => {
          if (prevData && prevData.rows && combinedData && combinedData.rows) {
            // Concatenate the new rows to the existing state data
            return {
              ...prevData,
              rows: [...prevData.rows, ...combinedData.rows],
            };
          }

          if (prevData) {
            return prevData;
          } else {
            return combinedData;
          }
        });
      } catch (error) {
        console.error("Error fetching combined data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if(isSearchInitialized) {
      fetchCombinedData();
    }
  }, [isSearchInitialized, searchTerm, currentPage, selectedTabs, sortingOption]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    window.addEventListener('mousedown', handleOutsideClick);

    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleSortingOption = (option: string) => {
    clearDataMap(true);
    setSortingOption(option);
  };

  const renderSortingDropdown = () => {
    const sortingOptions: Record<string, string> = {
      'most_recent': 'Newest',
      'least_recent': 'Oldest',
      'A_Z': 'A-Z',
      'Z_A': 'Z-A',
    };

    return (
      <Dropdown>
        <Dropdown.Toggle variant="dropdown-primary" id="dropdown-sorting">
          Sort by
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {Object.keys(sortingOptions).map(optionKey => (
            <Dropdown.Item
              key={optionKey}
              onClick={() => handleSortingOption(optionKey)}
              active={sortingOption === optionKey}
            >
              {sortingOptions[optionKey]}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  const handleToggleDropdown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement && e.target.id === 'dropdown-tabs') {
      setShowDropdown(!showDropdown);
    }
  };

  const renderDataList = (data: ApiResponse | null, label: string, currentPage: number, setCurrentPageFunc: (page: number) => void, shouldLoadMore: boolean = false, isDataLoading: boolean = false, isAcs: boolean = false) => {
    const total_pages = data?.pager?.total_pages ?? 1000


    return (
      <div key={label}>
        {data ? (
          <DataList
            data={data.rows}
            totalRows={data.total_rows ?? 99999}
            currentPage={currentPage}
            setCurrentPage={setCurrentPageFunc}
            tabLabel={label}
            shouldLoadMore={total_pages >= currentPage + 1}
          />
        ) : <div></div>}
        {isDataLoading && (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}
      </div>
    );
  };

  const handleTabSelection = (tabKey: string) => {
    clearDataMap(true);
    setSelectedTabs((prevSelectedTabs: string[]) => {
      if (prevSelectedTabs.includes(tabKey)) {
        return prevSelectedTabs.filter(selectedTab => selectedTab !== tabKey); // Remove the tabKey if already selected
      } else {
        return [...prevSelectedTabs, tabKey]; // Add the tabKey if not already selected
      }
    });
  };


  const renderTabsAsDropdown = () => {
    return (
      <div onClick={handleToggleDropdown}>
        <Dropdown show={showDropdown}>
          <Dropdown.Toggle variant="dropdown-primary" id="dropdown-tabs">
            Content Type
          </Dropdown.Toggle>
          <Dropdown.Menu id="dropdown-menu">
            {Object.keys(Constants.TAB_LABELS).map(tabKey => (
              <Dropdown.Item key={tabKey}>
                <CustomCheckbox
                  id={`checkbox-${tabKey}`}
                  checked={selectedTabs.includes(tabKey)} // Check if the tabKey is in selectedTabs
                  onChange={() => handleTabSelection(tabKey)} // Toggle selection for the tabKey
                  label={Constants.TAB_LABELS[tabKey]} // Use the label from Constants.TAB_LABELS
                />
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  };

  const clearDataMap = (onlyOther: boolean = false) => {
    if (onlyOther) {
      setOtherData(null);
      setCurrentPage(1);
      //@todo clear cached data
    } else {
      setOtherData(null);
      // setAcsPubData(null);
      setCurrentPage(1);
      // setCurrentAcsPage(1);
      // RestHelper.clearAcsPubDataCache();
    }
  };

  const handleSearch = (newSearchTerm: string | null) => {
    if (newSearchTerm === searchTerm) {
      return;
    }
    if (newSearchTerm !== null) {
      clearDataMap();
      setSearchTerm(newSearchTerm);
    }
  };

  const inializedSearch = () => {
    setIsSearchInitialized(true);
  }

  return (
    <div>
      <SearchBar onSearch={handleSearch} inializedSearch={inializedSearch} />
      <div className={"app-wrapper-content"}>
        <div className={"dropdowns-wrapper"}>
          <div ref={dropdownRef}>
            {renderTabsAsDropdown()}
          </div>
          {renderSortingDropdown()}
        </div>
        <div>
          <h1 style={{ marginBottom: '10px' }}>Search Results</h1>
          {renderDataList(otherData, 'Search Results', currentPage, setCurrentPage, true, isLoading, false)}
        </div>
      </div>
    </div>
  );
}

export default ControlledTabs;
