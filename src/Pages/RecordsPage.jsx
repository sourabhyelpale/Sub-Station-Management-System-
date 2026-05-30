import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import "./RecordsPage.css";

const fields = [
  ["srNo", "Sr. No."],
  ["division", "Division"],
  ["subDivision", "Sub-Division"],
  ["subStation", "Sub Station"],
  ["feederName", "Feeder Name"],
  ["feederType", "Feeder Type"],
  ["trippingTime", "Tripping Time"],
  ["trippingDate", "Tripping Date"],
  ["breakerOnTime", "Breaker ON Time"],
  ["totalRestoreTime", "Total Restore Time"],
  ["restoreDate", "Restore Date"],
  ["totalDuration", "Total Duration"],
  ["voltageLevel", "Voltage Level"],
  ["reason", "Reason"],
  ["agConsumers", "AG Consumers"],
  ["villages", "Villages"],
  ["dtc", "DTC / BU"],
  ["nonAgConsumers", "Non AG Consumers"],
  ["status", "Status"],
];

const getUniqueValues = (records, key) => (
  [...new Set(records.map((record) => record[key]).filter(Boolean))].sort()
);

const getRecordDate = (record, mode) => (
  mode === "history"
    ? record.historyTimestamp || record.resolvedAt || record.timestamp
    : record.resolvedAt || record.timestamp
);

const RecordsPage = ({ mode }) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    subStation: "",
    division: "",
    subDivision: "",
  });

  const allRecords = useMemo(() => {
    if (mode === "history") {
      return JSON.parse(localStorage.getItem("problemHistory") || "[]");
    }

    return JSON.parse(localStorage.getItem("problems") || "[]")
      .filter((problem) => problem.status === "Resolved");
  }, [mode]);

  const filteredRecords = useMemo(() => {
    return allRecords.filter((record) => {
      const recordTime = getRecordDate(record, mode);
      const recordDate = recordTime ? new Date(recordTime) : null;
      const startDate = filters.startDate ? new Date(`${filters.startDate}T00:00:00`) : null;
      const endDate = filters.endDate ? new Date(`${filters.endDate}T23:59:59`) : null;

      if (startDate && (!recordDate || recordDate < startDate)) return false;
      if (endDate && (!recordDate || recordDate > endDate)) return false;
      if (filters.subStation && record.subStation !== filters.subStation) return false;
      if (filters.division && record.division !== filters.division) return false;
      if (filters.subDivision && record.subDivision !== filters.subDivision) return false;

      return true;
    });
  }, [allRecords, filters, mode]);

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const downloadExcel = () => {
    if (filteredRecords.length === 0) {
      alert("No records found for selected filters.");
      return;
    }

    const rows = filteredRecords.map((record, index) => {
      const row = {
        "Sr. No.": record.srNo || index + 1,
      };

      fields.slice(1).forEach(([key, label]) => {
        row[label] = record[key] || "";
      });

      row["Action"] = record.historyAction || "";
      row["Reported On"] = record.timestamp ? new Date(record.timestamp).toLocaleString() : "";
      row["Resolved On"] = record.resolvedAt ? new Date(record.resolvedAt).toLocaleString() : "";
      row["History On"] = record.historyTimestamp ? new Date(record.historyTimestamp).toLocaleString() : "";
      return row;
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = Object.keys(rows[0]).map(() => ({ wch: 18 }));
    XLSX.utils.book_append_sheet(wb, ws, mode === "history" ? "History" : "Resolved");
    XLSX.writeFile(wb, `${mode === "history" ? "History" : "Resolved"}_Problems.xlsx`);
  };

  const title = mode === "history" ? "Problem History" : "Resolved Problems";

  return (
    <div className="records-page">
      <header className="records-header">
        <div>
          <p>MSEDCL records</p>
          <h1>{title}</h1>
        </div>
        <div className="records-actions">
          <button type="button" onClick={() => navigate("/home")} className="secondary-record-btn">
            Back Home
          </button>
          <button type="button" onClick={downloadExcel} className="download-record-btn">
            Download Excel
          </button>
        </div>
      </header>

      <section className="records-filters">
        <label>
          <span>Start Date</span>
          <input
            type="date"
            value={filters.startDate}
            onChange={(event) => updateFilter("startDate", event.target.value)}
          />
        </label>
        <label>
          <span>End Date</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(event) => updateFilter("endDate", event.target.value)}
          />
        </label>
        <label>
          <span>Sub Station</span>
          <select value={filters.subStation} onChange={(event) => updateFilter("subStation", event.target.value)}>
            <option value="">All</option>
            {getUniqueValues(allRecords, "subStation").map((value) => (
              <option value={value} key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Division</span>
          <select value={filters.division} onChange={(event) => updateFilter("division", event.target.value)}>
            <option value="">All</option>
            {getUniqueValues(allRecords, "division").map((value) => (
              <option value={value} key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Sub-Division</span>
          <select value={filters.subDivision} onChange={(event) => updateFilter("subDivision", event.target.value)}>
            <option value="">All</option>
            {getUniqueValues(allRecords, "subDivision").map((value) => (
              <option value={value} key={value}>{value}</option>
            ))}
          </select>
        </label>
      </section>

      <div className="records-summary">
        Showing <strong>{filteredRecords.length}</strong> of <strong>{allRecords.length}</strong> records
      </div>

      <div className="records-table-wrap">
        <table className="records-table">
          <thead>
            <tr>
              {fields.map(([, label]) => (
                <th key={label}>{label}</th>
              ))}
              {mode === "history" && <th>Action</th>}
              <th>Reported On</th>
              <th>{mode === "history" ? "History On" : "Resolved On"}</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record, index) => (
              <tr key={record.historyId || record.id || index}>
                {fields.map(([key]) => (
                  <td key={key}>{record[key] || "-"}</td>
                ))}
                {mode === "history" && <td>{record.historyAction || "-"}</td>}
                <td>{record.timestamp ? new Date(record.timestamp).toLocaleString() : "-"}</td>
                <td>
                  {getRecordDate(record, mode)
                    ? new Date(getRecordDate(record, mode)).toLocaleString()
                    : "-"}
                </td>
              </tr>
            ))}
            {filteredRecords.length === 0 && (
              <tr>
                <td colSpan={mode === "history" ? fields.length + 3 : fields.length + 2}>
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecordsPage;
