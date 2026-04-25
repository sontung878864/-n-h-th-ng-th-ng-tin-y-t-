import React, { useState, useEffect } from 'react';

const INITIAL_DOCTORS = [
  { DoctorID: 1, FullName: "BS. Nguyễn Minh Đức", Specialization: "Tim Mạch", Phone: "0901234567", Email: "duc.nguyen@clinic.com", Experience: "15" },
  { DoctorID: 2, FullName: "BS. Lê Thị Phương", Specialization: "Nhi Khoa", Phone: "0912345678", Email: "phuong.le@clinic.com", Experience: "8" },
  { DoctorID: 3, FullName: "BS. Trần Hoàng Nam", Specialization: "Xương Khớp", Phone: "0987654321", Email: "nam.tran@clinic.com", Experience: "12" },
];

const DoctorList = () => {
  // Lấy dữ liệu từ LocalStorage hoặc dùng dữ liệu mẫu nếu chưa có
  const [doctors, setDoctors] = useState(() => {
    const saved = localStorage.getItem('mock_doctors');
    return saved ? JSON.parse(saved) : INITIAL_DOCTORS;
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [formData, setFormData] = useState({
    FullName: '',
    Specialization: '',
    Phone: '',
    Email: '',
    Experience: ''
  });

  // Lưu dữ liệu mỗi khi có thay đổi trong danh sách doctors
  useEffect(() => {
    localStorage.setItem('mock_doctors', JSON.stringify(doctors));
  }, [doctors]);

  // --- THAO TÁC DỮ LIỆU (MOCK) ---
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingId) {
      // Cập nhật bác sĩ hiện có
      setDoctors(doctors.map(d => d.DoctorID === editingId ? { ...formData, DoctorID: editingId } : d));
      alert("Cập nhật thông tin bác sĩ thành công!");
    } else {
      // Thêm bác sĩ mới
      const newDoctor = {
        ...formData,
        DoctorID: Date.now(), // Tạo ID duy nhất bằng timestamp
      };
      setDoctors([newDoctor, ...doctors]);
      alert("Đã thêm bác sĩ mới vào hệ thống!");
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({ FullName: '', Specialization: '', Phone: '', Email: '', Experience: '' });
  };

  const handleDelete = (id) => {
    if (window.confirm("Xác nhận xóa bác sĩ này khỏi hệ thống?")) {
      setDoctors(doctors.filter(d => d.DoctorID !== id));
    }
  };

  const startEdit = (d) => {
    setEditingId(d.DoctorID);
    setFormData({ ...d });
    setShowForm(true);
  };

  // --- BỘ LỌC TÌM KIẾM ---
  const filteredDoctors = doctors.filter(d =>
    (d.FullName || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.Specialization || "").toLowerCase().includes(search.toLowerCase())
  ).filter(d => {
    if (filterType === "all") return true;
    const exp = parseInt(d.Experience);
    return filterType === "senior" ? exp >= 10 : exp < 10;
  });

  return (
    <div className="admin-wrapper">
      <style>{cssStyles}</style>
      
      <div className="glass-card">
        <div className="dashboard-header">
          <div>
            <h2 className="main-title">QUẢN LÝ ĐỘI NGŨ BÁC SĨ</h2>
            <p className="subtitle">Tổng số: {doctors.length} chuyên gia y tế</p>
          </div>
          <button className="btn-add-new" onClick={() => { setShowForm(true); setEditingId(null); setFormData({FullName:'',Specialization:'',Phone:'',Email:'',Experience:''}) }}>
            <span className="icon">+</span> Thêm Bác Sĩ Mới
          </button>
        </div>

        <div className="filter-section">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm theo tên hoặc chuyên khoa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="modern-select"
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Tất cả kinh nghiệm</option>
            <option value="senior">Chuyên gia (≥ 10 năm)</option>
            <option value="junior">Tiềm năng (&lt; 10 năm)</option>
          </select>
        </div>

        <div className="table-container">
          <table className="doctor-table">
            <thead>
              <tr>
                <th>Thông tin bác sĩ</th>
                <th>Chuyên khoa</th>
                <th>Liên hệ</th>
                <th>Kinh nghiệm</th>
                <th style={{ textAlign: 'right' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.length > 0 ? filteredDoctors.map((d) => (
                <tr key={d.DoctorID} className="table-row">
                  <td>
                    <div className="dr-profile">
                      <div className="dr-avatar">{d.FullName.charAt(0)}</div>
                      <div>
                        <div className="dr-name">{d.FullName}</div>
                        <div className="dr-email">{d.Email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge-spec">{d.Specialization}</span></td>
                  <td><div className="dr-phone">{d.Phone}</div></td>
                  <td>
                    <div className="exp-badge">
                      <strong>{d.Experience}</strong> <span>năm</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-btns">
                      <button className="btn-icon edit" onClick={() => startEdit(d)} title="Sửa">📝</button>
                      <button className="btn-icon delete" onClick={() => handleDelete(d.DoctorID)} title="Xóa">🗑️</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="empty-state">Không tìm thấy bác sĩ nào khớp với điều kiện lọc</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM */}
      {showForm && (
        <div className="modal-backdrop">
          <div className="modal-box animate-pop">
            <div className="modal-header">
              <h3>{editingId ? "Cập Nhật Hồ Sơ" : "Hồ Sơ Bác Sĩ Mới"}</h3>
              <button className="close-x" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="doctor-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Họ và Tên</label>
                  <input required placeholder="VD: Nguyễn Văn A" value={formData.FullName} onChange={(e) => setFormData({ ...formData, FullName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Chuyên Khoa</label>
                  <input required placeholder="VD: Nội soi, Da liễu..." value={formData.Specialization} onChange={(e) => setFormData({ ...formData, Specialization: e.target.value })} />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Số Điện Thoại</label>
                  <input placeholder="09xxx" value={formData.Phone} onChange={(e) => setFormData({ ...formData, Phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Năm Kinh Nghiệm</label>
                  <input type="number" value={formData.Experience} onChange={(e) => setFormData({ ...formData, Experience: e.target.value })} />
                </div>
              </div>

              <div className="form-group full">
                <label>Địa chỉ Email</label>
                <input type="email" placeholder="bacsi@phongkham.com" value={formData.Email} onChange={(e) => setFormData({ ...formData, Email: e.target.value })} />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Hủy bỏ</button>
                <button type="submit" className="btn-submit-main">Lưu Hồ Sơ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const cssStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .admin-wrapper {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background-color: #f8fafc;
    min-height: 100vh;
    padding: 40px 20px;
  }

  .glass-card {
    max-width: 1100px;
    margin: 0 auto;
    background: white;
    border-radius: 24px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.04);
    border: 1px solid #f1f5f9;
    padding: 32px;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
  }

  .main-title { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -1px; }
  .subtitle { color: #64748b; margin-top: 5px; font-size: 14px; }

  .btn-add-new {
    background: #4f46e5;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: 0.3s;
    box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
  }
  .btn-add-new:hover { background: #4338ca; transform: translateY(-2px); }

  .filter-section {
    display: flex;
    gap: 15px;
    margin-bottom: 24px;
  }

  .search-box {
    flex: 1;
    position: relative;
  }
  .search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
  .search-box input {
    width: 100%;
    padding: 14px 14px 14px 45px;
    border-radius: 16px;
    border: 1.5px solid #e2e8f0;
    outline: none;
    transition: 0.3s;
    font-size: 14px;
  }
  .search-box input:focus { border-color: #4f46e5; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }

  .modern-select {
    padding: 0 20px;
    border-radius: 16px;
    border: 1.5px solid #e2e8f0;
    color: #475569;
    font-weight: 600;
    outline: none;
    cursor: pointer;
  }

  .table-container { overflow-x: auto; }
  .doctor-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
  .doctor-table th { 
    text-align: left; padding: 12px 20px; 
    color: #94a3b8; font-size: 12px; 
    text-transform: uppercase; font-weight: 800;
  }

  .table-row { transition: 0.2s; }
  .table-row td { 
    padding: 16px 20px; 
    background: #fff;
    border-top: 1px solid #f1f5f9;
    border-bottom: 1px solid #f1f5f9;
  }
  .table-row td:first-child { border-left: 1px solid #f1f5f9; border-radius: 16px 0 0 16px; }
  .table-row td:last-child { border-right: 1px solid #f1f5f9; border-radius: 0 16px 16px 0; }
  .table-row:hover td { background: #f8fafc; border-color: #e2e8f0; }

  .dr-profile { display: flex; align-items: center; gap: 15px; }
  .dr-avatar { 
    width: 44px; height: 44px; background: #e0e7ff; color: #4338ca;
    border-radius: 12px; display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 18px;
  }
  .dr-name { font-weight: 700; color: #1e293b; font-size: 15px; }
  .dr-email { font-size: 12px; color: #94a3b8; }

  .badge-spec {
    background: #f0fdf4; color: #16a34a;
    padding: 6px 12px; border-radius: 8px; font-weight: 700; font-size: 12px;
  }

  .exp-badge strong { font-size: 16px; color: #4f46e5; }
  .exp-badge span { font-size: 12px; color: #94a3b8; margin-left: 2px; }

  .action-btns { display: flex; gap: 10px; justify-content: flex-end; }
  .btn-icon {
    width: 38px; height: 38px; border-radius: 10px; border: none;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: 0.2s; font-size: 16px;
  }
  .btn-icon.edit { background: #f1f5f9; color: #475569; }
  .btn-icon.edit:hover { background: #e2e8f0; }
  .btn-icon.delete { background: #fef2f2; color: #ef4444; }
  .btn-icon.delete:hover { background: #fee2e2; }

  .modal-backdrop {
    position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000;
  }
  .modal-box { 
    background: white; width: 600px; border-radius: 28px; padding: 40px; 
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  }
  .animate-pop { animation: pop 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
  @keyframes pop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

  .modal-header { display: flex; justify-content: space-between; margin-bottom: 30px; }
  .modal-header h3 { margin: 0; font-size: 22px; font-weight: 800; color: #0f172a; }
  .close-x { background: none; border: none; font-size: 28px; color: #94a3b8; cursor: pointer; }

  .doctor-form { display: flex; flex-direction: column; gap: 20px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .form-group label { display: block; font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 8px; }
  .form-group input {
    width: 100%; padding: 12px 16px; border-radius: 12px; border: 1.5px solid #e2e8f0;
    box-sizing: border-box; outline: none; transition: 0.2s;
  }
  .form-group input:focus { border-color: #4f46e5; }

  .form-actions { display: flex; gap: 15px; margin-top: 15px; }
  .btn-cancel { flex: 1; padding: 14px; border-radius: 12px; border: none; font-weight: 700; cursor: pointer; background: #f1f5f9; color: #475569; }
  .btn-submit-main { flex: 2; padding: 14px; border-radius: 12px; border: none; font-weight: 700; cursor: pointer; background: #0f172a; color: white; }
  
  .empty-state { text-align: center; padding: 40px; color: #94a3b8; font-style: italic; }
`;

export default DoctorList;