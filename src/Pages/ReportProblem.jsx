import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import "./ReportProblem.css";

const emptyRow = {
  srNo: "",
  division: "",
  subDivision: "",
  subStation: "",
  feederName: "",
  feederType: "",
  trippingTime: "",
  trippingDate: "",
  breakerOnTime: "",
  totalRestoreTime: "",
  restoreDate: "",
  totalDuration: "",
  voltageLevel: "",
  reason: "",
  agConsumers: "",
  villages: "",
  dtc: "",
  nonAgConsumers: "",
};

const requiredFields = ["subStation"];

const normalizeStationName = (value) => value.trim().toLowerCase().replace(/\s+/g, " ");

const ReportProblem = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([{ ...emptyRow }]);
  const [errors, setErrors] = useState({});
  const [stations, setStations] = useState([]);

  useEffect(() => {
    Papa.parse("/data/problemLocations.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setStations(result.data.filter((station) => station.name));
      },
    });
  }, []);

  const stationLookup = useMemo(() => {
    return stations.reduce((lookup, station) => {
      lookup[normalizeStationName(station.name)] = station;
      return lookup;
    }, {});
  }, [stations]);

  const stationNames = useMemo(() => {
    return [...new Set(stations.map((station) => station.name).filter(Boolean))].sort();
  }, [stations]);

  const autofillFromStation = (row, stationName) => {
    const station = stationLookup[normalizeStationName(stationName)];

    if (!station) {
      return {
        ...row,
        subStation: stationName,
      };
    }

    return {
      ...row,
      subStation: station.name || stationName,
      division: station.division || row.division,
      subDivision: station.sub || row.subDivision,
      feederName: station.feeder ? `${station.feeder} feeder(s)` : row.feederName,
      feederType: station.SSkv || row.feederType,
      voltageLevel: station.SSkv || row.voltageLevel,
      dtc: station.BU || row.dtc,
    };
  };

  const validateForm = () => {
    const newErrors = {};

    rows.forEach((row, index) => {
      const rowErrors = {};
      const hasAnyData = Object.values(row).some((value) => String(value).trim() !== "");

      if (hasAnyData) {
        requiredFields.forEach((field) => {
          if (!row[field] || String(row[field]).trim() === "") {
            rowErrors[field] = "This field is required";
          }
        });

        if (Object.keys(rowErrors).length > 0) {
          newErrors[index] = rowErrors;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearFieldError = (rowIndex, field) => {
    if (!errors[rowIndex] || !errors[rowIndex][field]) return;

    const newErrors = { ...errors };
    delete newErrors[rowIndex][field];

    if (Object.keys(newErrors[rowIndex]).length === 0) {
      delete newErrors[rowIndex];
    }

    setErrors(newErrors);
  };

  const handleChange = (index, field, value) => {
    setRows((currentRows) => {
      const updatedRows = [...currentRows];
      const updatedRow = { ...updatedRows[index], [field]: value };
      updatedRows[index] = field === "subStation" ? autofillFromStation(updatedRow, value) : updatedRow;
      return updatedRows;
    });

    clearFieldError(index, field);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      alert("Please fill all required fields before submitting.");
      return;
    }

    const filledRows = rows.filter((row) =>
      Object.values(row).some((value) => String(value).trim() !== "")
    );

    if (filledRows.length === 0) {
      alert("Please fill at least one row before submitting.");
      return;
    }

    const existingProblems = JSON.parse(localStorage.getItem("problems") || "[]");
    const newProblems = filledRows.map((row, index) => ({
      ...row,
      id: Date.now() + index,
      timestamp: new Date().toISOString(),
      status: "Pending",
    }));

    localStorage.setItem("problems", JSON.stringify([...existingProblems, ...newProblems]));

    alert("Problem report saved successfully.");
    navigate("/home");
  };

  const addRow = () => {
    setRows((currentRows) => [...currentRows, { ...emptyRow, srNo: String(currentRows.length + 1) }]);
  };

  const deleteRow = (index) => {
    if (rows.length === 1) {
      alert("At least one row is required.");
      return;
    }

    setRows((currentRows) => currentRows.filter((_, rowIndex) => rowIndex !== index));
    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[index];
      return nextErrors;
    });
  };

  const getInputClassName = (rowIndex, field) => (
    errors[rowIndex] && errors[rowIndex][field] ? "input-error" : ""
  );

  const renderInput = (row, index, field, props = {}) => (
    <input
      value={row[field]}
      onChange={(event) => handleChange(index, field, event.target.value)}
      className={getInputClassName(index, field)}
      {...props}
    />
  );

  return (
    <div className="report-problem">
      <div className="report-shell">
        <header className="report-header">
          <div>
            <p className="report-kicker">Operations entry</p>
            <h1>Report Electricity Problem</h1>
          </div>
          <button className="back-btn" onClick={() => navigate("/home")} type="button">
            Back to Home
          </button>
        </header>

        <section className="report-summary">
          <div>
            <span>{rows.length}</span>
            <p>Draft rows</p>
          </div>
          <div>
            <span>{stationNames.length}</span>
            <p>Sub-stations available</p>
          </div>
          <div>
            <span>Auto-fill</span>
            <p>Division, sub-division, voltage and feeder count</p>
          </div>
        </section>

        <form onSubmit={handleSubmit}>
          <div className="table-toolbar">
            <div>
              <h2>Problem Details</h2>
              <p>Select a sub-station from the list. Other details can be completed when resolving.</p>
            </div>
            <button type="button" onClick={addRow} className="add-row-btn">
              Add Row
            </button>
          </div>

          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Sr. No. *</th>
                  <th>Division *</th>
                  <th>Sub-Division *</th>
                  <th>Sub Station *</th>
                  <th>Feeder Name *</th>
                  <th>Type of Feeder *</th>
                  <th>Tripping Time *</th>
                  <th>Tripping Date *</th>
                  <th>Breaker ON Time *</th>
                  <th>Total Restore Time *</th>
                  <th>Restore Date *</th>
                  <th>Total Duration</th>
                  <th>Voltage Level *</th>
                  <th>Reason *</th>
                  <th>AG Consumers</th>
                  <th>Villages</th>
                  <th>DTC / BU</th>
                  <th>Non AG Consumers</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    <td>{renderInput(row, index, "srNo", { placeholder: "1" })}</td>
                    <td>{renderInput(row, index, "division", { placeholder: "Division" })}</td>
                    <td>{renderInput(row, index, "subDivision", { placeholder: "Sub-division" })}</td>
                    <td>
                      {renderInput(row, index, "subStation", {
                        placeholder: "Search sub-station",
                        list: "sub-station-options",
                      })}
                    </td>
                    <td>{renderInput(row, index, "feederName", { placeholder: "Feeder" })}</td>
                    <td>{renderInput(row, index, "feederType", { placeholder: "11KV / 33KV" })}</td>
                    <td>{renderInput(row, index, "trippingTime", { type: "time" })}</td>
                    <td>{renderInput(row, index, "trippingDate", { type: "date" })}</td>
                    <td>{renderInput(row, index, "breakerOnTime", { type: "time" })}</td>
                    <td>{renderInput(row, index, "totalRestoreTime", { type: "time" })}</td>
                    <td>{renderInput(row, index, "restoreDate", { type: "date" })}</td>
                    <td>{renderInput(row, index, "totalDuration", { placeholder: "Hours" })}</td>
                    <td>{renderInput(row, index, "voltageLevel", { placeholder: "KV" })}</td>
                    <td>{renderInput(row, index, "reason", { placeholder: "Reason" })}</td>
                    <td>{renderInput(row, index, "agConsumers", { placeholder: "Count" })}</td>
                    <td>{renderInput(row, index, "villages", { placeholder: "Villages" })}</td>
                    <td>{renderInput(row, index, "dtc", { placeholder: "BU code" })}</td>
                    <td>{renderInput(row, index, "nonAgConsumers", { placeholder: "Count" })}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => deleteRow(index)}
                        className="delete-btn"
                        title="Delete row"
                        aria-label={`Delete row ${index + 1}`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <datalist id="sub-station-options">
            {stationNames.map((stationName) => (
              <option value={stationName} key={stationName} />
            ))}
          </datalist>

          <div className="form-actions">
            <p>* Only sub-station is required while creating a pending report.</p>
            <button type="submit" className="submit-btn">
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportProblem;
