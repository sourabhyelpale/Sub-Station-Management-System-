import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import "leaflet/dist/leaflet.css";
import "./homePage.css";

const stationDataUrl = `${process.env.PUBLIC_URL || ""}/data/problemLocations.csv`;

const stationIcon = L.divIcon({
  className: "station-map-marker",
  html: "<span></span>",
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -12],
});

const pendingStationIcon = L.divIcon({
  className: "pending-station-marker",
  html: "<span></span>",
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -22],
});

const normalizeStationName = (value = "") => value.trim().toLowerCase().replace(/\s+/g, " ");

const normalizeStationLocation = (item) => {
  const lat = parseFloat(item.lat || item.latitude || item.Latitude);
  const lng = parseFloat(item.lng || item.lon || item.longitude || item.Longitude);

  return {
    ...item,
    id: item.id || item.SSno || `${item.name || item.stationName || item.subStation}-${lat}-${lng}`,
    name: item.name || item.stationName || item.subStation || item["Sub Station"] || "",
    lat,
    lng,
  };
};

const problemFields = [
  { key: "srNo", label: "Sr. No." },
  { key: "division", label: "Division" },
  { key: "subDivision", label: "Sub-Division" },
  { key: "subStation", label: "Sub Station" },
  { key: "feederName", label: "Feeder Name" },
  { key: "feederType", label: "Type of Feeder" },
  { key: "trippingTime", label: "Tripping Time", type: "time" },
  { key: "trippingDate", label: "Tripping Date", type: "date" },
  { key: "breakerOnTime", label: "Breaker ON Time", type: "time" },
  { key: "totalRestoreTime", label: "Total Restore Time", type: "time" },
  { key: "restoreDate", label: "Restore Date", type: "date" },
  { key: "totalDuration", label: "Total Duration" },
  { key: "voltageLevel", label: "Voltage Level" },
  { key: "reason", label: "Reason" },
  { key: "agConsumers", label: "AG Consumers" },
  { key: "villages", label: "Villages" },
  { key: "dtc", label: "DTC / BU" },
  { key: "nonAgConsumers", label: "Non AG Consumers" },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [history, setHistory] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewProblem, setViewProblem] = useState(null);
  const [resolveProblem, setResolveProblem] = useState(null);
  const [resolveDraft, setResolveDraft] = useState(null);
  const [resolveErrors, setResolveErrors] = useState({});

  // Load problems from memory
  useEffect(() => {
    loadProblems();
  }, [refreshKey]);

  const loadProblems = () => {
    const storedProblems = JSON.parse(localStorage.getItem("problems") || "[]");
    const sessionProblems = JSON.parse(sessionStorage.getItem("problems") || "[]");
    const availableProblems = storedProblems.length > 0 ? storedProblems : sessionProblems;
    const storedHistory = JSON.parse(localStorage.getItem("problemHistory") || "[]");

    if (storedProblems.length === 0 && sessionProblems.length > 0) {
      localStorage.setItem("problems", JSON.stringify(sessionProblems));
    }

    setProblems(availableProblems);
    setHistory(storedHistory);
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

  const saveProblems = (updatedProblems) => {
    localStorage.setItem("problems", JSON.stringify(updatedProblems));
    setProblems(updatedProblems);
  };

  const addHistoryEntry = (problem, action) => {
    const historyEntry = {
      ...problem,
      historyId: `${problem.id}-${action}-${Date.now()}`,
      historyAction: action,
      historyTimestamp: new Date().toISOString(),
    };
    const updatedHistory = [historyEntry, ...history];
    localStorage.setItem("problemHistory", JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
  };

  const openResolveModal = (problem) => {
    setResolveProblem(problem);
    setResolveDraft({ ...problem });
    setResolveErrors({});
  };

  const handleResolveDraftChange = (field, value) => {
    setResolveDraft((current) => ({ ...current, [field]: value }));
    setResolveErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const submitResolveProblem = (event) => {
    event.preventDefault();
    if (!resolveProblem || !resolveDraft) return;

    const nextErrors = {};
    problemFields.forEach(({ key }) => {
      if (!resolveDraft[key] || String(resolveDraft[key]).trim() === "") {
        nextErrors[key] = true;
      }
    });

    if (Object.keys(nextErrors).length > 0) {
      setResolveErrors(nextErrors);
      alert("Please complete all fields before resolving this problem.");
      return;
    }

    handleResolveProblem(resolveProblem.id, resolveDraft);
    setResolveProblem(null);
    setResolveDraft(null);
    setResolveErrors({});
  };

  const handleResolveProblem = (problemId, completedData) => {
    const problem = problems.find((item) => item.id === problemId);
    if (!problem) return;

    const updatedProblem = {
      ...problem,
      ...completedData,
      status: "Resolved",
      resolvedAt: new Date().toISOString(),
    };

    saveProblems(problems.map((item) => (item.id === problemId ? updatedProblem : item)));
    addHistoryEntry(updatedProblem, "Resolved");
  };

  const handleDeleteProblem = (problemId) => {
    const problem = problems.find((item) => item.id === problemId);
    if (!problem) return;

    saveProblems(problems.filter((item) => item.id !== problemId));
    addHistoryEntry(problem, "Deleted");
  };

  const renderDetailValue = (value) => value || "-";

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
    Papa.parse(stationDataUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (result) => {
        // Convert lat/lng to numbers for map use
        const formatted = result.data
          .map(normalizeStationLocation)
          .filter((item) => item.name && !Number.isNaN(item.lat) && !Number.isNaN(item.lng));
        setProblemLocations(formatted);
      },
      error: (error) => {
        console.error("Unable to load station location data", error);
      },
    });
  }, []);

  const pendingProblems = problems.filter(p => p.status === "Pending");
  const resolvedProblems = problems.filter(p => p.status === "Resolved");

  // Get recent 5 problems
  const recentProblems = pendingProblems.slice(-5).reverse();

  const pendingLocationMap = problemLocations.reduce((lookup, location) => {
    lookup[normalizeStationName(location.name)] = location;
    return lookup;
  }, {});

  const pendingMapProblems = pendingProblems
    .map((problem) => ({
      problem,
      location: pendingLocationMap[normalizeStationName(problem.subStation)],
    }))
    .filter((item) => item.location);

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
                <div className="stat-number">{pendingProblems.length}</div>
                <div className="stat-label">Pending Problems</div>
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
                  <div className="problem-item problem-card" key={problem.id}>
                    <div className={`problem-status status-${problem.status.toLowerCase()}`}></div>
                    <div className="problem-info">
                      <div className="problem-location">
                        {problem.subStation || problem.feederName || "Unknown Location"}
                      </div>
                      <div className="problem-time">{getTimeAgo(problem.timestamp)}</div>
                      <div className="problem-reason">{problem.reason || "No reason added"}</div>
                    </div>
                    <div className={`status-indicator status-${problem.status.toLowerCase()}`}>
                      {problem.status}
                    </div>
                    <div className="problem-actions">
                      <button
                        type="button"
                        className="view-action"
                        onClick={() => setViewProblem(problem)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="resolve-action"
                        onClick={() => openResolveModal(problem)}
                      >
                        Resolved
                      </button>
                      <button
                        type="button"
                        className="delete-action"
                        onClick={() => handleDeleteProblem(problem.id)}
                      >
                        Delete
                      </button>
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
              <button
                type="button"
                className="summary-pill resolved-pill"
                onClick={() => navigate("/resolved")}
              >
                <strong>{resolvedProblems.length}</strong>
                <span>Resolved</span>
              </button>
              <button
                type="button"
                className="summary-pill history-pill"
                onClick={() => navigate("/history")}
              >
                <strong>{history.length}</strong>
                <span>History</span>
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
              {pendingMapProblems.map(({ problem, location }) => (
                <Marker
                  key={`pending-${problem.id}`}
                  position={[location.lat, location.lng]}
                  icon={pendingStationIcon}
                >
                  <Popup>
                    <div className="station-popup">
                      <h4>Pending Problem</h4>
                      <p>
                        <strong>Sub Station:</strong> {problem.subStation || "-"} <br />
                        <strong>Feeder:</strong> {problem.feederName || "-"} <br />
                        <strong>Reason:</strong> {problem.reason || "-"} <br />
                        <strong>Reported:</strong> {getTimeAgo(problem.timestamp)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>

      {viewProblem && (
        <div className="problem-modal-backdrop" role="dialog" aria-modal="true">
          <div className="problem-modal">
            <div className="problem-modal-header">
              <div>
                <p>Problem details</p>
                <h2>{viewProblem.subStation || "Unknown Location"}</h2>
              </div>
              <button type="button" onClick={() => setViewProblem(null)}>Close</button>
            </div>
            <div className="detail-grid">
              {problemFields.map((field) => (
                <div className="detail-item" key={field.key}>
                  <span>{field.label}</span>
                  <strong>{renderDetailValue(viewProblem[field.key])}</strong>
                </div>
              ))}
              <div className="detail-item">
                <span>Status</span>
                <strong>{viewProblem.status}</strong>
              </div>
              <div className="detail-item">
                <span>Reported On</span>
                <strong>{new Date(viewProblem.timestamp).toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {resolveProblem && resolveDraft && (
        <div className="problem-modal-backdrop" role="dialog" aria-modal="true">
          <form className="problem-modal resolve-modal" onSubmit={submitResolveProblem}>
            <div className="problem-modal-header">
              <div>
                <p>Complete before resolving</p>
                <h2>{resolveProblem.subStation || "Pending Problem"}</h2>
              </div>
              <button type="button" onClick={() => setResolveProblem(null)}>Close</button>
            </div>
            <div className="resolve-table-wrap">
              <table className="resolve-table">
                <thead>
                  <tr>
                    {problemFields.map((field) => (
                      <th key={field.key}>{field.label} *</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {problemFields.map((field) => (
                      <td key={field.key}>
                        <input
                          type={field.type || "text"}
                          value={resolveDraft[field.key] || ""}
                          onChange={(event) => handleResolveDraftChange(field.key, event.target.value)}
                          className={resolveErrors[field.key] ? "input-error" : ""}
                        />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="modal-actions">
              <p>All fields are required before a problem can be marked resolved.</p>
              <button type="submit" className="resolve-submit">Submit & Resolve</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
export default HomePage;
