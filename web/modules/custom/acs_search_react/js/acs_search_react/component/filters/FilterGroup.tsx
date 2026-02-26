import ItemsPerPage from "acs_search_react/component/filters/ItemsPerPage";
import ItemsInfo from "acs_search_react/component/filters/ItemsInfo";

interface FilterGroupProps {
  isDataLoaded: boolean,
  setItemsPerPage: (itemsPerPage: number) => void,
  itemsPerPage: number,
  isDataLoading: boolean,
  totalRows: number,
  currentPage: number,
}

function FilterGroup({ isDataLoaded, setItemsPerPage, itemsPerPage, isDataLoading, totalRows, currentPage }: FilterGroupProps) {
  if (!isDataLoaded && !isDataLoading) {
    return null
  }
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <ItemsInfo totalRows={totalRows} itemsPerPage={itemsPerPage} currentPage={currentPage} />
      <ItemsPerPage setItemsPerPage={setItemsPerPage} itemsPerPage={itemsPerPage} />
    </div>
  )
}

export default FilterGroup;
