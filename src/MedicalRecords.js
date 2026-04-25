import React, { useState, useEffect } from 'react';

// --- DỮ LIỆU ---
const INITIAL_PENDING = [
  { id: 201, name: "Nguyễn Văn An", age: 45, gender: "Nam", reason: "Đau lưng dưới cấp tính, lan xuống chân" },
  { id: 202, name: "Trần Thị Bình", age: 62, gender: "Nữ", reason: "Hạn chế vận động sau phẫu thuật thay khớp gối" },
  { id: 203, name: "Lê Hoàng Nam", age: 19, gender: "Nam", reason: "Chấn thương lật cổ chân khi đá bóng" },
];

const MEDICINES = [
  { id: 'm1', name: 'Celecoxib 200mg', unit: 'Viên' },
  { id: 'm2', name: 'Decontractyl 250mg', unit: 'Viên' },
  { id: 'm3', name: 'Glucosamine Sulfate', unit: 'Viên' },
  { id: 'm4', name: 'Dán Salonpas GelPatch', unit: 'Miếng' },
  { id: 'm5', name: 'Băng thun y tế (10cm)', unit: 'Cuộn' },
];

const MedicalRecords = () => {
  const [pendingList, setPendingList] = useState(INITIAL_PENDING);
  const [historyList, setHistoryList] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [step, setStep] = useState(1); 
  const [isEditing, setIsEditing] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState(null);
  const [diagnosis, setDiagnosis] = useState({ reason: '', cause: '', note: '' });
  const [selectedMeds, setSelectedMeds] = useState([]);
  
  // New States cho trải nghiệm chuyên nghiệp
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Xử lý bắt đầu khám với hiệu ứng chuyển cảnh
  const handleStartExam = (patient) => {
    setIsEditing(false);
    setSelectedApp(patient);
    setDiagnosis({ reason: patient.reason, cause: '', note: '' });
    setStep(1);
    setSelectedMeds([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditRecord = (record) => {
    setIsEditing(true);
    setCurrentRecordId(record.recordId);
    setSelectedApp({ id: record.patientId, name: record.patientName, age: record.age, gender: record.gender });
    setDiagnosis({ reason: record.diagnosis, cause: record.cause, note: '' });
    setSelectedMeds(record.medsDetail || []);
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddMed = (med) => {
    if (selectedMeds.find(m => m.id === med.id)) return;
    setSelectedMeds([...selectedMeds, { ...med, quantity: 1, usage: 'Uống sau ăn' }]);
  };

  // Logic Hoàn tất với hiệu ứng chờ và màn hình thành công
  const handleComplete = () => {
    setIsSaving(true);
    
    // Giả lập thời gian xử lý dữ liệu (Server Delay)
    setTimeout(() => {
      if (isEditing) {
        const updatedHistory = historyList.map(h => {
          if (h.recordId === currentRecordId) {
            return { ...h, diagnosis: diagnosis.reason, cause: diagnosis.cause, medsCount: selectedMeds.length, medsDetail: selectedMeds };
          }
          return h;
        });
        setHistoryList(updatedHistory);
      } else {
        const newRecord = {
          recordId: Date.now(),
          patientName: selectedApp.name,
          patientId: selectedApp.id,
          age: selectedApp.age,
          gender: selectedApp.gender,
          diagnosis: diagnosis.reason,
          cause: diagnosis.cause,
          medsCount: selectedMeds.length,
          medsDetail: selectedMeds,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        setHistoryList([newRecord, ...historyList]);
        setPendingList(pendingList.filter(p => p.id !== selectedApp.id));
      }
      
      setIsSaving(false);
      setShowSuccess(true);
      
      // Tự động đóng màn hình thành công sau 2s
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedApp(null);
        setIsEditing(false);
      }, 2000);
    }, 800);
  };

  return (
    <div className="medical-os-container">
      <style>{professionalV3Theme}</style>
      
      {/* Overlay Thông báo Thành công */}
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-card">
            <div className="check-icon">✓</div>
            <h3>{isEditing ? "Cập nhật thành công!" : "Lưu hồ sơ hoàn tất!"}</h3>
            <p>Dữ liệu đã được đồng bộ vào hệ thống quản lý.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <nav className="top-nav">
        <div className="nav-left">
          <div className="brand-icon">✚</div>
          <div className="brand-text">
            <h2>Y HỌC CỔ TRUYỀN PHƯỚC TÂM <span className="highlight"></span></h2>
            <span>HỒ SƠ BỆNH ÁN </span>
          </div>
        </div>
        <div className="nav-right">
            <div className="search-box">
                <input type="text" placeholder="" />
            </div>
          <div className="user-info">
          
         
          </div>
        </div>
      </nav>

      <div className="workspace">
        {/* Sidebar */}
        <aside className="patient-sidebar">
          <div className="sidebar-header">
            <div className="title-row">
              <h3>TIẾP NHẬN MỚI</h3>
              <span className="count-badge">{pendingList.length}</span>
            </div>
          </div>
          <div className="patient-list">
            {pendingList.map(p => (
              <div 
                key={p.id} 
                className={`patient-item ${selectedApp?.id === p.id && !isEditing ? 'selected' : ''}`}
                onClick={() => handleStartExam(p)}
              >
                <div className="patient-avatar">{p.name.charAt(0)}</div>
                <div className="patient-meta">
                  <div className="name">{p.name}</div>
                  <div className="sub">ID: {p.id} • {p.age}t • {p.gender}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Khu vực chính */}
        <main className="main-content">
          {selectedApp ? (
            <div className="exam-card animate-slide-in">
              <div className="card-header">
                <div className="patient-summary">
                  <div className="status-label">{isEditing ? "CHẾ ĐỘ CHỈNH SỬA" : "ĐANG KHÁM"}</div>
                  <h2>{selectedApp.name} <span className="id-text">#{selectedApp.id}</span></h2>
                </div>
                <button className="close-x" onClick={() => setSelectedApp(null)}>✕</button>
              </div>

              <div className="exam-steps">
                <div className={`step-pill ${step === 1 ? 'active' : 'completed'}`} onClick={() => setStep(1)}>
                  <span className="step-no">{step > 1 ? "✓" : "1"}</span> Chẩn đoán & Lâm sàng
                </div>
                <div className="step-arrow"></div>
                <div className={`step-pill ${step === 2 ? 'active' : ''}`} onClick={() => setStep(2)}>
                  <span className="step-no">2</span> Đơn thuốc & Vật tư
                </div>
              </div>

              <div className="card-body">
                {step === 1 ? (
                  <div className="form-layout">
                    <div className="input-block">
                      <label>Triệu chứng & Lý do vào viện</label>
                      <textarea 
                        value={diagnosis.reason}
                        onChange={e => setDiagnosis({...diagnosis, reason: e.target.value})}
                      />
                    </div>
                    <div className="input-block">
                      <label>Kết luận chẩn đoán chuyên khoa</label>
                      <textarea 
                        className="highlight-input"
                        placeholder="VD: Thoái hóa đốt sống cổ C5-C6..."
                        value={diagnosis.cause}
                        onChange={e => setDiagnosis({...diagnosis, cause: e.target.value})}
                      />
                    </div>
                    <div className="action-row-end">
                      <button className="btn-next" onClick={() => setStep(2)}>Kê đơn thuốc ➔</button>
                    </div>
                  </div>
                ) : (
                  <div className="form-layout">
                    <div className="prescription-grid">
                      <div className="med-inventory">
                        <label>Kho thuốc nhanh</label>
                        <div className="med-tags">
                          {MEDICINES.map(m => (
                            <button key={m.id} onClick={() => handleAddMed(m)} className="tag-item">
                              + {m.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="selected-meds">
                        <label>Toa thuốc chỉ định ({selectedMeds.length})</label>
                        <div className="med-list-container">
                          {selectedMeds.length > 0 ? selectedMeds.map((m, i) => (
                            <div key={i} className="med-record">
                              <span className="m-name">{m.name}</span>
                              <div className="m-controls">
                                <input type="number" defaultValue={1} />
                                <span className="m-unit">{m.unit}</span>
                                <button className="m-remove" onClick={() => setSelectedMeds(selectedMeds.filter(x => x.id !== m.id))}>✕</button>
                              </div>
                            </div>
                          )) : <div className="empty-med">Chưa có chỉ định</div>}
                        </div>
                      </div>
                    </div>
                    <div className="action-row-between">
                      <button className="btn-back" onClick={() => setStep(1)}>← Quay lại</button>
                      <button className={`btn-save ${isSaving ? 'loading' : ''}`} onClick={handleComplete} disabled={isSaving}>
                        {isSaving ? "Đang xử lý..." : (isEditing ? "CẬP NHẬT HỒ SƠ" : "HOÀN TẤT PHIÊN KHÁM")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="idle-state">
              <div className="idle-hero">🩺</div>
              <h3>Sẵn sàng tiếp nhận bệnh nhân</h3>
              <p>Chọn bệnh nhân từ danh sách chờ bên trái để bắt đầu lập hồ sơ điều trị.</p>
            </div>
          )}
        </main>
      </div>

      {/* History Log */}
      <section className="history-section">
        <div className="section-header">
            <h3>LỊCH SỬ KHÁM TRONG NGÀY</h3>
        </div>
        <div className="table-overflow">
          <table className="v3-table">
            <thead>
              <tr>
                <th>THỜI GIAN</th>
                <th>BỆNH NHÂN</th>
                <th>CHẨN ĐOÁN</th>
                <th>CHỈ ĐỊNH</th>
                <th style={{textAlign: 'right'}}>QUẢN LÝ</th>
              </tr>
            </thead>
            <tbody>
              {historyList.map(h => (
                <tr key={h.recordId}>
                  <td className="time-col">{h.time}</td>
                  <td><strong>{h.patientName}</strong> <small>({h.age}t)</small></td>
                  <td><span className="diag-text">{h.diagnosis}</span></td>
                  <td><span className="med-badge">{h.medsCount} vật tư</span></td>
                  <td style={{textAlign: 'right'}}>
                    <button className="op-btn edit" onClick={() => handleEditRecord(h)}>Sửa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const professionalV3Theme = `
  :root {
    --accent: #6366f1;
    --success: #10b981;
    --bg: #0b0f1a;
    --surface: #151b2d;
    --border: rgba(255,255,255,0.06);
    --text: #f8fafc;
    --text-muted: #64748b;
  }

  /* Overlay Thành công */
  .success-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center; z-index: 1000;
  }
  .success-card {
    background: var(--surface); padding: 40px; border-radius: 24px; text-align: center;
    border: 1px solid var(--success); animation: scaleIn 0.3s ease-out;
  }
  .check-icon { 
    width: 60px; height: 60px; background: var(--success); color: white;
    border-radius: 50%; font-size: 30px; line-height: 60px; margin: 0 auto 20px;
  }

  .medical-os-container {
    background: var(--bg); color: var(--text); min-height: 100vh;
    font-family: 'Inter', system-ui, sans-serif;
  }

  .top-nav {
    padding: 15px 40px; background: #0f1423; border-bottom: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center;
  }
  .search-box input {
    background: #1e293b; border: 1px solid var(--border); border-radius: 8px;
    padding: 8px 15px; color: white; width: 300px;
  }

  .workspace { display: flex; padding: 30px 40px; gap: 30px; }

  /* Sidebar */
  .patient-sidebar { width: 320px; background: var(--surface); border-radius: 16px; border: 1px solid var(--border); }
  .sidebar-header { padding: 20px; border-bottom: 1px solid var(--border); }
  .count-badge { background: var(--accent); padding: 2px 8px; border-radius: 10px; font-size: 0.7rem; }
  .patient-item { 
    padding: 15px 20px; display: flex; align-items: center; gap: 15px; cursor: pointer; transition: 0.2s;
  }
  .patient-item:hover { background: rgba(255,255,255,0.03); }
  .patient-item.selected { background: rgba(99, 102, 241, 0.1); border-left: 4px solid var(--accent); }
  .patient-avatar { width: 40px; height: 40px; background: #1e293b; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

  /* Main Exam Card */
  .main-content { flex: 1; }
  .exam-card { background: var(--surface); border-radius: 20px; border: 1px solid var(--border); overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
  .card-header { padding: 30px 40px; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.01); }
  .status-label { font-size: 0.65rem; font-weight: 800; color: var(--accent); margin-bottom: 5px; }
  .id-text { color: var(--text-muted); font-size: 1rem; }
  .close-x { background: none; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer; }

  /* Stepper */
  .exam-steps { display: flex; padding: 0 40px; gap: 20px; margin-bottom: 30px; }
  .step-pill { 
    padding: 10px 20px; border-radius: 30px; background: #1e293b; font-size: 0.85rem; 
    color: var(--text-muted); display: flex; align-items: center; gap: 10px; cursor: pointer;
  }
  .step-pill.active { background: var(--accent); color: white; font-weight: bold; }
  .step-pill.completed { color: var(--success); }
  .step-no { width: 20px; height: 20px; border: 1px solid currentColor; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; }

  /* Forms */
  .card-body { padding: 0 40px 40px; }
  .input-block { margin-bottom: 25px; }
  .input-block label { display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px; }
  .input-block textarea { 
    width: 100%; height: 180px; background: #0b0f1a; border: 1px solid var(--border);
    border-radius: 12px; padding: 20px; color: white; font-family: inherit; resize: none;
  }
  .highlight-input { border-color: rgba(99, 102, 241, 0.3) !important; }

  /* Prescription */
  .prescription-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 30px; }
  .tag-item { 
    background: #1e293b; border: 1px solid var(--border); color: white; padding: 8px 15px; 
    border-radius: 8px; margin: 4px; cursor: pointer; font-size: 0.8rem;
  }
  .tag-item:hover { background: var(--accent); }
  .med-record { 
    display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border);
  }
  .m-controls input { width: 50px; background: #1e293b; border: none; color: white; text-align: center; border-radius: 4px; }
  .m-remove { background: none; border: none; color: #ef4444; margin-left: 15px; cursor: pointer; }

  /* Buttons */
  .btn-next, .btn-save { 
    background: var(--accent); color: white; border: none; padding: 15px 40px; border-radius: 12px; 
    font-weight: bold; cursor: pointer; transition: 0.2s;
  }
  .btn-save.loading { opacity: 0.7; cursor: not-allowed; }
  .btn-save:hover { filter: brightness(1.2); transform: translateY(-2px); }
  .btn-back { background: transparent; border: 1px solid var(--border); color: var(--text); padding: 15px 30px; border-radius: 12px; cursor: pointer; }

  /* History Table */
  .history-section { margin: 0 40px 40px; background: var(--surface); border-radius: 16px; border: 1px solid var(--border); }
  .section-header { padding: 20px 30px; border-bottom: 1px solid var(--border); }
  .v3-table { width: 100%; border-collapse: collapse; }
  .v3-table th { text-align: left; padding: 15px 30px; color: var(--text-muted); font-size: 0.75rem; }
  .v3-table td { padding: 20px 30px; border-bottom: 1px solid var(--border); }
  .time-col { color: var(--accent); font-weight: bold; }
  .med-badge { background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 10px; font-size: 0.8rem; }
  .op-btn { background: #1e293b; border: none; color: white; padding: 6px 15px; border-radius: 6px; cursor: pointer; }

  .idle-state { text-align: center; padding: 100px 0; color: var(--text-muted); }
  .idle-hero { font-size: 4rem; margin-bottom: 20px; opacity: 0.2; }

  @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .animate-slide-in { animation: slideIn 0.4s ease-out; }
  @keyframes slideIn { from { transform: translateX(30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
`;

export default MedicalRecords;