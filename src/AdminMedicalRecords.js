import React, { useState, useEffect } from 'react';
import axios from 'axios';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .amr-wrapper {
    font-family: 'Plus Jakarta Sans', sans-serif;
    max-width: 1100px;
    margin: 0 auto;
  }

  .amr-header { margin-bottom: 20px; }
  .amr-header h2 { font-size: 1.4rem; font-weight: 700; color: #0f4c75; margin: 0 0 4px; }
  .amr-header p { color: #6b7280; font-size: 13px; margin: 0; }

  /* TOOLBAR */
  .amr-toolbar {
    display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
    background: white; border-radius: 14px; padding: 14px 18px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06); border: 1px solid #f0f0f0;
    flex-wrap: wrap;
  }
  .amr-search-wrap { position: relative; flex: 1; min-width: 200px; }
  .amr-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 14px; pointer-events: none; }
  .amr-search-input {
    width: 100%; padding: 9px 14px 9px 36px; border: 1.5px solid #e5e7eb; border-radius: 8px;
    font-size: 13px; font-family: inherit; color: #111827; background: #fafafa;
    outline: none; transition: all 0.2s; box-sizing: border-box;
  }
  .amr-search-input:focus { border-color: #0f4c75; background: white; box-shadow: 0 0 0 3px rgba(15,76,117,0.08); }
  .amr-search-clear {
    position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
    background: #e5e7eb; border: none; border-radius: 50%; width: 18px; height: 18px;
    font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;
    color: #6b7280; transition: all 0.2s;
  }
  .amr-search-clear:hover { background: #e53e3e; color: white; }

  .amr-date-input {
    padding: 9px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px;
    font-size: 13px; font-family: inherit; color: #111827; background: #fafafa;
    outline: none; transition: all 0.2s; cursor: pointer;
  }
  .amr-date-input:focus { border-color: #0f4c75; background: white; }

  .amr-btn-today {
    padding: 9px 14px; background: #ebf8ff; color: #0f4c75;
    border: 1.5px solid #bee3f8; border-radius: 8px; font-size: 12px;
    font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s; white-space: nowrap;
  }
  .amr-btn-today:hover { background: #0f4c75; color: white; border-color: #0f4c75; }

  .amr-btn-all {
    padding: 9px 14px; background: #f3f4f6; color: #374151;
    border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 12px;
    font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s; white-space: nowrap;
  }
  .amr-btn-all:hover { background: #e5e7eb; }

  .amr-total { margin-left: auto; font-size: 12px; color: #6b7280; white-space: nowrap; }
  .amr-total b { color: #0f4c75; }

  /* DATE GROUP */
  .amr-date-group { margin-bottom: 24px; }
  .amr-date-label {
    display: flex; align-items: center; gap: 10px;
    font-size: 13px; font-weight: 700; color: #0f4c75;
    margin-bottom: 10px; padding-bottom: 8px;
    border-bottom: 2px solid #ebf8ff;
  }
  .amr-date-count {
    background: #0f4c75; color: white; font-size: 11px; font-weight: 700;
    padding: 2px 10px; border-radius: 20px;
  }

  /* RECORD CARD */
  .amr-record-card {
    background: white; border: 1.5px solid #e5e7eb; border-radius: 14px;
    margin-bottom: 10px; overflow: hidden; transition: all 0.2s;
  }
  .amr-record-card:hover { border-color: #bee3f8; box-shadow: 0 4px 16px rgba(15,76,117,0.08); }

  .amr-record-header {
    display: flex; align-items: center; gap: 14px; padding: 16px 18px;
    cursor: pointer;
  }

  .amr-patient-avatar {
    width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, #0f4c75, #1b6ca8);
    display: flex; align-items: center; justify-content: center;
    font-size: 17px; font-weight: 700; color: white;
  }

  .amr-record-info { flex: 1; min-width: 0; }
  .amr-patient-name { font-size: 14px; font-weight: 700; color: #1a2e44; }
  .amr-record-meta { font-size: 12px; color: #6b7280; margin-top: 3px; display: flex; gap: 12px; flex-wrap: wrap; }
  .amr-record-meta span { display: flex; align-items: center; gap: 4px; }

  .amr-record-badges { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
  .amr-specialty-badge {
    font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px;
    background: #f0f9ff; color: #0369a1; border: 1px solid #bae6fd;
  }
  .amr-svc-badge {
    font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 10px;
  }
  .svc-normal { background: #f0fff4; color: #276749; }
  .svc-vip { background: #fffbeb; color: #92400e; }
  .svc-weekend { background: #f5f3ff; color: #5b21b6; }

  .amr-expand-icon { color: #9ca3af; font-size: 12px; flex-shrink: 0; transition: transform 0.2s; }
  .amr-expand-icon.open { transform: rotate(180deg); }

  /* EXPAND PANEL */
  .amr-record-panel {
    padding: 0 18px 18px; border-top: 1px solid #f0f0f0;
    animation: fadeIn 0.2s ease;
  }
  .amr-panel-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 14px; }
  .amr-panel-item { padding: 12px 14px; background: #f8fafc; border-radius: 10px; border: 1px solid #f0f0f0; }
  .amr-panel-label { font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .amr-panel-value { font-size: 13px; font-weight: 600; color: #1a2e44; line-height: 1.5; }
  .amr-panel-item.full { grid-column: span 3; }
  .amr-panel-item.half { grid-column: span 1; }

  /* EMPTY */
  .amr-empty { text-align: center; padding: 60px 20px; color: #9ca3af; }
  .amr-empty-icon { font-size: 52px; margin-bottom: 14px; opacity: 0.5; }
  .amr-empty-title { font-size: 15px; font-weight: 600; color: #374151; margin-bottom: 6px; }
  .amr-empty-sub { font-size: 13px; }

  /* LOADING */
  .amr-loading { text-align: center; padding: 48px; color: #9ca3af; font-size: 14px; }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

  @media (max-width: 700px) {
    .amr-toolbar { flex-direction: column; align-items: stretch; }
    .amr-panel-grid { grid-template-columns: 1fr 1fr; }
    .amr-panel-item.full { grid-column: span 2; }
  }
`;

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts[parts.length - 1].charAt(0).toUpperCase();
};

const fmtDate = (s) => {
  if (!s) return '—';
  const [y, m, d] = String(s).slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};

const fmtTime = (s) => {
  if (!s) return '';
  const d = new Date(s);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};

const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

const DOW_VI = ['Chủ nhật','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'];
const MONTHS_VI = ['tháng 1','tháng 2','tháng 3','tháng 4','tháng 5','tháng 6','tháng 7','tháng 8','tháng 9','tháng 10','tháng 11','tháng 12'];
const SVC_LABEL = { normal: 'Dịch vụ', vip: 'VIP', weekend: 'Ngoài giờ' };
const SVC_CLASS = { normal: 'svc-normal', vip: 'svc-vip', weekend: 'svc-weekend' };

const AdminMedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { fetchRecords(); }, []); // eslint-disable-line

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/api/admin/medical-records', config);
      setRecords(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Filter theo tên + ngày
  const filtered = records.filter(r => {
    const matchName = !search || r.PatientName?.toLowerCase().includes(search.toLowerCase());
    const matchDate = !filterDate || String(r.AppointmentDate).slice(0, 10) === filterDate;
    return matchName && matchDate;
  });

  // Group theo ngày khám
  const grouped = filtered.reduce((acc, r) => {
    const date = String(r.AppointmentDate).slice(0, 10);
    if (!acc[date]) acc[date] = [];
    acc[date].push(r);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a)); // mới nhất trước

  const todayISO = toISO(new Date());

  return (
    <>
      <style>{styles}</style>
      <div className="amr-wrapper">

        {/* HEADER */}
        <div className="amr-header">
          <h2>🗂️ Quản lý bệnh án toàn hệ thống</h2>
          <p>Xem toàn bộ bệnh án của tất cả bệnh nhân — dành cho quản trị viên</p>
        </div>

        {/* TOOLBAR */}
        <div className="amr-toolbar">
          {/* Search */}
          <div className="amr-search-wrap">
            <span className="amr-search-icon">🔍</span>
            <input
              className="amr-search-input"
              placeholder="Tìm theo họ tên bệnh nhân..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="amr-search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          {/* Date filter */}
          <input type="date" className="amr-date-input"
            value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          <button className="amr-btn-today" onClick={() => setFilterDate(todayISO)}>Hôm nay</button>
          <button className="amr-btn-all" onClick={() => { setFilterDate(''); setSearch(''); }}>Tất cả</button>

          <div className="amr-total">
            Tìm thấy <b>{filtered.length}</b> bệnh án
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="amr-loading">⏳ Đang tải dữ liệu...</div>
        ) : sortedDates.length === 0 ? (
          <div className="amr-empty">
            <div className="amr-empty-icon">📭</div>
            <div className="amr-empty-title">Không tìm thấy bệnh án nào</div>
            <div className="amr-empty-sub">
              {search ? `Không có kết quả cho "${search}"` : filterDate ? `Ngày ${fmtDate(filterDate)} không có bệnh án` : 'Hệ thống chưa có bệnh án nào'}
            </div>
          </div>
        ) : sortedDates.map(date => {
          const d = new Date(date + 'T00:00:00');
          const isToday = date === todayISO;
          return (
            <div className="amr-date-group" key={date}>
              {/* Date label */}
              <div className="amr-date-label">
                <span>📅 {DOW_VI[d.getDay()]}, {d.getDate()} {MONTHS_VI[d.getMonth()]} {d.getFullYear()}</span>
                {isToday && (
                  <span style={{ background: '#1abc9c', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
                    HÔM NAY
                  </span>
                )}
                <span className="amr-date-count">{grouped[date].length} bệnh án</span>
              </div>

              {/* Records */}
              {grouped[date]
                .sort((a, b) => new Date(a.AppointmentDate) - new Date(b.AppointmentDate))
                .map(r => {
                  const isExpanded = expandedId === r.RecordID;
                  return (
                    <div className="amr-record-card" key={r.RecordID}>
                      {/* Header row */}
                      <div className="amr-record-header"
                        onClick={() => setExpandedId(isExpanded ? null : r.RecordID)}>

                        {/* Time */}
                        <div style={{ minWidth: 50, textAlign: 'center', background: '#ebf8ff', borderRadius: 8, padding: '6px 8px', flexShrink: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#0f4c75', lineHeight: 1 }}>{fmtTime(r.AppointmentDate)}</div>
                        </div>

                        {/* Avatar */}
                        <div className="amr-patient-avatar">{getInitials(r.PatientName)}</div>

                        {/* Info */}
                        <div className="amr-record-info">
                          <div className="amr-patient-name">{r.PatientName}</div>
                          <div className="amr-record-meta">
                            <span>👨‍⚕️ {r.DoctorName || '—'}</span>
                            {r.Diagnosis && <span>🔍 {r.Diagnosis.slice(0, 40)}{r.Diagnosis.length > 40 ? '...' : ''}</span>}
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="amr-record-badges">
                          {r.Specialty && <span className="amr-specialty-badge">{r.Specialty}</span>}
                          {r.ServiceType && (
                            <span className={`amr-svc-badge ${SVC_CLASS[r.ServiceType] || 'svc-normal'}`}>
                              {SVC_LABEL[r.ServiceType] || r.ServiceType}
                            </span>
                          )}
                        </div>

                        <span className={`amr-expand-icon ${isExpanded ? 'open' : ''}`}>▼</span>
                      </div>

                      {/* Expanded panel */}
                      {isExpanded && (
                        <div className="amr-record-panel">
                          <div className="amr-panel-grid">
                            <div className="amr-panel-item">
                              <div className="amr-panel-label">👤 Bệnh nhân</div>
                              <div className="amr-panel-value">{r.PatientName}</div>
                            </div>
                            <div className="amr-panel-item">
                              <div className="amr-panel-label">👨‍⚕️ Bác sĩ phụ trách</div>
                              <div className="amr-panel-value">{r.DoctorName || '—'}</div>
                            </div>
                            <div className="amr-panel-item">
                              <div className="amr-panel-label">📅 Ngày & Giờ khám</div>
                              <div className="amr-panel-value">{fmtDate(r.AppointmentDate)} {fmtTime(r.AppointmentDate)}</div>
                            </div>
                            <div className="amr-panel-item full">
                              <div className="amr-panel-label">🔍 Chẩn đoán</div>
                              <div className="amr-panel-value">{r.Diagnosis || '—'}</div>
                            </div>
                            <div className="amr-panel-item full">
                              <div className="amr-panel-label">💊 Hướng điều trị</div>
                              <div className="amr-panel-value">{r.TreatmentPlan || '—'}</div>
                            </div>
                            {r.Notes && (
                              <div className="amr-panel-item full">
                                <div className="amr-panel-label">📝 Ghi chú</div>
                                <div className="amr-panel-value">{r.Notes}</div>
                              </div>
                            )}
                            <div className="amr-panel-item">
                              <div className="amr-panel-label">🏥 Chuyên khoa</div>
                              <div className="amr-panel-value">{r.Specialty || '—'}</div>
                            </div>
                            <div className="amr-panel-item">
                              <div className="amr-panel-label">📋 Loại dịch vụ</div>
                              <div className="amr-panel-value">{SVC_LABEL[r.ServiceType] || '—'}</div>
                            </div>
                            <div className="amr-panel-item">
                              <div className="amr-panel-label">🆔 Mã bệnh án</div>
                              <div className="amr-panel-value">#{r.RecordID}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default AdminMedicalRecords;