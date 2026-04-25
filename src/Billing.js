import React, { useState } from 'react';

const Billing = () => {
    // 1. DỮ LIỆU GIẢ LẬP
    const [pendingInvoices, setPendingInvoices] = useState([
        { 
            RecordID: "101", 
            PatientName: "Nguyễn Văn An", 
            Time: "08:30",
            Medicines: [
                { id: 1, name: "Phí khám bệnh c", qty: 1, unitPrice: 50000 },
                { id: 2, name: "Paracetamol 500mg", qty: 10, unitPrice: 2000 },
                { id: 3, name: "Vitamin C 1000mg", qty: 5, unitPrice: 5500 }
            ]
        },
        { 
            RecordID: "102", 
            PatientName: "Trần Thị Bình", 
            Time: "09:15",
            Medicines: [
                { id: 4, name: "Phí khám bệnh ", qty: 1, unitPrice: 50000 },
                { id: 5, name: "Amoxicillin", qty: 14, unitPrice: 3200 }
            ]
        }
    ]);

    const [paidInvoices, setPaidInvoices] = useState([]);
    const [selectedBill, setSelectedBill] = useState(null);
    const [isPaidSuccess, setIsPaidSuccess] = useState(false);

    // --- LOGIC XỬ LÝ ---
    const updateBillData = (newMedicines) => {
        const newTotal = newMedicines.reduce((sum, m) => sum + (m.qty * m.unitPrice), 0);
        const updatedBill = { ...selectedBill, Medicines: newMedicines, totalAmount: newTotal };
        setSelectedBill(updatedBill);

        if (selectedBill.Status === "Paid") {
            setPaidInvoices(prev => prev.map(inv => inv.InvoiceID === selectedBill.InvoiceID ? updatedBill : inv));
        }
    };

    const addItem = () => {
        const newItem = { id: Date.now(), name: "Dịch vụ mới", qty: 1, unitPrice: 0 };
        updateBillData([...selectedBill.Medicines, newItem]);
    };

    const removeItem = (id) => {
        updateBillData(selectedBill.Medicines.filter(m => m.id !== id));
    };

    const editItem = (id, field, value) => {
        const updatedMedicines = selectedBill.Medicines.map(m => 
            m.id === id ? { ...m, [field]: field === 'name' ? value : Number(value) } : m
        );
        updateBillData(updatedMedicines);
    };

    const handleSelectRecord = (recordId) => {
        const patient = pendingInvoices.find(p => p.RecordID === recordId);
        if (!patient) return;
        const total = patient.Medicines.reduce((sum, m) => sum + (m.qty * m.unitPrice), 0);
        setSelectedBill({ ...patient, totalAmount: total, Status: "Pending" });
        setIsPaidSuccess(false);
    };

    const handleConfirmPayment = () => {
        if (!selectedBill || selectedBill.Status === "Paid") return;
        const newPaid = {
            ...selectedBill,
            InvoiceID: "INV-" + Math.floor(1000 + Math.random() * 9000),
            PaymentTime: new Date().toLocaleString(),
            Status: "Paid"
        };
        setPaidInvoices([newPaid, ...paidInvoices]);
        setPendingInvoices(pendingInvoices.filter(p => p.RecordID !== selectedBill.RecordID));
        setSelectedBill(newPaid);
        setIsPaidSuccess(true);
    };

    const handleSelectHistory = (invoiceId) => {
        const inv = paidInvoices.find(i => i.InvoiceID === invoiceId);
        setSelectedBill(inv);
        setIsPaidSuccess(false);
    };

    return (
        <div style={containerStyle}>
            <div className="no-print" style={headerWrapper}>
                <div>
                    <h1 style={mainTitle}>Thanh toán & <span style={{color: '#4cc9f0'}}>Biên lai</span></h1>
                    <p style={subTitle}>HỆ THỐNG QUẢN LÝ THANH TOÁN  </p>
                </div>
            </div>

            <div style={layoutGrid}>
                {/* CỘT TRÁI: DANH SÁCH */}
                <div className="no-print" style={sidebarColumn}>
                    <div style={glassCard}>
                        <h3 style={cardHeading}>BỆNH NHÂN CHỜ</h3>
                        {pendingInvoices.length === 0 && <p style={{fontSize: '13px', color: '#64748b'}}>Hàng chờ trống</p>}
                        {pendingInvoices.map(p => (
                            <div key={p.RecordID} style={selectedBill?.RecordID === p.RecordID ? activeItemStyle : itemStyle}>
                                <div>
                                    <span style={idBadge}>#{p.RecordID}</span>
                                    <div style={patientNameText}>{p.PatientName}</div>
                                </div>
                                <button onClick={() => handleSelectRecord(p.RecordID)} style={btnPrimaryMini}>Lập đơn</button>
                            </div>
                        ))}
                    </div>

                    <div style={glassCard}>
                        <h3 style={cardHeading}>LỊCH SỬ THU TIỀN</h3>
                        <div style={scrollArea}>
                            {paidInvoices.map(inv => (
                                <div key={inv.InvoiceID} 
                                     style={selectedBill?.InvoiceID === inv.InvoiceID ? activeHistoryItem : historyItem}
                                     onClick={() => handleSelectHistory(inv.InvoiceID)}>
                                    <div>
                                        <div style={{fontWeight: '600', fontSize: '14px'}}>{inv.InvoiceID}</div>
                                        <div style={{fontSize: '12px', color: '#a0a0a0'}}>{inv.PatientName}</div>
                                    </div>
                                    <div style={{color: '#4ade80', fontWeight: 'bold'}}>{inv.totalAmount.toLocaleString()}đ</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: CHI TIẾT HÓA ĐƠN */}
                <div style={receiptColumn}>
                    {selectedBill ? (
                        <div style={receiptPaper}>
                            {isPaidSuccess && (
                                <div className="no-print" style={successOverlay}>
                                    <div style={successIcon}>✓</div>
                                    <h2 style={{margin: '10px 0'}}>THÀNH CÔNG!</h2>
                                    <button onClick={() => setIsPaidSuccess(false)} style={btnContinue}>QUAY LẠI</button>
                                </div>
                            )}

                            <div style={receiptHeader}>
                                <h2 style={clinicName}>PHÒNG KHÁM CHUYÊN KHOA Y HỌC CỔ TRUYỀN PHƯỚC TÂM</h2>
                                <p style={clinicAddr}>TP. Hồ Chí Minh | Hotline: 1900-XXXX</p>
                                <div style={divider}></div>
                                <h3 style={invoiceTitle}>HÓA ĐƠN DỊCH VỤ {selectedBill.Status === "Paid" && "(ĐÃ THU)"}</h3>
                            </div>

                            <div style={receiptMeta}>
                                <div>
                                    <span style={metaLabel}>KHÁCH HÀNG</span>
                                    <div style={metaValue}>{selectedBill.PatientName}</div>
                                </div>
                                <div style={{textAlign: 'right'}}>
                                    <span style={metaLabel}>{selectedBill.Status === "Paid" ? "MÃ HÓA ĐƠN" : "MÃ HỒ SƠ"}</span>
                                    <div style={metaValue}>{selectedBill.Status === "Paid" ? selectedBill.InvoiceID : `#${selectedBill.RecordID}`}</div>
                                </div>
                            </div>

                            <table style={modernTable}>
                                <thead>
                                    <tr>
                                        <th style={thStyle}>Dịch vụ</th>
                                        <th style={thCenter}>SL</th>
                                        <th style={thRight}>Đơn giá</th>
                                        <th style={thRight}>Thành tiền</th>
                                        <th className="no-print" style={thCenter}>Xóa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedBill.Medicines.map(m => (
                                        <tr key={m.id} style={trStyle}>
                                            <td style={tdStyle}>
                                                <input className="no-print" style={inlineInput} value={m.name} onChange={(e) => editItem(m.id, 'name', e.target.value)} />
                                                <span className="print-only">{m.name}</span>
                                            </td>
                                            <td style={tdCenter}>
                                                <input className="no-print" type="number" style={{...inlineInput, width: '40px', textAlign: 'center'}} value={m.qty} onChange={(e) => editItem(m.id, 'qty', e.target.value)} />
                                                <span className="print-only">{m.qty}</span>
                                            </td>
                                            <td style={tdRight}>
                                                 <input className="no-print" type="number" style={{...inlineInput, width: '80px', textAlign: 'right'}} value={m.unitPrice} onChange={(e) => editItem(m.id, 'unitPrice', e.target.value)} />
                                                <span className="print-only">{m.unitPrice.toLocaleString()}</span>
                                            </td>
                                            <td style={tdRight}>{(m.qty * m.unitPrice).toLocaleString()}đ</td>
                                            <td className="no-print" style={tdCenter}>
                                                <button onClick={() => removeItem(m.id)} style={btnDelete}>✕</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            <button className="no-print" onClick={addItem} style={btnAddItem}>+ Thêm dịch vụ</button>

                            <div style={totalSection}>
                                <div style={totalRow}>
                                    <span style={totalLabel}>TỔNG CỘNG</span>
                                    <span style={totalValue}>{selectedBill.totalAmount.toLocaleString()} VNĐ</span>
                                </div>
                            </div>

                            <div className="no-print" style={actionArea}>
                                <div style={{display: 'flex', gap: '15px'}}>
                                    {selectedBill.Status !== "Paid" ? (
                                        <button onClick={handleConfirmPayment} style={btnConfirm}>XÁC NHẬN THANH TOÁN</button>
                                    ) : (
                                        <div style={{flex: 2, display: 'flex', alignItems: 'center', color: '#4ade80', fontWeight: 'bold'}}>
                                            ✓ ĐÃ THU TIỀN
                                        </div>
                                    )}
                                    <button onClick={() => window.print()} style={btnPrint}>IN BIÊN LAI</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={emptyState}>
                            <div style={emptyIcon}>📄</div>
                            <p>Chọn bệnh nhân từ danh sách để lập hóa đơn.</p>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @media print { .no-print { display: none !important; } .print-only { display: inline !important; } }
            `}</style>
        </div>
    );
};

// --- STYLES ---
const containerStyle = { backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '40px', fontFamily: "'Inter', sans-serif" };
const headerWrapper = { marginBottom: '30px', borderBottom: '1px solid #1e293b', paddingBottom: '20px' };
const mainTitle = { fontSize: '32px', margin: 0, fontWeight: '800' };
const subTitle = { color: '#94a3b8' };
const layoutGrid = { display: 'grid', gridTemplateColumns: '380px 1fr', gap: '30px' };
const sidebarColumn = { display: 'flex', flexDirection: 'column', gap: '20px' };
const glassCard = { background: '#1e293b', borderRadius: '16px', padding: '20px', border: '1px solid #334155' };
const cardHeading = { fontSize: '12px', color: '#38bdf8', fontWeight: 'bold', marginBottom: '15px' };
const itemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '10px', background: '#0f172a', marginBottom: '8px', cursor: 'pointer' };
const activeItemStyle = { ...itemStyle, borderColor: '#38bdf8', border: '1px solid #38bdf8' };
const idBadge = { background: '#334155', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' };
const patientNameText = { fontSize: '14px', fontWeight: '600' };
const btnPrimaryMini = { background: '#38bdf8', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const receiptColumn = { position: 'sticky', top: '20px' };
const receiptPaper = { background: '#1e293b', borderRadius: '24px', padding: '40px', border: '1px solid #334155', position: 'relative', overflow: 'hidden' };
const successOverlay = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.95)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' };
const successIcon = { fontSize: '60px', color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', marginBottom: '20px' };
const btnContinue = { background: '#38bdf8', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' };
const receiptHeader = { textAlign: 'center', marginBottom: '20px' };
const clinicName = { color: '#38bdf8', margin: 0 };
const clinicAddr = { fontSize: '12px', color: '#94a3b8' };
const divider = { height: '1px', background: '#334155', margin: '20px 0' };
const invoiceTitle = { textAlign: 'center', fontSize: '20px' };
const receiptMeta = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' };
const metaLabel = { fontSize: '10px', color: '#f59e0b' };
const metaValue = { fontSize: '16px', fontWeight: 'bold' };
const modernTable = { width: '100%', borderCollapse: 'collapse' };
const thStyle = { textAlign: 'left', color: '#38bdf8', paddingBottom: '10px', borderBottom: '1px solid #334155' };
const thCenter = { ...thStyle, textAlign: 'center' };
const thRight = { ...thStyle, textAlign: 'right' };
const trStyle = { borderBottom: '1px solid #1e293b' };
const tdStyle = { padding: '10px 0' };
const tdCenter = { ...tdStyle, textAlign: 'center' };
const tdRight = { ...tdStyle, textAlign: 'right' };
const totalSection = { background: '#0f172a', padding: '20px', borderRadius: '12px', margin: '20px 0' };
const totalRow = { display: 'flex', justifyContent: 'space-between' };
const totalLabel = { color: '#94a3b8' };
const totalValue = { fontSize: '22px', fontWeight: 'bold', color: '#f59e0b' };
const actionArea = { marginTop: '20px' };
const btnConfirm = { background: '#f59e0b', flex: 2, padding: '15px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' };
const btnPrint = { background: '#334155', flex: 1, padding: '15px', borderRadius: '10px', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' };
const btnAddItem = { background: 'transparent', border: '1px dashed #38bdf8', color: '#38bdf8', padding: '10px', width: '100%', borderRadius: '8px', marginTop: '10px', cursor: 'pointer' };
const btnDelete = { background: '#ef4444', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px' };
const inlineInput = { background: '#0f172a', border: '1px solid #334155', color: 'white', padding: '4px', borderRadius: '4px' };
const scrollArea = { maxHeight: '250px', overflowY: 'auto' };
const historyItem = { display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #334155', cursor: 'pointer' };
const activeHistoryItem = { ...historyItem, background: '#334155' };
const emptyState = { textAlign: 'center', padding: '100px' };
const emptyIcon = { fontSize: '50px', opacity: 0.2 };

export default Billing;