import React, { useEffect, useContext } from "react";
import {
    CAvatar,
    CProgress,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow
} from "@coreui/react";

import { cilArrowBottom, cilArrowTop } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { CCol, CContainer, CRow, CWidgetStatsA } from "@coreui/react";
import { CChartBar, CChartLine } from "@coreui/react-chartjs";
import { cibCcMastercard, cilPeople } from "@coreui/icons";

import AdminNavbar from "./Navbar";
import Loading from "../Loading";
import avatar1 from "../../Assets/User/Avatars/1.jpg";
import AuthContext from "../../contexts/Auth/AuthContext"
import UtilsContext from "../../contexts/Utils/UtilsContext";
import AdminContext from "../../contexts/Admin/AdminContext";

function UserAnalytics() {
    const utilsContext = useContext(UtilsContext);
    const authContext = useContext(AuthContext);
    const adminContext = useContext(AdminContext);

    const { analytics, top10, fetchAnalytics, fetchTop10Emails } = adminContext
    const { loading, countries, fetchFlags, } = utilsContext;
    const { authUser } = authContext

    useEffect(() => {
        authUser("admin")
        fetchAnalytics('user');
        fetchTop10Emails('user');
        fetchFlags();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading)
        return <Loading />
    else {
        return (
            <>
                <AdminNavbar />
                <CContainer style={{ marginTop: "5%" }}>
                    <CRow>
                        <CCol
                            xs={{ cols: "auto", row: "auto" }}
                            sm={{ cols: "auto", row: "auto" }}
                            md={{ cols: "auto", row: "auto" }}
                        >
                            <h1 className="display-6">
                                <span role="img" aria-label="padlock icon">
                                    {" "}
                                    📝
                                </span>{" "}
                                User Analytics{" "}
                            </h1>

                            <CRow><CRow>
                                <CCol sm={6}><CWidgetStatsA
                                    className="mb-4"
                                    color="primary"
                                    value={
                                        <>
                                            {analytics.users && analytics.users.reduce((a, b) => a + b, 0)}
                                            <span className="fs-6 fw-normal">
                                                ( {analytics.users && ((analytics.users[analytics.users.length - 1] - analytics.users[0]) / analytics.users[0] * 100).toFixed(1)} %
                                                {analytics.users && ((analytics.users[analytics.users.length - 1] - analytics.users[0]) / analytics.users[0] * 100) < 0 ?
                                                    (<CIcon icon={cilArrowBottom} />) : (<CIcon icon={cilArrowTop} />)})
                                            </span>
                                        </>
                                    }
                                    title="Users"
                                    chart={
                                        <CChartLine
                                            className="mt-3 mx-3"
                                            style={{ height: "70px" }}
                                            data={{
                                                labels: analytics.months,
                                                datasets: [
                                                    {
                                                        label: "My First dataset",
                                                        backgroundColor: "transparent",
                                                        borderColor: "rgba(255,255,255,.55)",
                                                        pointBackgroundColor: "#321fdb",
                                                        data: analytics.users,
                                                    },
                                                ],
                                            }}
                                            options={{
                                                plugins: {
                                                    legend: {
                                                        display: false,
                                                    },
                                                },
                                                maintainAspectRatio: false,
                                                scales: {
                                                    x: {
                                                        grid: {
                                                            display: false,
                                                            drawBorder: false,
                                                        },
                                                        ticks: {
                                                            display: false,
                                                        },
                                                    },
                                                    y: {
                                                        min: analytics.users && Math.min(...analytics.users),
                                                        max: analytics.users && Math.max(...analytics.users),
                                                        display: false,
                                                        grid: {
                                                            display: false,
                                                        },
                                                        ticks: {
                                                            display: false,
                                                        },
                                                    },
                                                },
                                                elements: {
                                                    line: {
                                                        borderWidth: 1,
                                                        tension: 0.4,
                                                    },
                                                    point: {
                                                        radius: 4,
                                                        hitRadius: 10,
                                                        hoverRadius: 4,
                                                    },
                                                },
                                            }}
                                        />
                                    }
                                />
                                </CCol>
                                <CCol sm={6}>
                                    <CWidgetStatsA
                                        className="mb-4"
                                        color="info"
                                        value={
                                            <>
                                                {analytics.revenue && analytics.revenue.reduce((a, b) => a + b, 0) / 20} USD
                                                <span className="fs-6 fw-normal">
                                                    ({analytics.revenue && ((analytics.revenue[analytics.revenue.length - 1] - analytics.revenue[0]) / analytics.revenue[0] * 100).toFixed(1)}% {analytics.revenue && ((analytics.revenue[analytics.revenue.length - 1] - analytics.revenue[0]) / analytics.revenue[0] * 100) < 0 ? (<CIcon icon={cilArrowBottom} />) : (<CIcon icon={cilArrowTop} />)})
                                                </span>
                                            </>
                                        }
                                        title="Revenue"
                                        chart={
                                            <CChartLine
                                                className="mt-3 mx-3"
                                                style={{ height: "70px" }}
                                                data={{
                                                    labels: analytics.months,
                                                    datasets: [
                                                        {
                                                            label: "My First dataset",
                                                            backgroundColor: "transparent",
                                                            borderColor: "rgba(255,255,255,.55)",
                                                            pointBackgroundColor: "#39f",
                                                            data: analytics.revenue,
                                                        },
                                                    ],
                                                }}
                                                options={{
                                                    plugins: {
                                                        legend: {
                                                            display: false,
                                                        },
                                                    },
                                                    maintainAspectRatio: false,
                                                    scales: {
                                                        x: {
                                                            grid: {
                                                                display: false,
                                                                drawBorder: false,
                                                            },
                                                            ticks: {
                                                                display: false,
                                                            },
                                                        },
                                                        y: {
                                                            min: analytics.revenue && Math.min(...analytics.revenue),
                                                            max: analytics.revenue && Math.max(...analytics.revenue),
                                                            display: false,
                                                            grid: {
                                                                display: false,
                                                            },
                                                            ticks: {
                                                                display: false,
                                                            },
                                                        },
                                                    },
                                                    elements: {
                                                        line: {
                                                            borderWidth: 1,
                                                        },
                                                        point: {
                                                            radius: 4,
                                                            hitRadius: 10,
                                                            hoverRadius: 4,
                                                        },
                                                    },
                                                }}
                                            />
                                        }
                                    />
                                </CCol>
                                <CCol sm={6}>
                                    <CWidgetStatsA
                                        className="mb-4"
                                        color="warning"
                                        value={
                                            <>
                                                {analytics.emails && analytics.emails.reduce((a, b) => a + b, 0)}
                                                <span className="fs-6 fw-normal">
                                                    ({analytics.emails && (((analytics.emails[analytics.emails.length - 1] - analytics.emails[0]) / analytics.emails[0]) * 100).toFixed(1)}% {analytics.emails && ((analytics.emails[analytics.emails.length - 1] - analytics.emails[0]) / analytics.emails[0] * 100) < 0 ? (<CIcon icon={cilArrowBottom} />) : (<CIcon icon={cilArrowTop} />)})
                                                </span>
                                            </>
                                        }
                                        title="Emails Sent"
                                        chart={
                                            <CChartLine
                                                className="mt-3"
                                                style={{ height: "70px" }}
                                                data={{
                                                    labels: analytics.months,
                                                    datasets: [
                                                        {
                                                            label: "My First dataset",
                                                            backgroundColor: "rgba(255,255,255,.2)",
                                                            borderColor: "rgba(255,255,255,.55)",
                                                            data: analytics.emails,
                                                            fill: true,
                                                        },
                                                    ],
                                                }}
                                                options={{
                                                    plugins: {
                                                        legend: {
                                                            display: false,
                                                        },
                                                    },
                                                    maintainAspectRatio: false,
                                                    scales: {
                                                        x: {
                                                            display: false,
                                                        },
                                                        y: {
                                                            min: analytics.emails && Math.min(...analytics.emails),
                                                            max: analytics.emails && Math.max(...analytics.emails),
                                                            display: false,
                                                        },
                                                    },
                                                    elements: {
                                                        line: {
                                                            borderWidth: 2,
                                                            tension: 0.4,
                                                        },
                                                        point: {
                                                            radius: 0,
                                                            hitRadius: 10,
                                                            hoverRadius: 4,
                                                        },
                                                    },
                                                }}
                                            />
                                        }
                                    />
                                </CCol>
                                <CCol sm={6}>
                                    <CWidgetStatsA
                                        className="mb-4"
                                        color="danger"
                                        value={
                                            <>
                                                {analytics.sms && analytics.sms.reduce((a, b) => a + b, 0)}
                                                <span className="fs-6 fw-normal">
                                                    ({analytics.sms && ((analytics.sms[analytics.sms.length - 1] - analytics.sms[0]) / analytics.sms[0] * 100).toFixed(1)}% {analytics.sms && ((analytics.sms[analytics.sms.length - 1] - analytics.sms[0]) / analytics.sms[0] * 100) < 0 ? (<CIcon icon={cilArrowBottom} />) : (<CIcon icon={cilArrowTop} />)})
                                                </span>
                                            </>
                                        }
                                        title="SMS Sent"
                                        chart={
                                            <CChartBar
                                                className="mt-3 mx-3"
                                                style={{ height: "70px" }}
                                                data={{
                                                    labels: analytics.months,
                                                    datasets: [
                                                        {
                                                            label: "My First dataset",
                                                            backgroundColor: "rgba(255,255,255,.2)",
                                                            borderColor: "rgba(255,255,255,.55)",
                                                            data: analytics.sms,
                                                            barPercentage: 0.6,
                                                        },
                                                    ],
                                                }}
                                                options={{
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: {
                                                            display: false,
                                                        },
                                                    },
                                                    scales: {
                                                        x: {
                                                            grid: {
                                                                display: false,
                                                                drawTicks: false,
                                                            },
                                                            ticks: {
                                                                display: false,
                                                            },
                                                        },
                                                        y: {
                                                            grid: {
                                                                min: analytics.sms && Math.min(...analytics.sms),
                                                                max: analytics.sms && Math.max(...analytics.sms),
                                                                display: false,
                                                                drawBorder: false,
                                                                drawTicks: false,
                                                            },
                                                            ticks: {
                                                                display: false,
                                                            },
                                                        },
                                                    },
                                                }}
                                            />
                                        }
                                    />
                                </CCol>
                            </CRow>
                            </CRow>
                        </CCol>

                        {/* <h1 className="display-6" /> */}

                        <CTable
                            align="middle"
                            className="mb-0 border"
                            hover
                            responsive
                            style={{ width: "1270px" }}
                        >
                            <CTableHead color="light">
                                <CTableRow>
                                    <CTableHeaderCell className="text-center">
                                        <CIcon icon={cilPeople} />
                                    </CTableHeaderCell>
                                    <CTableHeaderCell>Users</CTableHeaderCell>
                                    <CTableHeaderCell className="text-center">
                                        Country
                                    </CTableHeaderCell>
                                    <CTableHeaderCell>Emails Delivered</CTableHeaderCell>
                                    <CTableHeaderCell className="text-center">
                                        Payment Method
                                    </CTableHeaderCell>
                                    <CTableHeaderCell>Activity</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {top10.map((item, index) => (
                                    <CTableRow v-for="item in tableItems" key={index}>
                                        <CTableDataCell className="text-center">
                                            <CAvatar size="md" src={avatar1} status="success" />
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <div>
                                                {item.firstname} {item.lastname}
                                            </div>
                                            <div className="small text-medium-emphasis">
                                                {item.email}
                                            </div>
                                        </CTableDataCell>
                                        <CTableDataCell className="text-center">
                                            <img src={`https://cdn.jsdelivr.net/npm/svg-country-flags@1.2.10/svg/${countries[item.country]}.svg`} width="30px" height='25px' alt='country flag' />
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <div className="clearfix">
                                                <div className="float-start">
                                                    <strong>
                                                        {(item.count.email / item.totalCredits * 100).toPrecision(2)} %
                                                    </strong>
                                                </div>
                                            </div>
                                            <CProgress
                                                thin
                                                color={(item.count.email / item.totalCredits * 100) >= 70 ? 'success' : ((item.count.email / item.totalCredits * 100 > 50) ? 'info' : (item.count.email / item.totalCredits * 100 <= 25 ? "danger" : "warning"))}
                                                value={item.count.email / item.totalCredits * 100}
                                            />
                                        </CTableDataCell>
                                        <CTableDataCell className="text-center">
                                            <CIcon size="xl" icon={cibCcMastercard} />
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <div className="small text-medium-emphasis">Last login</div>
                                            <strong>
                                                {(((new Date() - new Date(item.lastLogin)) / (1000 * 60 * 60)) < 1 ? ((new Date() - new Date(item.lastLogin)) / (1000 * 60)).toFixed() + ' Minutes' : ((new Date() - new Date(item.lastLogin)) / (1000 * 60 * 60)).toFixed() + ' Hours')} ago
                                            </strong>
                                        </CTableDataCell>
                                    </CTableRow>
                                ))}
                            </CTableBody>
                        </CTable>
                    </CRow>
                </CContainer>
            </>
        );
    }
}

export default UserAnalytics;