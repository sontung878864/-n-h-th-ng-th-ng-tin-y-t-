import React, { useState } from "react";
import "./App.css";

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 1. Tạo danh sách người dùng giả lập để test phân quyền (Lab 10)
  const mockUsers = [
    { id: 1, username: "admin", password: "123", role: "Admin" },
    { id: 2, username: "doctor", password: "123", role: "Doctor" },
    { id: 3, username: "nurse", password: "123", role: "Nurse" },
    { id: 4, username: "patient", password: "123", role: "Patient" },
  ];

  const handleLogin = (e) => {
    e.preventDefault();

  
    const foundUser = mockUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      // 3. Giả lập lưu Token và thông tin User như yêu cầu Lab 10 [cite: 214, 215]
      localStorage.setItem("token", "mock-jwt-token-for-lab-10");
      localStorage.setItem("user", JSON.stringify(foundUser));
      localStorage.setItem("role", foundUser.role); // Lưu role để phân quyền 

      alert(`Đăng nhập thành công! Vai trò: ${foundUser.role}`);
      
      // Gửi dữ liệu về App.js [cite: 212, 216]
      onLoginSuccess(foundUser);
    } else {
      setError("Tên đăng nhập hoặc mật khẩu giả lập không đúng ");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <div className="login-icon">🏥</div>
        <h2>PHÒNG KHÁM CHUYÊN KHOA Y HỌC CỔ TRUYỀN PHƯỚC TÂM</h2>
        <p className="login-subtitle"></p>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label>Tên đăng nhập</label>
            <input
              type="text"
              placeholder="admin, doctor, nurse, hoặc patient"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              placeholder="Nhập 123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login">
            Đăng nhập hệ thống
          </button>
        </form>

        {error && <p className="error-message" style={{ color: "red", marginTop: "10px" }}>{error}</p>}
        
        <div style={{ marginTop: "15px", fontSize: "12px", color: "#666" }}>
          * Gợi ý: Tài khoản <b>admin</b> mật khẩu <b>123</b>
        </div>
      </div>
    </div>
  );
};

export default Login;