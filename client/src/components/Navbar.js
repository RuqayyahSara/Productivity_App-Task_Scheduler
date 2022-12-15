import React from "react";
import {
    CNavbar,
    CContainer,
    CNavbarToggler,
    COffcanvas,
    COffcanvasHeader,
    CCloseButton,
    COffcanvasBody,
    CNavbarNav,
    CNavItem,
    CNavLink,

} from "@coreui/react";
import { useState } from "react";
function Navbar() {
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
                            <p className="fs-3  text-decoration-none">
                                <span role="img" aria-label="alarm">
                                    ⏰
                                </span>
                                Tasky App
                            </p>

                            <CCloseButton
                                className="text-reset"
                                onClick={() => setVisible(false)}
                            />
                        </COffcanvasHeader>
                        <COffcanvasBody>
                            <CNavbarNav>
                                <CNavItem>
                                    <CNavLink href="/" active>
                                        <p className="fs-4  text-decoration-none">
                                            <span role="img" aria-label="home">
                                                🏠
                                            </span>
                                            Home
                                        </p>
                                    </CNavLink>
                                </CNavItem>

                                <CNavItem>
                                    <CNavLink href="/register">
                                        <p className="fs-4  text-decoration-none">
                                            <span role="img" aria-label="lock">
                                                📝
                                            </span>
                                            Register
                                        </p>
                                    </CNavLink>
                                </CNavItem>
                                <CNavItem>
                                    <CNavLink href="/login">
                                        <p className="fs-4  text-decoration-none">
                                            <span role="img" aria-label="paper">
                                                🔐
                                            </span>
                                            Login
                                        </p>
                                    </CNavLink>
                                </CNavItem>
                                {/* <CNavItem>
                  <CNavLink href="/help">
                    <p className="fs-4  text-decoration-none">
                      <span role="img" aria-label="help">
                        💁
                      </span>
                      Help
                    </p>
                  </CNavLink>
                </CNavItem> */}
                            </CNavbarNav>
                        </COffcanvasBody>
                    </COffcanvas>
                </CContainer>
            </CNavbar>
        </>
    );
}

export default Navbar;