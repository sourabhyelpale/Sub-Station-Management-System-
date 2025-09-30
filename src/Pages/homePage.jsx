import React from "react";
import { useNavigate } from "react-router-dom"; 
import "./homePage.css";

const HomePage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const ReportPage = () => {
    navigate("/ReportProblem")
  }

  return (
    <>
      {/* Header */}
      <div className="header">
        <div className="logo">
          <div className="logo-icon" ><img src="https://image.winudf.com/v2/image1/Y29tLm1zZWRjbC5hcHBfaWNvbl8xNTU1NTExMjI2XzA4Mg/icon.png?w=312&fakeurl=1" alt="logo" /></div>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 600 }}>
              MSEDCL
            </div>
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
                <div className="stat-number">12</div>
                <div className="stat-label">Active Problems</div>
              </div>
            </div>
          </div>
          
          {/* Recent Problems */}
          <div className="recent-problems">
            <div className="section-title">🔄 Recent Problems</div>
            <div className="problem-list">
              <div className="problem-item">
                <div className="problem-status status-active"></div>
                <div className="problem-info">
                  <div className="problem-location">Kolhapur Market Area</div>
                  <div className="problem-time">2 hours ago</div>
                </div>
                <div className="status-indicator status-active">Active</div>
              </div>
              <div className="problem-item">
                <div className="problem-status status-active"></div>
                <div className="problem-info">
                  <div className="problem-location">Shivaji Nagar</div>
                  <div className="problem-time">45 mins ago</div>
                </div>
                <div className="status-indicator status-active">Active</div>
              </div>
              <div className="problem-item">
                <div className="problem-status status-resolved"></div>
                <div className="problem-info">
                  <div className="problem-location">Rajarampuri</div>
                  <div className="problem-time">1 hour ago</div>
                </div>
                <div className="status-indicator status-resolved">Resolved</div>
              </div>
              <div className="problem-item">
                <div className="problem-status status-resolved"></div>
                <div className="problem-info">
                  <div className="problem-location">New Palace Road</div>
                  <div className="problem-time">3 hours ago</div>
                </div>
                <div className="status-indicator status-resolved">Resolved</div>
              </div>
              <div className="problem-item">
                <div className="problem-status status-active"></div>
                <div className="problem-info">
                  <div className="problem-location">Station Road</div>
                  <div className="problem-time">30 mins ago</div>
                </div>
                <div className="status-indicator status-active">Active</div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="map-section">
          <div className="map-header">
            <div className="map-title">🗺️ Live Problem Map - Kolhapur City</div>
            <div className="map-controls">
              <button className="control-button active" onClick={ReportPage}>Report Problem</button>
              <button className="control-button refresh-btn">↻ Refresh</button>
              <button className="control-button export-btn">📥 Export Report</button>
            </div>
          </div>
          <div className="map-container">
            <div className="map-placeholder">
              <div style={{ fontSize: "24px", marginBottom: "10px" }}>🗺️</div>
              <div style={{ fontSize: "18px", marginBottom: "10px" }}>
                Google Maps Integration
              </div>
              <div style={{ fontSize: "14px", opacity: 0.8 }}>
                Interactive map with problem markers will be displayed here
              </div>
              <div
                style={{ fontSize: "12px", marginTop: "20px", opacity: 0.6 }}
              >
                • Red markers for active problems <br />
                • Green markers for resolved problems <br />
                • Click markers to view details <br />
                • Click on map to report new problems
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {/* <div className="toast">
        ✅ Problem resolved successfully in Shivaji Nagar area
      </div> */}
    </>
  );
};

export default HomePage;
