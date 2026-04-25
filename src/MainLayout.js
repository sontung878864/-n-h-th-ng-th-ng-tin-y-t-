import React from 'react';
import { NavLink } from 'react-router-dom';

const MainLayout = ({ user, onLogout, children }) => {
  const role = user?.role; 

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo-area">
          <div className="logo-icon">🏥</div>
          <div className="logo-text">
            <div className="logo-title">CLINIC ERP</div>
            <div className="logo-sub">Hospital System</div>
          </div>
        </div>

        {/* MENU ĐIỀU HƯỚNG */}
        <nav className="nav-menu">
          {user ? (
            <>
              {/* 1. ĐĂNG KÝ KHÁM: Chỉ hiện cho Patient, Staff, Admin (Ẩn với Doctor và Nurse) */}
              {(role === 'Patient' || role === 'Admin' || role === 'Staff') && (
                <NavLink to="/appointment" className="nav-item">
                  <span>🗓️</span> Đăng ký khám
                </NavLink>
              )}

              {/* 2. BỆNH ÁN: Chỉ hiện cho Doctor và Admin */}
              {(role === 'Doctor' || role === 'Admin') && (
                <NavLink to="/medical" className="nav-item">
                  <span>🗂️</span> Bệnh án
                </NavLink>
              )}

              {/* 3. MỤC DÀNH CHO NURSE (VÀ ADMIN): Hóa đơn & Y tá */}
              {(role === 'Nurse' || role === 'Admin') && (
                <>
                  <NavLink to="/billing" className="nav-item">
                    <span>💰</span> Quản lý hóa đơn
                  </NavLink>
                  
                </>
              )}

              {/* 4. CÁC MỤC QUẢN TRỊ KHÁC: Chỉ Admin và Staff thấy */}
              {(role === 'Admin' || role === 'Staff') && (
                <>
                  <NavLink to="/dashboard" className="nav-item">
                    <span>📊</span> Dashboard
                  </NavLink>
                  
                  <NavLink to="/patientList" className="nav-item">
                    <span>🧑‍🤝‍🧑</span> Quản lý Bệnh nhân
                  </NavLink>
                  <NavLink to="/PrescriptionForm" className="nav-item">
                    <span>🧑‍🤝‍🧑</span> Quản lý kho thuốc
                  </NavLink>
                </>
              )}
            </>
          ) : (
            <div className="nav-item active">🔑 Vui lòng đăng nhập</div>
          )}
        </nav>
      </aside>

      {/* MAIN AREA */}
      <div className="main-area">
        <header className="header">
          <div style={{ fontWeight: 600 }}>
            Quyền hạn: <span style={{ color: "#3b82f6" }}>{role}</span>
          </div>
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <span>Xin chào, <b>{user.username}</b></span>
              <button className="logout-btn" onClick={onLogout}>Đăng xuất</button>
            </div>
          )}
        </header>

        <main className="content-wrapper">
          <div className="card" style={{ maxWidth: user ? "100%" : "520px", margin: user ? "0" : "60px auto" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;