import React from "react";
import "./ReportProblem.css";
import { useNavigate } from "react-router-dom";

const ReportProblem = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/home");
  };

  return (
    <div className="report-problem">
      <h3>Report New Problem</h3>

      <form onSubmit={handleSubmit}>
        <label>Problem</label>
        <select required>
          <option value="">Select problem type</option>
          <option>Power Outage</option>
          <option>Transformer Fault</option>
          <option>Line Damage</option>
        </select>

        <label>Location/Area</label>
        <input type="text" placeholder="Enter area or click on map" required />

        <button type="submit" className="btn submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default ReportProblem;
