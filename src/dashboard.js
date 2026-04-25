import React, { useState, useEffect } from "react";
import "./App.css";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 128,
    totalAppointments: 45,
    totalRevenue: 15250000,
    pendingActions: 12
  });

  // State quản lý Modal
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Dữ liệu giả định cho từng mục khi nhấp vào
  const detailsData = {
    patients: [
      { id: 1, name: "Nguyễn Văn A", age: 30, disease: "Viêm họng" },
      { id: 2, name: "Trần Thị B", age: 25, disease: "Khám định kỳ" },
      { id: 3, name: "Lê Văn C", age: 45, disease: "Đau dạ dày" },
    ],
    appointments: [
      { time: "08:00 AM", patient: "Lý Hoàng Nam", doctor: "BS. Hùng" },
      { time: "09:30 AM", patient: "Võ Thị Sáu", doctor: "BS. Thảo" },
    ],
    revenue: [
      { date: "07/04/2026", desc: "Thu phí khám nội", amount: "500,000" },
      { date: "07/04/2026", desc: "Xét nghiệm máu", amount: "1,200,000" },
    ]
  };

  const closeModal = () => setSelectedDetail(null);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>BẢNG ĐIỀU KHIỂN TRUNG TÂM</h2>
          <p className="subtitle">HỆ THỐNG QUẢN LÝ Y TẾ THÔNG MINH - PHÒNG KHÁM CHUYÊN KHOA Y HỌC CỔ TRUYỀN PHƯỚC TÂM</p>
        </div>
        <div className="current-date">📅 {new Date().toLocaleDateString('vi-VN')}</div>
      </div>

      {/* STATS GRID */}
      <div className="stats-grid">
        {/* Thẻ Bệnh Nhân */}
        <div className="stat-card blue clickable" onClick={() => setSelectedDetail({ title: "Danh sách bệnh nhân", type: "patients" })}>
          <div className="card-header">
            <span className="icon">👥</span>
            <span className="badge">+12%</span>
          </div>
          <div className="stat-info">
            <h3>{stats.totalPatients}</h3>
            <p>Tổng bệnh nhân</p>
          </div>
        </div>

        {/* Thẻ Lịch Hẹn */}
        <div className="stat-card green clickable" onClick={() => setSelectedDetail({ title: "Lịch hẹn hôm nay", type: "appointments" })}>
          <div className="card-header">
            <span className="icon">📅</span>
            <span className="badge">Hot</span>
          </div>
          <div className="stat-info">
            <h3>{stats.totalAppointments}</h3>
            <p>Lịch đặt khám</p>
          </div>
        </div>

        {/* Thẻ Doanh Thu */}
        <div className="stat-card gold clickable" onClick={() => setSelectedDetail({ title: "Chi tiết doanh thu", type: "revenue" })}>
          <div className="card-header">
            <span className="icon">💰</span>
          </div>
          <div className="stat-info">
            <h3>{stats.totalRevenue.toLocaleString()}</h3>
            <p>Doanh thu (VND)</p>
          </div>
        </div>

        <div className="stat-card red">
          <div className="card-header">
            <span className="icon">⚠️</span>
          </div>
          <div className="stat-info">
            <h3>{stats.pendingActions}</h3>
            <p>Yêu cầu chờ</p>
          </div>
        </div>
      </div>

      {/* CHI TIẾT GIAO DIỆN PHỤ */}
      <div className="dashboard-content-grid">
        <div className="content-card main-chart-placeholder">
          <h3>Biểu đồ hoạt động tuần</h3>
          <div className="placeholder-chart">
             {/* Giả lập biểu đồ bằng CSS */}
             <div className="bar" style={{height: '60%'}}></div>
             <div className="bar" style={{height: '80%'}}></div>
             <div className="bar" style={{height: '40%'}}></div>
             <div className="bar" style={{height: '90%'}}></div>
             <div className="bar" style={{height: '50%'}}></div>
          </div>
        </div>

        <div className="content-card">
          <h3>Nhân sự trực ca</h3>
          <div className="nurse-list">
             <div className="nurse-item">🟢 BS. Lê Mạnh Hùng</div>
             <div className="nurse-item">🟢 ĐD. Phạm Thanh Thảo</div>
             <div className="nurse-item">⚪ BS. Trần Đức Trung</div>
          </div>
        </div>
      </div>

      {/* MODAL CHI TIẾT KHI NHẤP VÀO CARD */}
      {selectedDetail && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h4>{selectedDetail.title}</h4>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            <div className="modal-body">
              <table className="detail-table">
                <thead>
                  {selectedDetail.type === 'patients' && <tr><th>ID</th><th>Họ tên</th><th>Tuổi</th><th>Bệnh lý</th></tr>}
                  {selectedDetail.type === 'appointments' && <tr><th>Giờ</th><th>Bệnh nhân</th><th>Bác sĩ</th></tr>}
                  {selectedDetail.type === 'revenue' && <tr><th>Ngày</th><th>Nội dung</th><th>Số tiền</th></tr>}
                </thead>
                <tbody>
                  {detailsData[selectedDetail.type]?.map((item, index) => (
                    <tr key={index}>
                      {Object.values(item).map((val, i) => <td key={i}>{val}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;