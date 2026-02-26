import React from 'react';
import { Data } from 'acs_search_react/interfaces/DataInterface';
import Constants from 'acs_search_react/utils/Constants';
import DataPagination from 'acs_search_react/component/DataPagination';

interface DataListProps {
  data: Data['rows'];
  totalRows: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  tabLabel: string;
  shouldLoadMore: boolean;
}

function DataList({ data, totalRows, currentPage, setCurrentPage, tabLabel, shouldLoadMore = false }: DataListProps) {

  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div className={'no-results'}>{"No results"}</div>; // Return null or some default message/component when data is empty
  }

  const handleLoadMore = () => {
    setCurrentPage(currentPage + 1); // Update current page to load more data
  };
  return (
    <div className="data-list-container">
      <div className="data-list-grid">
        {data.map((item: Data['rows'][0], index: number) => (
          <div key={index} className="data-item">
            {item.type ? <span className={"tab-label"}>{item.type ? Constants.TAB_LABELS[item.type] : ''}</span> : null}
            <h2>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.title}
              </a>
            </h2>
            <div className="description-wrapper">
              <p>
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '20px', marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
        {shouldLoadMore ?
          <button className={"btn btn-primary btn-primary-outlined"} onClick={handleLoadMore}>Load More</button>
          :
          <button className={"btn btn-secondary"} disabled>No more results</button>
        }
      </div>
    </div>
  );
}

export default DataList;
