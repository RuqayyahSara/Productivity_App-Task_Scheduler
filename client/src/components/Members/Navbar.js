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

import AuthContext from "../../contexts/Auth/AuthContext";
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";

import logo from "../../Assets/Common/clock.png";
import { cilAccountLogout, cilTask, cilUser, cilWarning } from "@coreui/icons";
import CIcon from "@coreui/icons-react";

function Navbar({ role }) {
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
            onHide={() => setVisible(false)}
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
                  <CNavLink href={role === "member" ? `/member/${role}` : `/${role}`} >
                    <p className="fs-4  text-decoration-none">
                      <span role="img" aria-label="home">
                        🏠
                      </span>
                      Home
                    </p>
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink href={`/resetpassword/${role}`}>
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

              <Link to={`/user/profile/${role}`} style={{ textDecoration: "none" }}>
                <CDropdownItem component="button">
                  {" "}
                  <CIcon icon={cilUser} /> Your Profile
                </CDropdownItem>
              </Link>

              <Link to={role === "member" ? `/member/${role}` : `/${role}`} style={{ textDecoration: "none" }}>
                <CDropdownItem component="button">
                  {" "}
                  <CIcon icon={cilTask} /> Your Dashboard
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

export default Navbar;