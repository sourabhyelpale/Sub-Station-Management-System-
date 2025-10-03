import React,{useState} from "react";
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
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/home");
  };
  const handleChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
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
  return (
    <div className="report-problem">
      <h3>Report New Problem</h3>

      <form onSubmit={handleSubmit}>
      <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Sr. No.</th>
            <th>Division</th>
            <th>Sub-Division</th>
            <th>Name of Sub/Stn</th>
            <th>Feeder Name</th>
            <th>Type of Feeder</th>
            <th>Tripping Time</th>
            <th>Tripping Date</th>
            <th>Breaker ON Time</th>
            <th>Total Restore Time</th>
            <th>Restore Date</th>
            <th>Total Duration</th>
            <th>Voltage Level</th>
            <th>Reason</th>
            <th>AG Consumers</th>
            <th>Villages</th>
            <th>DTC</th>
            <th>Non AG Consumers</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {Object.keys(row).map((field) => (
                <td key={field}>
                  <input
                    type="text"
                    value={row[field]}
                    onChange={(e) => handleChange(index, field, e.target.value)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: "15px" }}>
        <button type="button" onClick={addRow}>
          ➕ Add Row
        </button>
        <button type="submit" style={{ marginLeft: "10px" }}>
          ✅ Submit
        </button>
      </div>
    </form>
    </div>
  );
};

export default ReportProblem;
