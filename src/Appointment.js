import React, { useState } from 'react';

// --- HỆ THỐNG STYLES "ULTRA PREMIUM" (GIỮ NGUYÊN & BỔ SUNG GIAO DIỆN PHỤC HỒI) ---
const stylesContent = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  :root {
    --bg-body: #020617;
    --card-bg: rgba(30, 41, 59, 0.5);
    --accent-blue: #38bdf8;
    --accent-purple: #818cf8;
    --accent-green: #22c55e;
    --accent-red: #f43f5e;
    --accent-focus: #fbbf24;
    --text-main: #f8fafc;
    --text-dim: #94a3b8;
    --border: rgba(255, 255, 255, 0.08);
  }

  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg-body); color: var(--text-main); font-family: 'Plus Jakarta Sans', sans-serif; }

  .main-wrapper { 
    max-width: 1200px; 
    margin: 0 auto; 
    padding: 60px 20px; 
    background: radial-gradient(circle at top right, #1e1b4b, #020617); 
    min-height: 100vh;
  }

  .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
  .stat-card { 
    background: var(--card-bg); border: 1px solid var(--border); border-radius: 20px; padding: 25px;
    backdrop-filter: blur(10px); transition: 0.3s;
  }
  .stat-card:hover { border-color: var(--accent-blue); transform: translateY(-5px); }
  .stat-label { color: var(--text-dim); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
  .stat-value { font-size: 36px; font-weight: 800; margin-top: 10px; }

  .content-card { 
    background: var(--card-bg); border: 1px solid var(--border); border-radius: 24px; 
    padding: 30px; backdrop-filter: blur(20px); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }

  .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }

  .premium-table { width: 100%; border-collapse: collapse; }
  .premium-table th { text-align: left; padding: 15px; color: var(--accent-blue); font-size: 11px; text-transform: uppercase; border-bottom: 2px solid var(--border); }
  .premium-table td { padding: 20px 15px; border-bottom: 1px solid var(--border); font-size: 15px; }

  .badge { padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 800; }
  .badge-waiting { background: rgba(56, 189, 248, 0.1); color: var(--accent-blue); }
  .badge-examining { background: rgba(129, 140, 248, 0.1); color: var(--accent-purple); }
  .badge-done { background: rgba(34, 197, 94, 0.1); color: var(--accent-green); }

  /* Style Timeline Phục hồi */
  .phase-track { display: flex; gap: 4px; margin-top: 8px; }
  .phase-segment { height: 6px; flex: 1; border-radius: 3px; background: rgba(255,255,255,0.1); }
  .phase-segment.active { background: var(--accent-blue); box-shadow: 0 0 10px var(--accent-blue); }
  .phase-segment.done { background: var(--accent-green); }

  .btn { border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s; font-family: inherit; }
  .btn-primary { background: var(--accent-blue); color: #020617; }
  
  .action-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: white; padding: 8px 16px; border-radius: 10px; cursor: pointer; transition: 0.2s; }
  .action-btn:hover { border-color: var(--accent-blue); color: var(--accent-blue); }

  input, select { 
    width: 100%; background: #1e293b; border: 1px solid var(--border); 
    padding: 15px; border-radius: 14px; color: white; margin-bottom: 20px; outline: none; transition: 0.3s;
  }
  input:focus, select:focus { border-color: var(--accent-focus); box-shadow: 0 0 15px rgba(251, 191, 36, 0.2); }
  label { display: block; margin-bottom: 8px; font-size: 12px; font-weight: 700; color: var(--accent-focus); text-transform: uppercase; }

  .modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(2, 6, 23, 0.9); backdrop-filter: blur(12px);
    display: flex; align-items: center; justify-content: center; z-index: 1000;
  }
  .modal-box { 
    background: #0f172a; border: 2px solid var(--accent-blue); border-radius: 32px; 
    padding: 40px; width: 480px; box-shadow: 0 0 40px rgba(56, 189, 248, 0.2);
  }
`;

const MedCoreERP = () => {
  const [patients, setPatients] = useState([
    { id: 'BN-8821', name: 'Nguyễn Minh Anh', diagnosis: 'Thoát vị đĩa đệm L4-L5', phone: '0901234567', status: 'EXAMINING', phase: 2, nextAppt: '2026-04-20' },
    { id: 'BN-1029', name: 'Trần Hoàng Nam', diagnosis: 'Thoái hóa khớp gối', phone: '0987654321', status: 'WAITING', phase: 1, nextAppt: '2026-04-18' }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ name: '', diagnosis: 'Thoát vị đĩa đệm', phone: '', status: 'WAITING', phase: 1, nextAppt: '' });

  const stats = {
    total: patients.length,
    active: patients.filter(p => p.status === 'EXAMINING').length,
    done: patients.filter(p => p.status === 'DONE').length
  };

  const openModal = (patient = null) => {
    if (patient) {
      setEditData(patient);
      setForm(patient);
    } else {
      setEditData(null);
      setForm({ name: '', diagnosis: 'Thoát vị đĩa đệm', phone: '', status: 'WAITING', phase: 1, nextAppt: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.phone) return alert("Vui lòng điền đủ thông tin!");
    if (editData) {
      setPatients(patients.map(p => p.id === editData.id ? { ...form } : p));
    } else {
      const newId = 'BN-' + Math.floor(1000 + Math.random() * 9000);
      setPatients([{ ...form, id: newId }, ...patients]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="layout">
      <style>{stylesContent}</style>
      
      <main className="main-wrapper">
        <header style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '36px', margin: 0, fontWeight: 800 }}>
             Y HỌC CỔ TRUYỀN PHƯỚC TÂM
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '10px' }}>Hệ thống quản lý phục hồi chức năng chuyên sâu</p>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Tổng bệnh nhân</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card" style={{borderBottom: '4px solid var(--accent-purple)'}}>
            <div className="stat-label">Đang trị liệu</div>
            <div className="stat-value" style={{color: '#818cf8'}}>{stats.active}</div>
          </div>
          <div className="stat-card" style={{borderBottom: '4px solid var(--accent-green)'}}>
            <div className="stat-label">Hoàn tất giai đoạn</div>
            <div className="stat-value" style={{color: '#22c55e'}}>{stats.done}</div>
          </div>
        </div>

        <div className="content-card">
          <div className="header-actions">
            <h3 style={{ margin: 0, fontSize: '20px' }}>Danh sách phác đồ & Tái khám</h3>
            <button className="btn btn-primary" onClick={() => openModal()}>+ Tiếp nhận bệnh nhân</button>
          </div>

          <table className="premium-table">
            <thead>
              <tr>
                <th>Bệnh nhân</th>
                <th>Kế hoạch phục hồi</th>
                <th>Hẹn tái khám</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Quản lý</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '16px' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>ID: {p.id}</div>
                  </td>
                  <td>
                    <div style={{ color: '#38bdf8', fontWeight: 500, fontSize: '13px' }}>{p.diagnosis}</div>
                    <div className="phase-track">
                      {[1, 2, 3, 4].map(s => (
                        <div key={s} className={`phase-segment ${p.phase >= s ? (p.phase > s ? 'done' : 'active') : ''}`} title={`Giai đoạn ${s}`} />
                      ))}
                    </div>
                    <div style={{fontSize: '10px', color: '#64748b', marginTop: '4px'}}>Giai đoạn hiện tại: {p.phase}/4</div>
                  </td>
                  <td>
                    <div style={{ color: '#fbbf24', fontWeight: 700 }}>{p.nextAppt || 'Chưa hẹn'}</div>
                  </td>
                  <td>
                    <span className={`badge badge-${p.status.toLowerCase()}`}>
                      {p.status === 'WAITING' ? 'CHỜ KHÁM' : p.status === 'EXAMINING' ? 'ĐANG TRỊ LIỆU' : 'XUẤT VIỆN'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="action-btn" onClick={() => openModal(p)}>Sửa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>{editData ? 'Cập nhật phác đồ' : 'Tiếp nhận mới'}</h3>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
              <div>
                <label>Họ và tên</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label>Số điện thoại</label>
                <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
            </div>

            <label>Chẩn đoán & Dịch vụ</label>
            <select value={form.diagnosis} onChange={e => setForm({...form, diagnosis: e.target.value})}>
              <option value="Thoát vị đĩa đệm">Thoát vị đĩa đệm</option>
              <option value="Thoái hóa khớp">Thoái hóa khớp</option>
              <option value="Vật lý trị liệu">Vật lý trị liệu</option>
              <option value="Châm cứu trị liệu">Châm cứu trị liệu</option>
            </select>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
              <div>
                <label>Giai đoạn phục hồi</label>
                <select value={form.phase} onChange={e => setForm({...form, phase: parseInt(e.target.value)})}>
                  <option value="1">GĐ 1: Giảm đau cấp</option>
                  <option value="2">GĐ 2: Trị liệu chuyên sâu</option>
                  <option value="3">GĐ 3: Phục hồi chức năng</option>
                  <option value="4">GĐ 4: Duy trì ổn định</option>
                </select>
              </div>
              <div>
                <label>Ngày hẹn tái khám</label>
                <input type="date" value={form.nextAppt} onChange={e => setForm({...form, nextAppt: e.target.value})} />
              </div>
            </div>

            <label>Trạng thái hồ sơ</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
              <option value="WAITING">Đang chờ khám</option>
              <option value="EXAMINING">Đang điều trị</option>
              <option value="DONE">Hoàn tất / Xuất viện</option>
            </select>

            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSave}>Cập nhật phác đồ</button>
              <button className="btn" style={{ flex: 1, background: '#1e293b', color: 'white' }} onClick={() => setIsModalOpen(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedCoreERP;