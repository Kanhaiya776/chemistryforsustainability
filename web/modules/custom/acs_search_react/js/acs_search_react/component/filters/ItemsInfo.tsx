import React from 'react';

interface ItemsInfoProps {
  totalRows: number;
  itemsPerPage: number;
  currentPage: number;
}

function ItemsInfo({ totalRows, itemsPerPage, currentPage }: ItemsInfoProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalRows);

  return (
    <div>
      Results {startItem} - {endItem} of {totalRows}
    </div>
  );
}

export default ItemsInfo;
