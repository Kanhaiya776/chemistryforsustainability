import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Constants from "acs_search_react/utils/Constants";


interface ItemsPerPageProps {
  setItemsPerPage: (itemsPerPage: number) => void,
  itemsPerPage: number,
}

function ItemsPerPage({ setItemsPerPage, itemsPerPage }: ItemsPerPageProps) {
  const handleItemClick = (element: number) => {
    setItemsPerPage(element);
  };

  const dropdownTitle = (
    <>
      Show <strong>{itemsPerPage}</strong>
    </>
  );

  return (
    <div>
      <Navbar>
        <Navbar.Toggle aria-controls="items-per-page" />
        <Navbar.Collapse id="items-per-page">
          <Nav>
            <NavDropdown id="items-per-page-filter" title={dropdownTitle}>
              {Constants.AVAILABLE_ELEMENTS_PER_PAGE.map((element, index) => (
                <NavDropdown.Item
                  key={index}
                  onClick={() => handleItemClick(element)}
                >
                  {element}
                </NavDropdown.Item>
              ))}
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
}

export default ItemsPerPage;
