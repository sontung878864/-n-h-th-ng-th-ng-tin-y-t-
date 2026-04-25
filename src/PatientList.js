import React, { useState, useEffect } from 'react';

const premiumStyles = `
  :root {
    --bg-deep: #0f172a;
    --card-glass: rgba(255, 255, 255, 0.05);
    --border-glass: rgba(255, 255, 255, 0.1);
    --accent-blue: #38bdf8;
    --accent-purple: #818cf8;
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --accent-red: #f43f5e;
  }

  .dashboard-wrapper {
    min-height: 100vh; background: var(--bg-deep); color: var(--text-primary);
    font-family: 'Plus Jakarta Sans', sans-serif; display: flex; position: relative; overflow-x: hidden;
  }

  .bg-blur-elements { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
  .circle { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.15; }
  .circle-1 { top: -10%; right: -5%; width: 500px; height: 500px; background: var(--accent-blue); }
  .circle-2 { bottom: 0%; left: 10%; width: 400px; height: 400px; background: var(--accent-purple); }

  .dashboard-content { 
    flex: 1; padding: 40px; position: relative; max-width: 1400px; margin: 0 auto; z-index: 5; 
  }
  
  .content-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
  .welcome-text h1 { font-size: 32px; font-weight: 800; margin: 0; }
  .welcome-text h1 span { color: var(--accent-blue); }
  .welcome-text p { color: var(--text-secondary); margin: 5px 0 0; }
  
  .stat-pill { background: var(--card-glass); padding: 10px 25px; border-radius: 50px; border: 1px solid var(--border-glass); display: flex; align-items: center; gap: 10px; }
  .stat-pill .value { font-size: 24px; font-weight: 800; color: var(--accent-blue); }
  .stat-pill .label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); }

  .header-actions-row { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 30px; }
  .premium-search { position: relative; flex: 1; max-width: 400px; }
  .premium-search input { 
    width: 100%; background: var(--card-glass); border: 1px solid var(--border-glass); border-radius: 14px; 
    padding: 12px 15px 12px 45px; color: white; outline: none; transition: 0.3s;
  }
  .premium-search input:focus { border-color: var(--accent-blue); background: rgba(255,255,255,0.08); }
  .search-symbol { position: absolute; left: 15px; top: 12px; color: var(--text-secondary); }

  .add-patient-btn { 
    background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: var(--bg-deep); border: none; 
    padding: 0 25px; border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.3s;
  }
  .add-patient-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(56, 189, 248, 0.4); }

  .table-container-premium { background: var(--card-glass); border-radius: 24px; border: 1px solid var(--border-glass); overflow: hidden; backdrop-filter: blur(10px); }
  .data-table { width: 100%; border-collapse: collapse; }
  .data-table th { text-align: left; padding: 20px; background: rgba(255,255,255,0.03); font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; }
  .data-table td { padding: 18px 20px; border-bottom: 1px solid var(--border-glass); }

  .patient-info { display: flex; align-items: center; gap: 12px; }
  .p-avatar { width: 40px; height: 40px; border-radius: 12px; background: var(--accent-blue); color: var(--bg-deep); display: flex; align-items: center; justify-content: center; font-weight: 800; }
  .patient-name { font-weight: 700; color: var(--text-primary); }

  .diagnosis-box { font-size: 14px; color: #e2e8f0; font-weight: 500; }

  .progress-section { width: 180px; }
  .progress-labels { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .p-status-tag { font-size: 10px; padding: 3px 10px; border-radius: 50px; font-weight: 700; }
  .p-status-tag.active { background: #0ea5e920; color: var(--accent-blue); }
  .p-status-tag.done { background: #10b98120; color: #10b981; }
  .session-count { font-size: 11px; color: var(--text-secondary); font-weight: 600; }
  .progress-track { height: 6px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple)); }

  .phone-badge { font-family: monospace; font-size: 14px; color: var(--text-secondary); }

  .action-group-row { display: flex; justify-content: flex-end; gap: 8px; }
  .btn-confirm-session-small { background: var(--text-primary); color: var(--bg-deep); border: none; padding: 6px 12px; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer; }
  .btn-details-small { background: transparent; border: 1px solid var(--border-glass); color: var(--text-primary); padding: 6px 12px; border-radius: 8px; font-size: 12px; cursor: pointer; }
  .btn-delete-small { background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.2); color: var(--accent-red); padding: 6px 12px; border-radius: 8px; font-size: 12px; cursor: pointer; transition: 0.3s; }
  .btn-delete-small:hover { background: var(--accent-red); color: white; }

  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(5px); }
  .modal-premium { background: #1e293b; padding: 30px; border-radius: 24px; width: 450px; border: 1px solid var(--border-glass); }
  .form-grid { display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 20px; }
  .modal-premium input, .modal-premium select { padding: 12px; border-radius: 10px; border: 1px solid var(--border-glass); background: #0f172a; color: white; outline: none; }
  .modal-btns { display: flex; gap: 10px; }
  .modal-btns button { flex: 1; padding: 12px; border-radius: 10px; border: none; cursor: pointer; font-weight: 700; }
  .modal-btns button.save { background: var(--accent-blue); color: var(--bg-deep); }
`;

const OrthoProPatientManager = () => {
  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem('ortho_pro_clinic_db');
    return saved ? JSON.parse(saved) : [
      { PatientID: 1, Name: "Nguyễn Minh Anh", DOB: "1995-05-15", Phone: "090.123.4567", Address: "Quận 1, TP.HCM", Diagnosis: "Thoát vị đĩa đệm L4-L5", CurrentSession: 3, TotalSessions: 10, Status: "Đang trị liệu" },
      { PatientID: 2, Name: "Trần Hoàng Nam", DOB: "1988-10-20", Phone: "098.765.4321", Address: "Quận 7, TP.HCM", Diagnosis: "Thoái hóa khớp gối (Giai đoạn 2)", CurrentSession: 10, TotalSessions: 10, Status: "Hoàn tất" }
    ];
  });

  useEffect(() => {
    localStorage.setItem('ortho_pro_clinic_db', JSON.stringify(patients));
  }, [patients]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [patientFormData, setPatientFormData] = useState({ Name: '', DOB: '', Address: '', Phone: '', Diagnosis: '', TotalSessions: 10, CurrentSession: 0, Status: 'Chờ khám' });

  // Thao tác lưu
  const handleSavePatient = (e) => {
    e.preventDefault();
    if (editingId) {
      setPatients(patients.map(p => p.PatientID === editingId ? { ...patientFormData, PatientID: editingId } : p));
    } else {
      setPatients([{ ...patientFormData, PatientID: Date.now() }, ...patients]);
    }
    closeModal();
  };

  // Thao tác cập nhật buổi
  const handleUpdateSession = (id) => {
    setPatients(patients.map(p => {
      if (p.PatientID === id && p.CurrentSession < p.TotalSessions) {
        const nextSession = p.CurrentSession + 1;
        return { ...p, CurrentSession: nextSession, Status: nextSession === p.TotalSessions ? "Hoàn tất" : "Đang trị liệu" };
      }
      return p;
    }));
  };

  // --- THAO TÁC XÓA ---
  const handleDeletePatient = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hồ sơ bệnh nhân này không?")) {
      setPatients(patients.filter(p => p.PatientID !== id));
    }
  };

  const closeModal = () => {
    setShowForm(false);
    setEditingId(null);
    setPatientFormData({ Name: '', DOB: '', Address: '', Phone: '', Diagnosis: '', TotalSessions: 10, CurrentSession: 0, Status: 'Chờ khám' });
  };

  const filteredPatients = patients.filter(p => 
    p.Name.toLowerCase().includes(search.toLowerCase()) || p.Phone.includes(search)
  );

  return (
    <div className="dashboard-wrapper">
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{premiumStyles}</style>
      
      <div className="bg-blur-elements">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
      </div>

      <main className="dashboard-content">
        <header className="content-header">
          <div className="welcome-text">
            <h1>Y HỌC CỔ TRUYỀN PHƯỚC TÂM <span></span></h1>
            <p>Hệ thống Quản lý Hồ sơ Bệnh án & Phục hồi Chức năng</p>
          </div>
          <div className="header-actions">
            <div className="stat-pill">
              <span className="value">{patients.length}</span>
              <span className="label">Hồ sơ</span>
            </div>
          </div>
        </header>

        <section className="header-actions-row">
          <div className="premium-search">
            <span className="search-symbol">🔍</span>
            <input 
              type="text" 
              placeholder="Tìm tên bệnh nhân hoặc số điện thoại..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="add-patient-btn" onClick={() => setShowForm(true)}>
            + Đăng ký bệnh nhân mới
          </button>
        </section>

        <section className="table-container-premium">
          <table className="data-table">
            <thead>
              <tr>
                <th>HỌ TÊN BỆNH NHÂN</th>
                <th>CHẨN ĐOÁN</th>
                <th>TIẾN ĐỘ LIỆU TRÌNH</th>
                <th>SỐ ĐIỆN THOẠI</th>
                <th style={{textAlign: 'right'}}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map(p => (
                  <tr key={p.PatientID}>
                    <td>
                      <div className="patient-info">
                        <div className="p-avatar">{p.Name.charAt(0)}</div>
                        <div className="patient-name">{p.Name}</div>
                      </div>
                    </td>
                    <td><div className="diagnosis-box">🏥 {p.Diagnosis}</div></td>
                    <td>
                      <div className="progress-section">
                        <div className="progress-labels">
                          <span className={`p-status-tag ${p.Status === 'Hoàn tất' ? 'done' : 'active'}`}>{p.Status}</span>
                          <span className="session-count">Buổi {p.CurrentSession}/{p.TotalSessions}</span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${(p.CurrentSession/p.TotalSessions)*100}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td><div className="phone-badge">{p.Phone}</div></td>
                    <td>
                      <div className="action-group-row">
                        <button className="btn-confirm-session-small" title="Thêm 1 buổi" onClick={() => handleUpdateSession(p.PatientID)}>+Buổi</button>
                        <button className="btn-details-small" onClick={() => {
                          setEditingId(p.PatientID);
                          setPatientFormData({...p});
                          setShowForm(true);
                        }}>Sửa</button>
                        {/* NÚT XÓA MỚI THÊM */}
                        <button className="btn-delete-small" onClick={() => handleDeletePatient(p.PatientID)}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="empty-state">Không có bệnh nhân nào.</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </main>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-premium">
            <h2>{editingId ? "Cập Nhật Hồ Sơ" : "Đăng Ký Mới"}</h2>
            <form onSubmit={handleSavePatient}>
              <div className="form-grid">
                <input required placeholder="Họ và tên" value={patientFormData.Name} onChange={e => setPatientFormData({...patientFormData, Name: e.target.value})} />
                <input type="date" value={patientFormData.DOB} onChange={e => setPatientFormData({...patientFormData, DOB: e.target.value})} />
                <input required placeholder="Số điện thoại" value={patientFormData.Phone} onChange={e => setPatientFormData({...patientFormData, Phone: e.target.value})} />
                <input placeholder="Chẩn đoán" value={patientFormData.Diagnosis} onChange={e => setPatientFormData({...patientFormData, Diagnosis: e.target.value})} />
                <input type="number" placeholder="Tổng số buổi" value={patientFormData.TotalSessions} onChange={e => setPatientFormData({...patientFormData, TotalSessions: parseInt(e.target.value)})} />
                <select value={patientFormData.Status} onChange={e => setPatientFormData({...patientFormData, Status: e.target.value})}>
                  <option value="Chờ khám">Chờ khám</option>
                  <option value="Đang trị liệu">Đang trị liệu</option>
                  <option value="Hoàn tất">Hoàn tất</option>
                </select>
              </div>
              <div className="modal-btns">
                <button type="button" onClick={closeModal}>Hủy</button>
                <button type="submit" className="save">Lưu hồ sơ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrthoProPatientManager;