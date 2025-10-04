import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./Pages/homePage";
import ReportProblem from "./Pages/ReportProblem";
import LoginPage from "./Pages/Loginpage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/ReportProblem" element={<ReportProblem />} />
      </Routes> 
    </BrowserRouter>
  );
}

export default App;
