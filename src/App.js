import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import LoginPage from "./Pages/Loginpage";
import HomePage from "./Pages/homePage";
import ReportProblem from "./Pages/ReportProblem";
// import handleSubmit from "./Pages/ReportProblem";

function App() {
  return (
     <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/ReportProblem" element={<ReportProblem />} />
    </Routes>
  );
}

export default App;
