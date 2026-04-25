import React, { useState, useEffect } from 'react';

const styles = `
  .nurse-container { font-family: 'Plus Jakarta Sans', sans-serif; padding: 20px; background: #f4f7fa; min-height: 100vh; }
  .grid-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .card { background: white; padding: 20px; border-radius: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-bottom: 20px; }
  .table-nurse { width: 100%; border-collapse: collapse; margin-top: 10px; }
  .table-nurse th, .table-nurse td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; font-size: 14px; }
  .btn { padding: 8px 15px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s; }
  .btn-add { background: #2563eb; color: white; }
  .btn-pay { background: #10b981; color: white; }
  .btn-delete { background: #ef4444; color: white; }
  .input-group { margin-bottom: 15px; }
  .input-group label { display: block; font-size: 12px; font-weight: 700; margin-bottom: 5px; color: #64748b; }
  .nurse-input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; }
  .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
  .stat-box { padding: 20px; border-radius: 12px; color: white; text-align: center; }
  .bg-blue { background: #3b82f6; } .bg-green { background: #10b981; } .bg-orange { background: #f59e0b; }
`;

const NurseDashboard = () => {
  // 1. Quản lý danh sách bệnh nhân (Dữ liệu giả lập)
  const [patients, setPatients] = useState([
    { id: 1, name: 'Nguyễn Văn A', phone: '0901234567', status: 'Đã thanh toán', amount: 500000 },
    { id: 2, name: 'Trần Thị B', phone: '0908887776', status: 'Chờ thanh toán', amount: 200000 },
  ]);

  const [formData, setFormData] = useState({ name: '', phone: '', amount: '' });
  const [editingId, setEditingId] = useState(null);

  // 2. Hàm Thêm / Sửa bệnh nhân
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setPatients(patients.map(p => p.id === editingId ? { ...p, ...formData, amount: Number(formData.amount) } : p));
      setEditingId(null);
    } else {
      const newPatient = { id: Date.now(), ...formData, status: 'Chờ thanh toán', amount: Number(formData.amount) };
      setPatients([...patients, newPatient]);
    }
    setFormData({ name: '', phone: '', amount: '' });
  };

  // 3. Hàm Xóa
  const deletePatient = (id) => setPatients(patients.filter(p => p.id !== id));

  // 4. Hàm Thanh toán
  const processPayment = (id) => {
    setPatients(patients.map(p => p.id === id ? { ...p, status: 'Đã thanh toán' } : p));
  };

  // 5. Thống kê báo cáo
  const totalRevenue = patients.filter(p => p.status === 'Đã thanh toán').reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = patients.filter(p => p.status === 'Chờ thanh toán').length;

  return (
    <div className="nurse-container">
      <style>{styles}</style>
      <h2 style={{ color: '#0f4c75', marginBottom: '20px' }}>🩺 Khu vực quản lý Điều dưỡng (Nurse)</h2>

      {/* PHẦN THỐNG KÊ (Lab 10) */}
      <div className="stats-grid">
        <div className="stat-box bg-blue">
          <h3>{patients.length}</h3>
          <p>Tổng bệnh nhân</p>
        </div>
        <div className="stat-box bg-green">
          <h3>{totalRevenue.toLocaleString()} VND</h3>
          <p>Doanh thu thực tế</p>
        </div>
        <div className="stat-box bg-orange">
          <h3>{pendingCount}</h3>
          <p>Ca chờ thanh toán</p>
        </div>
      </div>

      <div className="grid-layout">
        {/* FORM THÊM/SỬA (Đăng ký & Quản lý) */}
        <div className="card">
          <h3 style={{ marginTop: 0 }}>{editingId ? "Cập nhật hồ sơ" : "Đăng ký & Thêm bệnh nhân"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Họ và tên</label>
              <input className="nurse-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Số điện thoại</label>
              <input className="nurse-input" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Số tiền khám (VND)</label>
              <input type="number" className="nurse-input" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-add w-100">{editingId ? "Lưu thay đổi" : "Thêm vào danh sách"}</button>
          </form>
        </div>

        {/* DANH SÁCH & THANH TOÁN */}
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Danh sách hồ sơ xử lý</h3>
          <table className="table-nurse">
            <thead>
              <tr>
                <th>Bệnh nhân</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong><br/>
                    <small>{p.phone}</small>
                  </td>
                  <td>
                    <span style={{ color: p.status === 'Đã thanh toán' ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    {p.status === 'Chờ thanh toán' && (
                      <button className="btn btn-pay" onClick={() => processPayment(p.id)} style={{ marginRight: '5px' }}>Tiền</button>
                    )}
                    <button className="btn btn-delete" onClick={() => deletePatient(p.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;