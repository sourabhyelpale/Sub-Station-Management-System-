import React from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMap, LoadScript, Marker,Polyline } from "@react-google-maps/api"; 
import "./homePage.css";

const HomePage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleReportPage = () => {
    navigate("/ReportProblem");
  };

  // Kolhapur district center
   const kolhapurCenter = { lat: 16.7050, lng: 74.2433 };
  // Inside HomePage component
const activeIcon = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
const resolvedIcon = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";

// Define multiple problem locations
const problemLocations = [
  { id: 1, name: "Kolhapur Market Area", lat: 16.7050, lng: 74.2433, status: "Active" },
  { id: 2, name: "Shivaji Nagar", lat: 16.7120, lng: 74.2500, status: "Active" },
  { id: 3, name: "Rajarampuri", lat: 16.6980, lng: 74.2400, status: "Resolved" },
  { id: 4, name: "New Palace Road", lat: 16.6900, lng: 74.2350, status: "Resolved" },
  { id: 5, name: "Station Road", lat: 16.7150, lng: 74.2550, status: "Active" },
];


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
            <div className="map-title">🗺️ Live Problem Map - Kolhapur District</div>
            <div className="map-controls">
              <button className="control-button active" onClick={handleReportPage}>
                Report Problem
              </button>
              <button className="control-button refresh-btn">↻ Refresh</button>
              <button className="control-button export-btn">📥 Export Report</button>
            </div>
          </div>
          <div className="map-container">
            <LoadScript googleMapsApiKey="AIzaSyABLnG2NhzOeMql5MTI5fBlvSE7rzTox28">
              
<GoogleMap
  mapContainerStyle={{ height: "500px", width: "100%" }}
  center={kolhapurCenter}
  zoom={12}
>
  {/* Markers */}
  {problemLocations.map((location) => (
    <Marker
      key={location.id}
      position={{ lat: location.lat, lng: location.lng }}
      title={`${location.name} - ${location.status}`}
      icon={location.status === "Active" ? activeIcon : resolvedIcon}
    />
  ))}

  {/* Connection Line (Polyline) */}
  <Polyline
    path={problemLocations.map((loc) => ({ lat: loc.lat, lng: loc.lng }))}
    options={{
      strokeColor: "#FF0000",   // Line color
      strokeOpacity: 0.8,
      strokeWeight: 3,
      clickable: false,
      draggable: false,
      editable: false,
      geodesic: true,
    }}
  />
</GoogleMap>



            </LoadScript>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
