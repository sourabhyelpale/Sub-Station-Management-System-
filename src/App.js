import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./Pages/homePage";
import ReportProblem from "./Pages/ReportProblem";
import LoginPage from "./Pages/Loginpage";
import RecordsPage from "./Pages/RecordsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/ReportProblem" element={<ReportProblem />} />
        <Route path="/resolved" element={<RecordsPage mode="resolved" />} />
        <Route path="/history" element={<RecordsPage mode="history" />} />
      </Routes> 
    </BrowserRouter>
  );
}

export default App;
