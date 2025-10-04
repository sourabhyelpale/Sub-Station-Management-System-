import React, { useState, useEffect } from "react";
import "./ReportProblem.css";
import { useNavigate } from "react-router-dom";

const ReportProblem = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([
    {
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
    },
  ]);

  useEffect(() => {
  document.body.style.zoom = "50%";   // zoom to 50% when page mounts
  return () => {
    document.body.style.zoom = "100%"; // reset when leaving page
  };
}, []);

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    rows.forEach((row, index) => {
      const rowErrors = {};
      
      // Check if any field is filled
      const hasAnyData = Object.values(row).some(value => value.trim() !== "");
      
      if (hasAnyData) {
        // If any field has data, all required fields must be filled
        const requiredFields = [
          'srNo', 'division', 'subDivision', 'subStation', 
          'feederName', 'feederType', 'trippingTime', 'trippingDate',
          'breakerOnTime', 'totalRestoreTime', 'restoreDate', 
          'voltageLevel', 'reason'
        ];
        
        requiredFields.forEach(field => {
          if (!row[field] || row[field].trim() === "") {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      alert("⚠️ Please fill all required fields before submitting!");
      return;
    }
    
    // Filter out empty rows
    const filledRows = rows.filter(row => 
      Object.values(row).some(value => value.trim() !== "")
    );
    
    if (filledRows.length === 0) {
      alert("⚠️ Please fill at least one row before submitting!");
      return;
    }
    
    // Get existing problems from memory
    const existingProblems = JSON.parse(sessionStorage.getItem("problems") || "[]");
    
    // Add new problems with timestamp and ID
    const newProblems = filledRows.map((row, index) => ({
      ...row,
      id: Date.now() + index,
      timestamp: new Date().toISOString(),
      status: "Active"
    }));
    
    // Combine and save
    const allProblems = [...existingProblems, ...newProblems];
    sessionStorage.setItem("problems", JSON.stringify(allProblems));
    
    alert("✅ Problem(s) reported successfully!");
    navigate("/home");
  };

  const handleChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
    
    // Clear error for this field
    if (errors[index] && errors[index][field]) {
      const newErrors = { ...errors };
      delete newErrors[index][field];
      if (Object.keys(newErrors[index]).length === 0) {
        delete newErrors[index];
      }
      setErrors(newErrors);
    }
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
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
      },
    ]);
  };

  const deleteRow = (index) => {
    if (rows.length > 1) {
      const updatedRows = rows.filter((_, i) => i !== index);
      setRows(updatedRows);
      
      // Remove errors for deleted row
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    } else {
      alert("At least one row is required!");
    }
  };

  const getInputClassName = (rowIndex, field) => {
    return errors[rowIndex] && errors[rowIndex][field] ? "input-error" : "";
  };

  return (
    <div className="report-problem">
      <div className="report-header">
        <h3>⚡ Report New Electricity Problem</h3>
        <button className="back-btn" onClick={() => navigate("/home")}>
          ← Back to Home
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="table-container">
          <table border="1" cellPadding="8" className="report-table">
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
                <th>DTC</th>
                <th>Non AG Consumers</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={row.srNo}
                      onChange={(e) => handleChange(index, "srNo", e.target.value)}
                      className={getInputClassName(index, "srNo")}
                      placeholder="1"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.division}
                      onChange={(e) => handleChange(index, "division", e.target.value)}
                      className={getInputClassName(index, "division")}
                      placeholder="Division"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.subDivision}
                      onChange={(e) => handleChange(index, "subDivision", e.target.value)}
                      className={getInputClassName(index, "subDivision")}
                      placeholder="Sub-Division"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.subStation}
                      onChange={(e) => handleChange(index, "subStation", e.target.value)}
                      className={getInputClassName(index, "subStation")}
                      placeholder="Station Name"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.feederName}
                      onChange={(e) => handleChange(index, "feederName", e.target.value)}
                      className={getInputClassName(index, "feederName")}
                      placeholder="Feeder"
                    />
                  </td>
                  <td>
                    <select
                      value={row.feederType}
                      onChange={(e) => handleChange(index, "feederType", e.target.value)}
                      className={getInputClassName(index, "feederType")}
                    >
                      <option value="">Select</option>
                      <option value="11KV">11KV</option>
                      <option value="33KV">33KV</option>
                      <option value="66KV">66KV</option>
                      <option value="132KV">132KV</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="time"
                      value={row.trippingTime}
                      onChange={(e) => handleChange(index, "trippingTime", e.target.value)}
                      className={getInputClassName(index, "trippingTime")}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={row.trippingDate}
                      onChange={(e) => handleChange(index, "trippingDate", e.target.value)}
                      className={getInputClassName(index, "trippingDate")}
                    />
                  </td>
                  <td>
                    <input
                      type="time"
                      value={row.breakerOnTime}
                      onChange={(e) => handleChange(index, "breakerOnTime", e.target.value)}
                      className={getInputClassName(index, "breakerOnTime")}
                    />
                  </td>
                  <td>
                    <input
                      type="time"
                      value={row.totalRestoreTime}
                      onChange={(e) => handleChange(index, "totalRestoreTime", e.target.value)}
                      className={getInputClassName(index, "totalRestoreTime")}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={row.restoreDate}
                      onChange={(e) => handleChange(index, "restoreDate", e.target.value)}
                      className={getInputClassName(index, "restoreDate")}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.totalDuration}
                      onChange={(e) => handleChange(index, "totalDuration", e.target.value)}
                      placeholder="hrs"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.voltageLevel}
                      onChange={(e) => handleChange(index, "voltageLevel", e.target.value)}
                      className={getInputClassName(index, "voltageLevel")}
                      placeholder="KV"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.reason}
                      onChange={(e) => handleChange(index, "reason", e.target.value)}
                      className={getInputClassName(index, "reason")}
                      placeholder="Reason"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.agConsumers}
                      onChange={(e) => handleChange(index, "agConsumers", e.target.value)}
                      placeholder="Count"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.villages}
                      onChange={(e) => handleChange(index, "villages", e.target.value)}
                      placeholder="Villages"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.dtc}
                      onChange={(e) => handleChange(index, "dtc", e.target.value)}
                      placeholder="DTC"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.nonAgConsumers}
                      onChange={(e) => handleChange(index, "nonAgConsumers", e.target.value)}
                      placeholder="Count"
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => deleteRow(index)}
                      className="delete-btn"
                      title="Delete Row"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="form-actions">
          <button type="button" onClick={addRow} className="add-row-btn">
            ➕ Add Another Row
          </button>
          <button type="submit" className="submit-btn">
            ✅ Submit Report
          </button>
        </div>
      </form>

      <div className="form-note">
        * Required fields must be filled if any data is entered in the row
      </div>
    </div>
  );
};

export default ReportProblem;