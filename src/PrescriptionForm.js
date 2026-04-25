import React, { useState, useMemo } from 'react';

const PrescriptionForm = ({ recordId = "TEMP-001", onFinish }) => {
    // 1. Trạng thái dữ liệu
    const [medicines, setMedicines] = useState([
        { MedicineID: 1, MedicineName: "Celecoxib 200mg", StockQuantity: 120, Max: 150, Unit: 'Viên' },
        { MedicineID: 2, MedicineName: "Mydocalm 150mg", StockQuantity: 85, Max: 100, Unit: 'Viên' },
        { MedicineID: 3, MedicineName: "Glucosamine 1500mg", StockQuantity: 200, Max: 250, Unit: 'Gói' },
        { MedicineID: 4, MedicineName: "Đai lưng LSO", StockQuantity: 15, Max: 20, Unit: 'Cái' },
        { MedicineID: 5, MedicineName: "Băng dán cơ Kinesio", StockQuantity: 5, Max: 60, Unit: 'Cuộn' },
    ]);

    const [cart, setCart] = useState([]);
    const [selected, setSelected] = useState({ medicineId: '', quantity: 1, dosage: '' });
    const [isSuccess, setIsSuccess] = useState(false); // Trạng thái hiển thị thông báo thành công

    // Tính toán tồn kho ảo
    const virtualMedicines = useMemo(() => {
        return medicines.map(m => {
            const itemInCart = cart.find(c => c.MedicineID === m.MedicineID);
            return {
                ...m,
                RemainingQty: itemInCart ? m.StockQuantity - itemInCart.orderQty : m.StockQuantity
            };
        });
    }, [medicines, cart]);

    const addToCart = () => {
        if (!selected.medicineId) return;
        const med = virtualMedicines.find(m => m.MedicineID === parseInt(selected.medicineId));
        if (parseInt(selected.quantity) > med.RemainingQty) {
            alert("Vượt quá tồn kho!"); return;
        }
        setCart([...cart, { ...med, orderQty: parseInt(selected.quantity), instruction: selected.dosage || "Theo chỉ dẫn" }]);
        setSelected({ medicineId: '', quantity: 1, dosage: '' });
    };

    const handleSave = () => {
        if (cart.length === 0) {
            alert("Vui lòng thêm ít nhất một mục chỉ định!");
            return;
        }
        // Giả lập lưu dữ liệu và hiện thông báo
        setIsSuccess(true);
        if (onFinish) onFinish(cart);
    };

    return (
        <div style={styles.wrapper}>
            {/* MODAL THÔNG BÁO THÀNH CÔNG (HIỆN KHI BẤM LƯU) */}
            {isSuccess && (
                <div style={styles.overlay}>
                    <div style={styles.successCard}>
                        <div style={styles.successIcon}>✓</div>
                        <h2 style={styles.successTitle}>CẬP NHẬT THÀNH CÔNG</h2>
                        <p style={styles.successMsg}>
                            Hồ sơ bệnh án <b>#{recordId}</b> đã được lưu trữ an toàn vào hệ thống.
                        </p>
                        <div style={styles.successActions}>
                            <button style={styles.printBtn}>🖨️ In phiếu chỉ định</button>
                            <button style={styles.closeBtn} onClick={() => {setIsSuccess(false); setCart([]);}}>
                                Tiếp tục hồ sơ mới
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.brandTitle}>Y HỌC CỔ TRUYỀN PHƯỚC TÂM</h1>
                    <p style={styles.brandSub}>Hệ thống Quản lý Hồ sơ Bệnh án & Phục hồi Chức năng</p>
                </div>
                <div style={styles.badgeContainer}>
                    <span style={styles.recordLabel}>Bệnh nhân: <b>{recordId}</b></span>
                </div>
            </div>

            <div style={styles.container}>
                <div style={styles.leftCol}>
                    {/* CARD TẠO CHỈ ĐỊNH */}
                    <div style={styles.darkCard}>
                        <div style={styles.cardHeader}>
                            <span style={styles.icon}>✚</span>
                            <span style={styles.headerText}>TẠO CHỈ ĐỊNH MỚI</span>
                        </div>
                        <div style={styles.formGrid}>
                            <div style={{ flex: 2 }}>
                                <label style={styles.label}>TÊN THUỐC / VẬT TƯ</label>
                                <select 
                                    style={styles.select} 
                                    value={selected.medicineId}
                                    onChange={e => setSelected({...selected, medicineId: e.target.value})}
                                >
                                    <option value="">-- Chọn từ danh mục --</option>
                                    {virtualMedicines.map(m => (
                                        <option key={m.MedicineID} value={m.MedicineID}>{m.MedicineName}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>SỐ LƯỢNG</label>
                                <input 
                                    type="number" style={styles.input} 
                                    value={selected.quantity}
                                    onChange={e => setSelected({...selected, quantity: e.target.value})}
                                />
                            </div>
                        </div>
                        <div style={{ marginTop: '15px' }}>
                            <label style={styles.label}>HƯỚNG DẪN SỬ DỤNG</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input 
                                    style={styles.input} placeholder="Ví dụ: Sáng 1v, Chiều 1v sau ăn..." 
                                    value={selected.dosage}
                                    onChange={e => setSelected({...selected, dosage: e.target.value})}
                                />
                                <button onClick={addToCart} style={styles.primaryBtn}>+ Thêm vào toa</button>
                            </div>
                        </div>
                    </div>

                    {/* CARD DANH SÁCH */}
                    <div style={{ ...styles.darkCard, marginTop: '20px' }}>
                        <div style={styles.cardHeader}>
                            <span style={styles.icon}>📋</span>
                            <span style={styles.headerText}>DANH SÁCH ĐÃ CHỌN ({cart.length})</span>
                        </div>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHead}>
                                    <th style={styles.th}>MỤC CHỈ ĐỊNH</th>
                                    <th style={styles.th}>SL</th>
                                    <th style={styles.th}>CÁCH DÙNG</th>
                                    <th style={{ ...styles.th, textAlign: 'center' }}>XOÁ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.length > 0 ? cart.map((item, i) => (
                                    <tr key={i} style={styles.tr}>
                                        <td style={styles.td}>{item.MedicineName}</td>
                                        <td style={styles.td}>{item.orderQty} {item.Unit}</td>
                                        <td style={{ ...styles.td, color: '#94a3b8' }}>{item.instruction}</td>
                                        <td style={{ ...styles.td, textAlign: 'center' }}>
                                            <button style={styles.delBtn} onClick={() => setCart(cart.filter((_, idx) => idx !== i))}>✕</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" style={styles.emptyText}>Chưa có chỉ định nào được thêm</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* SIDEBAR */}
                <div style={styles.rightCol}>
                    <div style={styles.darkCard}>
                        <div style={styles.cardHeader}>
                            <span style={styles.icon}>🏭</span>
                            <span style={styles.headerText}>TÌNH TRẠNG KHO</span>
                        </div>
                        <div style={styles.invContainer}>
                            {virtualMedicines.map(m => {
                                const percent = (m.RemainingQty / m.Max) * 100;
                                const barColor = percent < 20 ? '#ef4444' : '#10b981';
                                return (
                                    <div key={m.MedicineID} style={styles.invRow}>
                                        <div style={styles.invInfo}>
                                            <span style={styles.invName}>{m.MedicineName}</span>
                                            <span style={{ color: barColor, fontWeight: 'bold' }}>{m.RemainingQty} {m.Unit}</span>
                                        </div>
                                        <div style={styles.progressBg}>
                                            <div style={{ ...styles.progressFill, width: `${percent}%`, backgroundColor: barColor }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <button onClick={handleSave} style={styles.finishBtn}>HOÀN TẤT & LƯU HỒ SƠ</button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    // --- Styles cũ đã có ---
    wrapper: { backgroundColor: '#0f172a', minHeight: '100vh', padding: '40px', color: '#f8fafc', fontFamily: 'Inter, sans-serif', position: 'relative' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', borderBottom: '1px solid #1e293b', paddingBottom: '20px' },
    brandTitle: { margin: 0, fontSize: '22px', fontWeight: 'bold', letterSpacing: '1px', color: '#fff' },
    brandSub: { margin: '5px 0 0', color: '#64748b', fontSize: '13px' },
    badgeContainer: { backgroundColor: '#1e293b', padding: '8px 16px', borderRadius: '30px', border: '1px solid #334155' },
    recordLabel: { fontSize: '14px', color: '#38bdf8' },
    container: { display: 'flex', gap: '20px' },
    leftCol: { flex: 2 },
    rightCol: { flex: 1 },
    darkCard: { backgroundColor: '#1e293b', borderRadius: '16px', padding: '20px', border: '1px solid #334155' },
    cardHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' },
    headerText: { fontWeight: 'bold', fontSize: '12px', color: '#cbd5e1', letterSpacing: '1px' },
    icon: { color: '#38bdf8' },
    formGrid: { display: 'flex', gap: '15px' },
    label: { display: 'block', fontSize: '10px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px' },
    select: { width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none' },
    input: { width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none' },
    primaryBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '0 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    tableHead: { borderBottom: '1px solid #334155' },
    th: { textAlign: 'left', padding: '12px 8px', color: '#64748b', fontSize: '11px' },
    td: { padding: '14px 8px', fontSize: '13px', borderBottom: '1px solid #334155' },
    delBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' },
    emptyText: { textAlign: 'center', padding: '40px', color: '#475569', fontSize: '13px' },
    invContainer: { display: 'flex', flexDirection: 'column', gap: '15px' },
    invRow: { display: 'flex', flexDirection: 'column', gap: '5px' },
    invInfo: { display: 'flex', justifyContent: 'space-between', fontSize: '12px' },
    invName: { color: '#cbd5e1' },
    progressBg: { height: '6px', backgroundColor: '#0f172a', borderRadius: '10px' },
    progressFill: { height: '100%', borderRadius: '10px', transition: 'width 0.5s ease' },
    finishBtn: { width: '100%', marginTop: '15px', padding: '18px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 20px rgba(56, 189, 248, 0.2)' },

    // --- STYLES MỚI CHO GIAO DIỆN THÀNH CÔNG ---
    overlay: { 
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: 'rgba(15, 23, 42, 0.85)', 
        backdropFilter: 'blur(8px)', 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        zIndex: 1000, animation: 'fadeIn 0.3s ease' 
    },
    successCard: { 
        backgroundColor: '#1e293b', padding: '40px', borderRadius: '24px', 
        textAlign: 'center', border: '1px solid #334155', maxWidth: '450px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
    },
    successIcon: { 
        width: '70px', height: '70px', backgroundColor: '#10b981', color: '#fff', 
        borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', 
        margin: '0 auto 20px', fontSize: '30px', fontWeight: 'bold'
    },
    successTitle: { margin: '0 0 10px', fontSize: '20px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' },
    successMsg: { color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', margin: '0 0 30px' },
    successActions: { display: 'flex', flexDirection: 'column', gap: '12px' },
    printBtn: { 
        padding: '14px', backgroundColor: '#fff', color: '#0f172a', 
        border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' 
    },
    closeBtn: { 
        padding: '14px', backgroundColor: 'transparent', color: '#94a3b8', 
        border: '1px solid #334155', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' 
    }
};

export default PrescriptionForm;