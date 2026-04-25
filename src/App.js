import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./Login";
import Dashboard from "./dashboard";
import Appointment from "./Appointment";
import MainLayout from "./MainLayout";
import PatientList from './PatientList';
import PrescriptionForm from './PrescriptionForm'; 
/* Các trang mới */
import MedicalRecords from "./MedicalRecords";
import Doctors from "./Doctors";
import Billing from "./Billing";
import NurseDashboard from "./NurseDashboard";

import "./App.css";

function App() {

  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user"))
  );

  const handleLogin = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <Router>
      <MainLayout user={user} onLogout={handleLogout}>

        <Routes>

          {/* Nếu CHƯA đăng nhập */}
          {!user ? (
            <>
              <Route
                path="/login"
                element={<Login onLoginSuccess={handleLogin} />}
              />

              <Route path="*" element={<Navigate to="/login" />} />
            </>
          ) : (

            /* Nếu ĐÃ đăng nhập */
            <>
              <Route path="/dashboard" element={<Dashboard />} /> 

              <Route
                path="/appointment"
                element={<Appointment />}
              />
              <Route path="/patientList" element={<PatientList />} /> {/* Route cho Lab 6 */}
              <Route path="/medical" element={<MedicalRecords />} /> {/* Route cho Lab 7 */}
              <Route path="/prescription" element={<PrescriptionForm/>} /> {/* Route cho Lab 8 */}
              <Route path="/billing" element={<Billing/>} /> {/* Route cho Lab 9 */}
              <Route path="/NurseDashboard" element={<NurseDashboard/>} /> 
              <Route path="/PrescriptionForm" element={<PrescriptionForm/>} /> 
              <Route
                path="/doctors"
                element={<Doctors />}
              />

              

              <Route path="*" element={<Navigate to="/dashboard" />} />
            </>
          )}

        </Routes>

      </MainLayout>
    </Router>
  );
}

export default App;