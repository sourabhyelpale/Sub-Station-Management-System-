import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import "leaflet/dist/leaflet.css";
import "./homePage.css";

const stationIcon = L.divIcon({
  className: "station-map-marker",
  html: "<span></span>",
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -12],
});

const HomePage = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load problems from memory
  useEffect(() => {
    loadProblems();
  }, [refreshKey]);

  const loadProblems = () => {
    const storedProblems = JSON.parse(sessionStorage.getItem("problems") || "[]");
    setProblems(storedProblems);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  const handleReportPage = () => {
    navigate("/ReportProblem");
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    alert("✅ Data refreshed successfully!");
  };

  const handleExportToExcel = () => {
    if (problems.length === 0) {
      alert("⚠️ No data to export!");
      return;
    }


    // Prepare data for Excel
    const excelData = problems.map((problem, index) => ({
      "Sr. No.": problem.srNo || index + 1,
      "Division": problem.division,
      "Sub-Division": problem.subDivision,
      "Sub Station": problem.subStation,
      "Feeder Name": problem.feederName,
      "Feeder Type": problem.feederType,
      "Tripping Time": problem.trippingTime,
      "Tripping Date": problem.trippingDate,
      "Breaker ON Time": problem.breakerOnTime,
      "Total Restore Time": problem.totalRestoreTime,
      "Restore Date": problem.restoreDate,
      "Total Duration": problem.totalDuration,
      "Voltage Level": problem.voltageLevel,
      "Reason": problem.reason,
      "AG Consumers": problem.agConsumers,
      "Villages": problem.villages,
      "DTC": problem.dtc,
      "Non AG Consumers": problem.nonAgConsumers,
      "Status": problem.status,
      "Reported On": new Date(problem.timestamp).toLocaleString()
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 20 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 30 }, { wch: 12 },
      { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 20 }
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Electricity Problems");

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `MSEDCL_Problems_Report_${timestamp}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);

    alert("✅ Excel file downloaded successfully!");
  };

  // Kolhapur district center
  const kolhapurCenter = { lat: 16.7050, lng: 74.2433 };

  const [problemLocations, setProblemLocations] = useState([]);

  useEffect(() => {
    // Load CSV from public folder
    Papa.parse("/data/problemLocations.csv", {
      download: true,
      header: true,
      complete: (result) => {
        // Convert lat/lng to numbers for map use
        const formatted = result.data
          .map((item) => ({
            ...item,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lng),
          }))
          .filter((item) => !Number.isNaN(item.lat) && !Number.isNaN(item.lng));
        setProblemLocations(formatted);
      },
    });
  }, []);

  // Calculate active problems count
  const activeProblemsCount = problems.filter(p => p.status === "Active").length;

  // Get recent 5 problems
  const recentProblems = problems.slice(-5).reverse();

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const reported = new Date(timestamp);
    const diffMs = now - reported;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return reported.toLocaleDateString();
  };

  return (
    <>
      {/* Header */}
      <div className="header">
        <div className="logo">
          <div className="logo-icon">
            <img
              src="https://image.winudf.com/v2/image1/Y29tLm1zZWRjbC5hcHBfaWNvbl8xNTU1NTExMjI2XzA4Mg/icon.png?w=312&fakeurl=1"
              alt="logo"
            />
          </div>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 600 }}>MSEDCL</div>
            <div style={{ fontSize: "12px", opacity: 0.8 }}>
              Electricity Problem Tracking System
            </div>
          </div>
        </div>
        <div className="user-info">
          <div>
            <div style={{ fontSize: "14px", fontWeight: 500 }}>Admin User</div>
            <div style={{ fontSize: "12px", opacity: 0.8 }}>
              Maharashtra Central Office
            </div>
          </div>
          <div
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Logout
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="main-layout">
        {/* Sidebar */}
        <div className="sidebar">
          {/* Stats */}
          <div className="stats-section">
            <div className="section-title">📊 Live Statistics</div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{activeProblemsCount}</div>
                <div className="stat-label">Active Problems</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{problems.length}</div>
                <div className="stat-label">Total Reported</div>
              </div>
            </div>
          </div>

          {/* Recent Problems */}
          <div className="recent-problems">
            <div className="section-title">🔄 Recent Problems</div>
            <div className="problem-list">
              {recentProblems.length > 0 ? (
                recentProblems.map((problem) => (
                  <div className="problem-item" key={problem.id}>
                    <div className={`problem-status status-${problem.status.toLowerCase()}`}></div>
                    <div className="problem-info">
                      <div className="problem-location">
                        {problem.subStation || problem.feederName || "Unknown Location"}
                      </div>
                      <div className="problem-time">{getTimeAgo(problem.timestamp)}</div>
                    </div>
                    <div className={`status-indicator status-${problem.status.toLowerCase()}`}>
                      {problem.status}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                  No problems reported yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="map-section">
          <div className="map-header">
            <div className="map-title">🗺️ Live Problem Map - Kolhapur District</div>
            <div className="map-controls">
              <button className="control-button active" onClick={handleReportPage}>
                ➕ Report Problem
              </button>
              <button className="control-button refresh-btn" onClick={handleRefresh}>
                ↻ Refresh
              </button>
              <button className="control-button export-btn" onClick={handleExportToExcel}>
                📥 Export to Excel
              </button>
            </div>
          </div>
          <div className="map-container">
            <MapContainer
              className="google-map"
              center={[kolhapurCenter.lat, kolhapurCenter.lng]}
              zoom={12}
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {problemLocations.map((loc) => (
                <Marker
                  key={loc.id}
                  position={[loc.lat, loc.lng]}
                  icon={stationIcon}
                >
                  <Popup>
                    <div className="station-popup">
                      <h4>{loc.name}</h4>
                      <p>
                        <strong>Division:</strong> {loc.division || "-"} <br />
                        <strong>Sub Division:</strong> {loc.sub || "-"} <br />
                        <strong>Sub Station No:</strong> {loc.SSno || "-"} <br />
                        <strong>Sub Station KV:</strong> {loc.SSkv || "-"} <br />
                        <strong>Capacity (MVA):</strong> {loc.capacity || "-"} <br />
                        <strong>Feeder:</strong> {loc.feeder || "-"} <br />
                        <strong>Infeeder:</strong> {loc.infeeder || "-"} <br />
                        <strong>Outfeeder:</strong> {loc.outfeeder || "-"} <br />
                        <strong>Code:</strong> {loc.BU || "-"}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </>
  );
};
export default HomePage;
