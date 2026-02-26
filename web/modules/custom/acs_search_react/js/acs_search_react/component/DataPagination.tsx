import Pagination from 'react-bootstrap/Pagination';

interface PaginationProps {
  currentPage: number;
  numberOfPages: number;
  handlePageChange: (page: number) => void;
}

function DataPagination({ currentPage, numberOfPages, handlePageChange }: PaginationProps) {
  const maxPagesToShow = 5;

  let startPage = Math.max(currentPage - Math.floor(maxPagesToShow / 2), 1);
  let endPage = Math.min(startPage + maxPagesToShow - 1, numberOfPages);

  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(endPage - maxPagesToShow + 1, 1);
  }

  const items = [];
  for (let number = startPage; number <= endPage; number++) {
    items.push(
      <Pagination.Item
        key={number}
        active={number === (currentPage)}
        onClick={() => {
          handlePageChange(number);
        }}
      >
        {number}
      </Pagination.Item>
    );
  }

  return (
    <div>
      <Pagination size="sm">
        <Pagination.Prev
          onClick={() => {
            if (currentPage > 1) {
              handlePageChange(currentPage - 1);
            }
          }}
        />
        {items}
        <Pagination.Next
          onClick={() => {
            if (currentPage < numberOfPages) {
              handlePageChange(currentPage + 1);
            }
          }}
        />
      </Pagination>
    </div>
  );
}

export default DataPagination;
