import {
  CAvatar,
  CCloseButton,
  CContainer,
  CDropdown,
  CDropdownDivider,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CNavbar,
  CNavbarNav,
  CNavbarToggler,
  CNavItem,
  CNavLink,
  COffcanvas,
  COffcanvasBody,
  COffcanvasHeader,
  COffcanvasTitle,
} from "@coreui/react";
import { Link } from "react-router-dom";
import { cilAccountLogout, cilTask, cilUser, cilWarning } from "@coreui/icons";
import CIcon from "@coreui/icons-react";

import React, { useState, useContext } from "react";
import logo from "../../Assets/Common/clock.png";
import AuthContext from "../../contexts/Auth/AuthContext";
function TeamNavbar() {
  let authContext = useContext(AuthContext)
  const { logout } = authContext

  const [visible, setVisible] = useState(false);
  return (
    <>
      <CNavbar colorScheme="light" className="bg-light">
        <CContainer fluid>
          <CNavbarToggler
            aria-controls="offcanvasNavbar"
            aria-label="Toggle navigation"
            onClick={() => setVisible(!visible)}
          />
          <COffcanvas
            id="offcanvasNavbar"
            placement="start"
            portal={false}
            visible={visible}
          >
            <COffcanvasHeader>
              <COffcanvasTitle>
                <p className="fs-3  text-decoration-none">
                  <span role="img" aria-label="alarm">
                    ⏰
                  </span>
                  Tasky App
                </p>
              </COffcanvasTitle>
              <CCloseButton
                className="text-reset"
                onClick={() => setVisible(false)}
              />
            </COffcanvasHeader>
            <COffcanvasBody>
              <CNavbarNav>
                <CNavItem>
                  <CNavLink href="/team" active>
                    <p className="fs-4  text-decoration-none">
                      <span role="img" aria-label="home">
                        🏠
                      </span>
                      Home
                    </p>
                  </CNavLink>
                </CNavItem>

                <CNavItem>
                  <CNavLink href="/resetpassword/team">
                    <p className="fs-4  text-decoration-none">
                      <span role="img" aria-label="help">
                        📑
                      </span>
                      Reset Password
                    </p>
                  </CNavLink>
                </CNavItem>

                <CNavItem>
                  <CNavLink href="/policy">
                    <p className="fs-4  text-decoration-none">
                      <span role="img" aria-label="paper">
                        📰
                      </span>
                      Privacy Policy
                    </p>
                  </CNavLink>
                </CNavItem>

                <CNavItem>
                  <CNavLink href="/help">
                    <p className="fs-4  text-decoration-none">
                      <span role="img" aria-label="help">
                        💁
                      </span>
                      Help
                    </p>
                  </CNavLink>
                </CNavItem>
              </CNavbarNav>
            </COffcanvasBody>
          </COffcanvas>

          <CDropdown>
            <CDropdownToggle color="white">
              <CAvatar src={logo} color="white" size="lg"></CAvatar>
            </CDropdownToggle>
            <CDropdownMenu>
              <Link to="/user/profile/team" style={{ textDecoration: "none" }}>
                <CDropdownItem component="button">
                  {" "}
                  <CIcon icon={cilUser} /> Your Profile
                </CDropdownItem>
              </Link>
              <Link to="/team" style={{ textDecoration: "none" }}>
                <CDropdownItem component="button">
                  {" "}
                  <CIcon icon={cilTask} /> My Dashboard
                </CDropdownItem>
              </Link>
              <CDropdownItem component="button">
                {" "}
                <CIcon icon={cilWarning} /> Help
              </CDropdownItem>
              <CDropdownItem onClick={logout} component="button">
                <CIcon icon={cilAccountLogout} /> Logout
              </CDropdownItem>
              <CDropdownDivider />
            </CDropdownMenu>
          </CDropdown>
        </CContainer>
      </CNavbar>
    </>
  );
}

export default TeamNavbar;