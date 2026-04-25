const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcrypt'); // Import bcrypt
const saltRounds = 10; // Số vòng mã hóa
const app = express();
app.use(cors());
app.use(express.json());
// API kiểm tra kết nối
app.get('/', (req, res) => {
res.send('Server Hệ thống Y tế đang chạy!');
});
// --- API Đăng ký Người dùng ---
app.post('/api/register', (req, res) => {
    const { username, password, role } = req.body;
// 1. Mã hóa mật khẩu
    bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error('Lỗi mã hóa mật khẩu:', err);
        return res.status(500).send({ message: 'Lỗi server khi đăng ký.' });
    }
// 2. Chèn dữ liệu vào CSDL
    const sql = 'INSERT INTO users (Username, Password, Role) VALUES (?, ?, ?)';
    db.query(sql, [username, hash, role], (err, result) => {
        if (err) {
// Xử lý lỗi trùng Username (UNIQUE constraint)
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).send({ message: 'Username đã tồn tại.' });
                }
                console.error('Lỗi CSDL khi đăng ký:', err);
                return res.status(500).send({ message: 'Lỗi CSDL.' });
            }
            res.status(201).send({ message: 'Đăng ký thành công!', userId: result.insertId });
        });
    });
});



/* NHÚNG MIDDLEWARE CỦA LAB 4 VÀO */
const authenticateToken = require('./authMiddleware');

// Lấy lịch khám
const generateSlots = (startTime, endTime, breakStart = null, breakEnd = null) => {
    const slots = [];
    let [h, m] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
  
    while (h < endH || (h === endH && m < endM)) {
      const start = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
      const nextM = m + 60;
      const nextH = h + Math.floor(nextM / 60);
      const remM = nextM % 60;
      const end = `${String(nextH).padStart(2,'0')}:${String(remM).padStart(2,'0')}`;
  
      const isBreak = breakStart && breakEnd
        && !(end <= breakStart || start >= breakEnd);
  
      if (!isBreak && (nextH < endH || (nextH === endH && remM <= endM))) {
        slots.push({ start, end });
      }
      h = nextH; m = remM;
    }
    return slots;
  };

// API Đăng ký khám bệnh
app.post('/api/appointments', authenticateToken, (req, res) => {
  const { doctorId, appointmentDate, reason, serviceType, forWho, specialty, patientId } = req.body;
  const finalPatientId = patientId;
  const appointmentTime = appointmentDate.split(' ')[1].slice(0, 5); // 'HH:MM'
  const appointmentDay = appointmentDate.split(' ')[0]; // 'YYYY-MM-DD'

  if (serviceType === 'vip') {
    // VIP: dùng doctorId do frontend chọn
    const sql = `INSERT INTO Appointments (PatientID, DoctorID, AppointmentDate, Reason, ServiceType) VALUES (?,?,?,?,?)`;
    db.query(sql, [finalPatientId, doctorId, appointmentDate, reason, serviceType], (err, result) => {
      if (err) return res.status(500).json({ message: 'Lỗi đặt lịch' });
      res.status(201).json({ message: 'Đặt lịch thành công', id: result.insertId });
    });

  } else {
    // normal & weekend: tự tìm bác sĩ có lịch + còn trống
    // Lấy dow để check WorkDays
    const d = new Date(appointmentDay + 'T00:00:00');
    const dow = d.getDay();

    const findDoctorSql = `
      SELECT ds.DoctorID FROM DoctorSchedule ds
      JOIN Doctors doc ON ds.DoctorID = doc.DoctorID
      WHERE doc.Specialty = ?
        AND ? BETWEEN ds.StartDate AND ds.EndDate
        AND FIND_IN_SET(?, ds.WorkDays)
        AND ds.DoctorID NOT IN (
          SELECT DoctorID FROM Appointments
          WHERE DATE(AppointmentDate) = ?
            AND TIME_FORMAT(AppointmentDate, '%H:%i') = ?
        )
      ORDER BY RAND() LIMIT 1
    `;

    db.query(findDoctorSql, [specialty, appointmentDay, String(dow), appointmentDay, appointmentTime], (err, doctors) => {
      if (err) return res.status(500).json({ message: 'Lỗi tìm bác sĩ' });
      if (doctors.length === 0) {
        return res.status(400).json({ message: 'Không còn bác sĩ trống trong khung giờ này' });
      }

      const assignedDoctorId = doctors[0].DoctorID;
      const sql = `INSERT INTO Appointments (PatientID, DoctorID, AppointmentDate, Reason, ServiceType) VALUES (?,?,?,?,?)`;
      db.query(sql, [finalPatientId, assignedDoctorId, appointmentDate, reason, serviceType], (err, result) => {
        if (err) return res.status(500).json({ message: 'Lỗi đặt lịch' });
        res.status(201).json({ message: 'Đặt lịch thành công', id: result.insertId });
      });
    });
  }
});


/* Nâng cấp cho Lab 4, Lấy DS Doctor dạng DropDownList */
// API lấy danh sách bác sĩ (Chỉ lấy UserID và Username)
app.get('/api/doctors', authenticateToken, (req, res) => {
    const sql = `SELECT  d.DoctorID, u.Username, d.Name,d.Specialty FROM doctors d
    JOIN users u ON d.UserID = u.UserID`;

    db.query(sql, (err, results) => {
        if (err) { 
            return res.status(500).json({ message: "Lỗi lấy danh sách bác sĩ" });
        }
        res.json(results);
    });
});



const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server Backend chạy tại http://localhost:${PORT}`);
});


/* TẠO API ĐĂNG NHẬP Ở LAB 3 */
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'vat'; // Chìa khóa để đăng ký Token
// --- API Đăng nhập ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    // 1. Tìm người dùng trong DB
    const sql = 'SELECT * FROM users WHERE Username = ?';
    db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).send({ message: 'Lỗi CSDL' });
    if (results.length === 0) return res.status(404).send({ message: 'Người dùng không tồn tại' });
    const user = results[0];
    // 2. So sánh mật khẩu
    bcrypt.compare(password, user.Password, (err, isMatch) => {
    if (err) return res.status(500).send({ message: 'Lỗi kiểm tra mật khẩu' });
    if (!isMatch) return res.status(401).send({ message: 'Sai mật khẩu!' });
    // 3. Tạo JWT Token nếu mật khẩu đúng
    const token = jwt.sign(
    { id: user.UserID, role: user.Role },
    SECRET_KEY,
    { expiresIn: '1h' } // Token hết hạn sau 1 giờ
    );
    res.status(200).send({
    message: 'Đăng nhập thành công!',
    token: token,
    user: { id: user.UserID, username: user.Username, role: user.Role }
    });
    });
    });
});


app.get('/api/my-appointments', authenticateToken, (req, res) => {
  const sql = `
    SELECT a.AppointmentID, a.AppointmentDate, a.Reason, a.Status, a.ServiceType,
           p.Name AS PatientName,
           d.Name AS DoctorName, d.Specialty
    FROM Appointments a
    JOIN Patients p ON a.PatientID = p.PatientID
    LEFT JOIN Doctors d ON a.DoctorID = d.DoctorID
    WHERE p.UserID = ?
    ORDER BY a.AppointmentDate DESC
  `;
  db.query(sql, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Lỗi' });
    res.json(results);
  });
});

app.put('/api/appointments/:id/cancel', authenticateToken, (req, res) => {
  // Chỉ cho hủy nếu lịch đang Pending và thuộc về user
  const sql = `
    UPDATE Appointments a
    JOIN Patients p ON a.PatientID = p.PatientID
    SET a.Status = 'Cancelled'
    WHERE a.AppointmentID = ? AND p.UserID = ? AND a.Status = 'Pending'
  `;
  db.query(sql, [req.params.id, req.user.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Lỗi hủy lịch' });
    if (result.affectedRows === 0) return res.status(400).json({ message: 'Không thể hủy lịch này' });
    res.json({ message: 'Đã hủy lịch thành công' });
  });
});

// GET — lấy hồ sơ của chính mình
app.get('/api/my-patients', authenticateToken, (req, res) => {
  db.query('SELECT * FROM Patients WHERE UserID = ?', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Lỗi' });
    res.json(rows);
  });
});


app.get('/api/my-patients/:patientId/appointments', authenticateToken, (req, res) => {
  // Chỉ cho xem nếu bệnh nhân thuộc về user đang đăng nhập
  const checkSql = `SELECT PatientID FROM Patients WHERE PatientID = ? AND UserID = ?`;
  db.query(checkSql, [req.params.patientId, req.user.id], (err, rows) => {
    if (err || rows.length === 0)
      return res.status(403).json({ message: 'Không có quyền truy cập' });

    const sql = `
      SELECT a.AppointmentID, a.AppointmentDate, a.Reason, a.Status,
             d.Name AS DoctorName, d.Specialty
      FROM Appointments a
      LEFT JOIN Doctors d ON a.DoctorID = d.DoctorID
      WHERE a.PatientID = ?
      ORDER BY a.AppointmentDate DESC
    `;
    db.query(sql, [req.params.patientId], (err2, results) => {
      if (err2) return res.status(500).json({ message: 'Lỗi' });
      res.json(results);
    });
  });
});


// POST — tạo hồ sơ mới
app.post('/api/my-patients', authenticateToken, (req, res) => {
  const { Name, DOB, Address, Phone, HealthInsuranceID, CCCD, Gender } = req.body;
  const sql = `INSERT INTO Patients 
    (Name, DOB, Address, Phone, HealthInsuranceID, CCCD, Gender, UserID) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [Name, DOB, Address, Phone, HealthInsuranceID, CCCD, Gender, req.user.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Lỗi thêm hồ sơ', details: err.sqlMessage });
    res.status(201).json({ message: 'Thêm thành công', PatientID: result.insertId });
  });
});

// PUT — sửa hồ sơ, chỉ được sửa của chính mình
app.put('/api/my-patients/:id', authenticateToken, (req, res) => {
  const { Name, DOB, Address, Phone, HealthInsuranceID, CCCD, Gender } = req.body;


  const sql = `UPDATE Patients 
    SET Name=?, DOB=?, Address=?, Phone=?, HealthInsuranceID=?, CCCD=?, Gender=?
    WHERE PatientID=? AND UserID=?`;
  db.query(sql, [Name, DOB, Address, Phone, HealthInsuranceID, CCCD, Gender, req.params.id, req.user.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Lỗi cập nhật' });
    if (result.affectedRows === 0) return res.status(403).json({ message: 'Không có quyền sửa hồ sơ này' });
    res.json({ message: 'Cập nhật thành công' });
  });
});

// DELETE — xóa hồ sơ, chỉ được xóa của chính mình
app.delete('/api/my-patients/:id', authenticateToken, (req, res) => {
  const sql = `DELETE FROM Patients WHERE PatientID=? AND UserID=?`;
  db.query(sql, [req.params.id, req.user.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Lỗi xóa' });
    if (result.affectedRows === 0) return res.status(403).json({ message: 'Không có quyền xóa hồ sơ này' });
    res.json({ message: 'Xóa thành công' });
  });
});





/* Lab 6. API QUẢN LÝ BỆNH NHÂN (CRUD) */

// 1. LẤY DANH SÁCH (READ)
app.get('/api/patients', authenticateToken, (req, res) => {
    const sql = "SELECT *, created_at FROM Patients";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Lỗi lấy dữ liệu" });
        res.json(results);
    });
});


// 2. THÊM MỚI (CREATE)
app.post('/api/patients', authenticateToken, (req, res) => {
    const { Name, DOB, Address, Phone, HealthInsuranceID, CCCD, Gender } = req.body;
    const UserID = req.user.id; // Lấy từ Token đã giải mã

    const sql = "INSERT INTO Patients (Name, DOB, Address, Phone, HealthInsuranceID, UserID, CCCD, Gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [Name, DOB, Address, Phone, HealthInsuranceID, UserID, CCCD, Gender], (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi thêm bệnh nhân" });
        res.status(201).json({ message: "Thêm thành công", PatientID: result.insertId });
    });
});


// 3. CẬP NHẬT (UPDATE)
app.put('/api/patients/:id', authenticateToken, (req, res) => {
    const { Name, DOB, Address, Phone, HealthInsuranceID, CCCD, Gender } = req.body;

    const sql = "UPDATE Patients SET Name=?, DOB=?, Address=?, Phone=?, HealthInsuranceID=?, CCCD=?, Gender=? WHERE PatientID=?";
    db.query(sql, [Name, DOB, Address, Phone, HealthInsuranceID, CCCD, Gender, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi cập nhật" });
        res.json({ message: "Cập nhật thành công" });
    });
});


// 4. XÓA (DELETE)
app.delete('/api/patients/:id', authenticateToken, (req, res) => {
    const sql = "DELETE FROM Patients WHERE PatientID = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi xóa dữ liệu" });
        res.json({ message: "Xóa thành công" });
    });
});


/* Lab 6. API QUẢN LÝ BÁC SĨ (CRUD) */

// 1. LẤY DANH SÁCH (READ)
app.get('/api/doctors/list', authenticateToken, (req, res) => {
    const sql = `
        SELECT d.DoctorID, u.Username, d.Name, d.DOB, d.Phone, d.Address, d.Specialty
        FROM Doctors d JOIN Users u ON d.UserID = u.UserID
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Lỗi lấy dữ liệu" });
        res.json(results);
    });
});


// 2. THÊM MỚI (CREATE)
app.post('/api/doctors', authenticateToken, (req, res) => {
    const { Name, DOB, Address, Phone, Specialty } = req.body;
    const UserID = req.user.id; // Lấy từ Token đã giải mã

    const sql = "INSERT INTO Doctors (Name, DOB, Address, Phone, Specialty, UserID) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [Name, DOB, Address, Phone, Specialty, UserID], (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi thêm bác sĩ" });
        res.status(201).json({ message: "Thêm thành công", DoctorID: result.insertId });
    });
});


// 3. CẬP NHẬT (UPDATE)
app.put('/api/doctors/:id', authenticateToken, (req, res) => {
    const { Name, DOB, Address, Phone, Specialty } = req.body;

    const sql = "UPDATE Doctors SET Name=?, DOB=?, Address=?, Phone=?, Specialty=? WHERE DoctorID=?";
    db.query(sql, [Name, DOB, Address, Phone, Specialty, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi cập nhật" });
        res.json({ message: "Cập nhật thành công" });
    });
});


// 4. XÓA (DELETE)
app.delete('/api/doctors/:id', authenticateToken, (req, res) => {
    const sql = "DELETE FROM Doctors WHERE DoctorID = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi xóa dữ liệu" });
        res.json({ message: "Xóa thành công" });
    });
});

app.get('/api/doctor-schedule/:doctorId', authenticateToken, (req, res) => {
  const doctorId = req.params.doctorId;
  const HOLIDAYS = ['2026-04-18', '2026-04-30', '2026-05-01'];

  const scheduleSql = `SELECT StartTime, EndTime, BreakStart, BreakEnd, WorkDays
    FROM DoctorSchedule WHERE DoctorID = ? LIMIT 1`;

  db.query(scheduleSql, [doctorId], (err, scheduleRows) => {
    if (err) return res.status(500).json({ message: 'Lỗi server' });
    if (scheduleRows.length === 0) return res.json([]);

    const fmt = (t) => t ? String(t).slice(0, 5) : null;
    const { StartTime, EndTime, BreakStart, BreakEnd, WorkDays } = scheduleRows[0];
    const start = fmt(StartTime);
    const end = fmt(EndTime);
    const breakS = fmt(BreakStart);
    const breakE = fmt(BreakEnd);

    // Parse WorkDays → Set
    const workDaySet = new Set(
      (WorkDays || '1,2,3,4,5').split(',').map(Number)
    );

    const bookedSql = `
      SELECT DATE_FORMAT(AppointmentDate, '%Y-%m-%d') as workDate,
             TIME_FORMAT(AppointmentDate, '%H:%i') as bookedTime
      FROM Appointments
      WHERE DoctorID = ? AND AppointmentDate >= CURDATE()
    `;

    db.query(bookedSql, [doctorId], (err2, bookedRows) => {
      if (err2) return res.status(500).json({ message: 'Lỗi server' });

      const bookedMap = {};
      bookedRows.forEach(row => {
        if (!bookedMap[row.workDate]) bookedMap[row.workDate] = new Set();
        bookedMap[row.workDate].add(row.bookedTime);
      });

      const result = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 1; i <= 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dow = d.getDay();

        // Lọc theo WorkDays
        if (!workDaySet.has(dow)) continue;

        const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        if (HOLIDAYS.includes(iso)) continue;

        // CN chỉ buổi sáng
        const slots = dow === 0
          ? generateSlots(start, '12:00', null, null)
          : generateSlots(start, end, breakS, breakE);

        const booked = bookedMap[iso] || new Set();
        result.push({
          workDate: iso,
          slots: slots.map(slot => ({
            start: slot.start,
            end: slot.end,
            isBooked: booked.has(slot.start)
          }))
        });
      }

      res.json(result);
    });
  });
});

// lấy lịch của bác sĩ
app.get('/api/doctor-schedules/:doctorId', authenticateToken, (req, res) => {
  db.query('SELECT * FROM DoctorSchedule WHERE DoctorID = ? ORDER BY StartDate', 
    [req.params.doctorId], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Lỗi' });
    res.json(rows);
  });
});

// POST: thêm lịch mới
app.post('/api/doctor-schedules', authenticateToken, (req, res) => {
  const { doctorId, startDate, endDate, workDays, startTime, endTime } = req.body;
  const sql = `INSERT INTO DoctorSchedule (DoctorID, StartDate, EndDate, WorkDays, StartTime, EndTime) VALUES (?,?,?,?,?,?)`;
  db.query(sql, [doctorId, startDate, endDate, workDays, startTime, endTime], (err, result) => {
    if (err) return res.status(500).json({ message: 'Lỗi thêm lịch' });
    res.status(201).json({ message: 'Thêm thành công', id: result.insertId });
  });
});

// PUT: sửa lịch
app.put('/api/doctor-schedules/:id', authenticateToken, (req, res) => {
  const { startDate, endDate, workDays, startTime, endTime } = req.body;
  const sql = `UPDATE DoctorSchedule SET StartDate=?, EndDate=?, WorkDays=?, StartTime=?, EndTime=? WHERE ScheduleID=?`;
  db.query(sql, [startDate, endDate, workDays, startTime, endTime, req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Lỗi cập nhật' });
    res.json({ message: 'Cập nhật thành công' });
  });
});

// DELETE: xóa lịch
app.delete('/api/doctor-schedules/:id', authenticateToken, (req, res) => {
  db.query('DELETE FROM DoctorSchedule WHERE ScheduleID=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Lỗi xóa' });
    res.json({ message: 'Xóa thành công' });
  });
});


// GET /api/schedule-available?type=weekend hoặc type=normal
app.get('/api/schedule-available', authenticateToken, (req, res) => {
  const type = req.query.type; // 'normal' | 'weekend'
  const HOLIDAYS = ['2026-04-18', '2026-04-30', '2026-05-01'];

  // Lấy tất cả lịch bác sĩ còn hiệu lực
  const sql = `
    SELECT ds.DoctorID, ds.WorkDays, ds.StartTime, ds.EndTime,
           DATE_FORMAT(ds.StartDate, '%Y-%m-%d') as StartDate,
           DATE_FORMAT(ds.EndDate, '%Y-%m-%d') as EndDate
    FROM DoctorSchedule ds
    WHERE ds.EndDate >= CURDATE()
  `;

  db.query(sql, (err, scheduleRows) => {
    if (err) return res.status(500).json({ message: 'Lỗi server' });

    // Lấy slot đã được đặt
    const bookedSql = `
      SELECT DATE_FORMAT(AppointmentDate, '%Y-%m-%d') as workDate,
             TIME_FORMAT(AppointmentDate, '%H:%i') as bookedTime,
             DoctorID
      FROM Appointments
      WHERE AppointmentDate >= CURDATE()
    `;

    db.query(bookedSql, (err2, bookedRows) => {
      if (err2) return res.status(500).json({ message: 'Lỗi server' });

      // Map booked: { 'YYYY-MM-DD': { doctorId: Set<time> } }
      const bookedMap = {};
      bookedRows.forEach(row => {
        if (!bookedMap[row.workDate]) bookedMap[row.workDate] = {};
        if (!bookedMap[row.workDate][row.DoctorID]) bookedMap[row.workDate][row.DoctorID] = new Set();
        bookedMap[row.workDate][row.DoctorID].add(row.bookedTime);
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const result = {}; // { 'YYYY-MM-DD': [{start, end, isBooked}] }

      for (let i = 1; i <= 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dow = d.getDay();
        const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

        if (HOLIDAYS.includes(iso)) continue;

        const isWeekend = dow === 0 || dow === 6;
        const isWeekday = dow >= 1 && dow <= 5;

        if (type === 'weekend' && !isWeekend) continue;
        if (type === 'normal' && !isWeekday) continue;

        // Tìm tất cả bác sĩ làm ngày này
        scheduleRows.forEach(row => {
          const workDays = row.WorkDays.split(',').map(Number);
          const scheduleStart = new Date(row.StartDate + 'T00:00:00');
          const scheduleEnd = new Date(row.EndDate + 'T00:00:00');

          if (!workDays.includes(dow)) return;
          if (d < scheduleStart || d > scheduleEnd) return;

          // CN chỉ sáng
          const endTime = dow === 0 ? '12:00' : String(row.EndTime).slice(0, 5);
          const slots = generateSlots(String(row.StartTime).slice(0, 5), endTime, null, null);

          if (!result[iso]) result[iso] = [];

          slots.forEach(slot => {
            const key = `${slot.start} - ${slot.end}`;
            // Kiểm tra slot đã tồn tại chưa
            const existing = result[iso].find(s => s.start === slot.start && s.end === slot.end);
            const isBooked = bookedMap[iso]?.[row.DoctorID]?.has(slot.start) || false;

            if (!existing) {
              // Slot chưa có → thêm mới, isBooked = true chỉ khi TẤT CẢ bác sĩ đều bận
              result[iso].push({ start: slot.start, end: slot.end, isBooked });
            } else if (existing.isBooked && !isBooked) {
              // Đã có slot bị booked nhưng bác sĩ này còn rảnh → mở lại
              existing.isBooked = false;
            }
          });
        });
      }

      // Trả về dạng array
      const response = Object.entries(result).map(([workDate, slots]) => ({
        workDate,
        slots: slots.sort((a, b) => a.start.localeCompare(b.start))
      }));

      res.json(response.sort((a, b) => a.workDate.localeCompare(b.workDate)));
    });
  });
});



// 1. LẤY DANH SÁCH LỊCH HẸN ĐANG CHỜ (STATUS = 'PENDING')
app.get('/api/appointments/pending', authenticateToken, (req, res) => {
  const role = req.user.role;   // ✅ khai báo role
  const userId = req.user.id;   // ✅ khai báo userId

  // ✅ dùng let thay vì const để có thể nối chuỗi
  let sql = `
  SELECT a.AppointmentID, a.PatientID, a.DoctorID,
         p.Name AS PatientName,
         p.DOB AS PatientDOB,
         a.AppointmentDate, a.Reason
  FROM Appointments a
  JOIN Patients p ON a.PatientID = p.PatientID
  WHERE a.Status = 'Pending'
`;

  const params = [];

  if (role === 'Doctor') {
    sql += ` AND a.DoctorID = (SELECT DoctorID FROM Doctors WHERE UserID = ?)`;
    params.push(userId);
  }

  sql += ` ORDER BY a.AppointmentDate ASC`;

  // ✅ truyền params vào db.query
  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: 'Lỗi lấy danh sách chờ', error: err });
    res.json(results);
  });
});

// GET lịch sử khám theo PatientID
app.get('/api/medical-records/patient/:patientId', authenticateToken, (req, res) => {
  const sql = `
    SELECT mr.*, d.Name AS DoctorName, a.AppointmentDate
    FROM MedicalRecords mr
    JOIN Appointments a ON mr.AppointmentID = a.AppointmentID
    JOIN Doctors d ON mr.DoctorID = d.DoctorID
    WHERE mr.PatientID = ?
    ORDER BY a.AppointmentDate DESC
  `;
  db.query(sql, [req.params.patientId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Lỗi' });
    res.json(results);
  });
});

// 2. LẤY TOÀN BỘ LỊCH SỬ BỆNH ÁN (JOIN 3 BẢNG)
app.get('/api/medical-records', authenticateToken, (req, res) => {
  const userId = req.user.id;  // ✅ đổi tên
  const role = req.user.role;

  let sql = `
    SELECT mr.*, u.Username AS PatientName, d.Name AS DoctorName, a.AppointmentDate
    FROM MedicalRecords mr
    JOIN Patients p ON mr.PatientID = p.PatientID
    JOIN Users u ON p.UserID = u.UserID
    JOIN Appointments a ON mr.AppointmentID = a.AppointmentID
    JOIN Doctors d ON mr.DoctorID = d.DoctorID
  `;

  if (role === 'Doctor') {
    sql += ` WHERE d.UserID = ?`;
  }

  const params = role === 'Doctor' ? [userId] : []; // ✅ dùng đúng tên biến

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: 'Lỗi lấy lịch sử bệnh án' });
    res.json(results);
  });
});

// 3. TẠO BỆNH ÁN MỚI & CẬP NHẬT TRẠNG THÁI LỊCH HẸN
app.post('/api/medical-records', authenticateToken, (req, res) => {
  const { PatientID, AppointmentID, Diagnosis, TreatmentPlan, Notes } = req.body;

  const doctorUserId = req.user.id;

  // Tìm DoctorID trong bảng Doctors theo UserID
  db.query('SELECT DoctorID FROM Doctors WHERE UserID = ?', [doctorUserId], (err, rows) => {
    if (err || rows.length === 0) {
      return res.status(403).json({ message: 'Bạn không có quyền tạo bệnh án' });
    }

    const finalDoctorId = rows[0].DoctorID;

    const sqlInsert = `INSERT INTO MedicalRecords 
      (PatientID, AppointmentID, DoctorID, Diagnosis, TreatmentPlan, Notes) 
      VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(sqlInsert, [PatientID, AppointmentID, finalDoctorId, Diagnosis, TreatmentPlan, Notes], (err2, result) => {
      if (err2) return res.status(500).json({ message: 'Lỗi lưu bệnh án', details: err2.sqlMessage });
      const recordId = result.insertId; // ID vừa tạo (thường là RecordID AUTO_INCREMENT)
      const sqlUpdate = "UPDATE Appointments SET Status = 'Confirmed' WHERE AppointmentID = ?";
      db.query(sqlUpdate, [AppointmentID], (err3) => {
        if (err3) return res.status(500).json({ message: 'Lưu bệnh án thành công nhưng lỗi cập nhật trạng thái' });
        return res.status(201).json({
          message: 'Tạo bệnh án thành công!',
          RecordID: recordId,
          insertId: recordId, // cho khớp logic frontend hiện tại
});
      }); 
    }); 
  }); 
}); 

// 4. CẬP NHẬT BỆNH ÁN THEO ID
app.put('/api/medical-records/:id', authenticateToken, (req, res) => {
  const { Diagnosis, TreatmentPlan, Notes } = req.body;
  const { id } = req.params;

  const sql = "UPDATE MedicalRecords SET Diagnosis = ?, TreatmentPlan = ?, Notes = ? WHERE RecordID = ?";

  db.query(sql, [Diagnosis, TreatmentPlan, Notes, id], (err, result) => {
      if (err) return res.status(500).json({ message: "Lỗi cập nhật bệnh án" });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Không tìm thấy hồ sơ để sửa" });
      res.json({ message: "Cập nhật thông tin thành công!" });
  });
});

// 5. XÓA BỆNH ÁN
app.delete('/api/medical-records/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM MedicalRecords WHERE RecordID = ?";

  db.query(sql, [id], (err, result) => {
      if (err) return res.status(500).json({ message: "Lỗi xóa bệnh án khỏi hệ thống" });
      res.json({ message: "Đã xóa bệnh án vĩnh viễn" });
  });
});

// Lấy full bệnh án
app.get('/api/admin/medical-records', authenticateToken, (req, res) => {
  const sql = `
    SELECT mr.RecordID, mr.Diagnosis, mr.TreatmentPlan, mr.Notes,
           p.Name AS PatientName,
           d.Name AS DoctorName, d.Specialty,
           a.AppointmentDate, a.ServiceType
    FROM MedicalRecords mr
    JOIN Patients p ON mr.PatientID = p.PatientID
    JOIN Doctors d ON mr.DoctorID = d.DoctorID
    JOIN Appointments a ON mr.AppointmentID = a.AppointmentID
    ORDER BY a.AppointmentDate DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Lỗi' });
    res.json(results);
  });
});


// Lấy tất cả
app.get('/api/medicines/all', authenticateToken, (req, res) => {
  db.query("SELECT * FROM medicines ORDER BY MedicineName", (err, results) => {
    if (err) return res.status(500).json({ message: "Lỗi" });
    res.json(results);
  });
});


// API lấy danh sách thuốc còn trong kho
app.get('/api/medicines', authenticateToken, (req, res) => {
  const sql = "SELECT * FROM medicines WHERE StockQuantity > 0";
  db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ message: "Lỗi lấy danh mục thuốc" });
      res.json(results);
  });
});

// API Lưu đơn thuốc & Trừ kho
app.post('/api/prescriptions', authenticateToken, (req, res) => {
  const { recordId, prescriptionList } = req.body;

  if (!prescriptionList || prescriptionList.length === 0) {
      return res.status(400).json({ message: "Đơn thuốc không được để trống" });
  }

  // Duyệt qua mảng thuốc để lưu vào DB và trừ kho
  prescriptionList.forEach((item) => {
      const sqlInsert = "INSERT INTO prescription_details (RecordID, MedicineID, Quantity, Dosage) VALUES (?, ?, ?, ?)";
      const sqlUpdateStock = "UPDATE medicines SET StockQuantity = StockQuantity - ? WHERE MedicineID = ?";

      db.query(sqlInsert, [recordId, item.medicineId, item.quantity, item.dosage], (err) => {
          if (err) console.error("Lỗi lưu chi tiết đơn thuốc:", err.sqlMessage);

          // Trừ tồn kho tương ứng
          db.query(sqlUpdateStock, [item.quantity, item.medicineId], (updErr) => {
              if (updErr) console.error("Lỗi cập nhật kho:", updErr.sqlMessage);
          });
      });
  });

  res.status(201).json({ message: "Kê đơn và cập nhật kho thành công!" });
  }); 



// Thêm thuốc — thêm Price
app.post('/api/medicines', authenticateToken, (req, res) => {
  const { MedicineName, Unit, StockQuantity, Price, Description } = req.body;
  db.query(
    "INSERT INTO medicines (MedicineName, Unit, StockQuantity, Price, Description) VALUES (?,?,?,?,?)",
    [MedicineName, Unit, StockQuantity, Price || 0, Description], (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi thêm thuốc" });
    res.json({ message: "Thêm thành công", MedicineID: result.insertId });
  });
});

// Sửa thuốc — thêm Price
app.put('/api/medicines/:id', authenticateToken, (req, res) => {
  const { MedicineName, Unit, StockQuantity, Price, Description } = req.body;
  db.query(
    "UPDATE medicines SET MedicineName=?, Unit=?, StockQuantity=?, Price=?, Description=? WHERE MedicineID=?",
    [MedicineName, Unit, StockQuantity, Price || 0, Description, req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "Lỗi cập nhật" });
    res.json({ message: "Cập nhật thành công" });
  });
});

// Xóa thuốc
app.delete('/api/medicines/:id', authenticateToken, (req, res) => {
  db.query("DELETE FROM medicines WHERE MedicineID=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "Lỗi xóa" });
    res.json({ message: "Xóa thành công" });
  });
});

// GET đơn thuốc theo RecordID
app.get('/api/prescriptions/:recordId', authenticateToken, (req, res) => {
  const sql = `
    SELECT pd.Quantity, pd.Dosage, m.MedicineName, m.Unit
    FROM prescription_details pd
    JOIN medicines m ON pd.MedicineID = m.MedicineID
    WHERE pd.RecordID = ?
  `;
  db.query(sql, [req.params.recordId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Lỗi' });
    res.json(results);
  });
});


/* ======= Lab 9: Quản lý viện phí ======= */
// API: Lấy thông tin hóa đơn
app.get('/api/billing/preview/:recordId', authenticateToken, (req, res) => {
    const { recordId } = req.params;
    // SQL tính tổng tiền thuốc dựa trên đơn thuốc của bệnh án
    const sqlCalculate = `
        SELECT 
            m.MedicineName,
            pd.Quantity,
            m.Price,
            (pd.Quantity * m.Price) AS SubTotal
        FROM prescription_details pd
        JOIN medicines m ON pd.MedicineID = m.MedicineID
        WHERE pd.RecordID = ?
    `;

    db.query(sqlCalculate, [recordId], (err, results) => {
        if (err) return res.status(500).json({ message: "Lỗi tính toán" });

        const medicineTotal = results.reduce((sum, item) => sum + item.SubTotal, 0);
        const examFee = 50000; // Phí cố định

        res.json({
            details: results,
            examFee,
            medicineTotal,
            totalAmount: examFee + medicineTotal
        });
    });
});

// API: Lưu hóa đơn khi bệnh nhân thanh toán
app.post('/api/invoices', authenticateToken, (req, res) => {
    const { recordId, examFee, medicineTotal, totalAmount, paymentMethod } = req.body;
    
    // 1. Kiểm tra xem hóa đơn cho bệnh án này đã tồn tại chưa (tránh thanh toán trùng)
    const sqlCheck = "SELECT InvoiceID FROM invoices WHERE RecordID = ?";
    
    db.query(sqlCheck, [recordId], (checkErr, checkRes) => {
        if (checkErr) return res.status(500).json({ message: "Lỗi hệ thống" });
        if (checkRes.length > 0) return res.status(400).json({ message: "Bệnh án này đã được thanh toán trước đó!" });
        
        // 2. Nếu chưa, tiến hành lưu hóa đơn mới với trạng thái 'Paid'
        const sqlInsert = `
            INSERT INTO invoices (RecordID, ExamFee, MedicineTotal, TotalAmount, PaymentMethod, PaymentStatus)
            VALUES (?, ?, ?, ?, ?, 'Paid')
        `;
        
        const values = [recordId, examFee, medicineTotal, totalAmount, paymentMethod];
        
        db.query(sqlInsert, values, (err, result) => {
            if (err) {
                console.error("Lỗi lưu hóa đơn:", err.sqlMessage);
                return res.status(500).json({ message: "Không thể lưu hóa đơn" });
            }
            
            res.status(201).json({
                message: "Thanh toán thành công!",
                invoiceId: result.insertId
            });
        });
    });
});

// API: Lấy danh sách bệnh án đang chờ thanh toán (Chưa có hóa đơn)
app.get('/api/billing/pending', authenticateToken, (req, res) => {
    const sql = `
        SELECT
            mr.RecordID,
            p.Name AS PatientName,
            mr.Diagnosis,
            mr.CreatedAt
        FROM medicalrecords mr
        JOIN patients p ON mr.PatientID = p.PatientID
        LEFT JOIN invoices i ON mr.RecordID = i.RecordID
        WHERE i.InvoiceID IS NULL
        ORDER BY mr.CreatedAt DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Lỗi lấy danh sách chờ thanh toán:", err);
            return res.status(500).json({ message: "Lỗi máy chủ" });
        }
        res.json(results);
    });
});

// === CRUD Hoa don ===
// 1. Lấy danh sách hóa đơn đã thanh toán
app.get('/api/invoices/paid', authenticateToken, (req, res) => {
    const sql = `
        SELECT i.*, p.Name AS PatientName
        FROM invoices i
        JOIN medicalrecords mr ON i.RecordID = mr.RecordID
        JOIN patients p ON mr.PatientID = p.PatientID
        ORDER BY i.CreatedAt DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Lỗi lấy danh sách" });
        res.json(results);
    });
});

// 2. Cập nhật phương thức thanh toán
app.put('/api/invoices/:id', authenticateToken, (req, res) => {
    const { paymentMethod } = req.body;
    const sql = "UPDATE invoices SET PaymentMethod = ? WHERE InvoiceID = ?";
    db.query(sql, [paymentMethod, req.params.id], (err) => {
        if (err) return res.status(500).json({ message: "Lỗi cập nhật" });
        res.json({ message: "Đã cập nhật phương thức thanh toán" });
    });
});

// 3. Xóa hóa đơn (Để thu hồi/hủy thanh toán)
app.delete('/api/invoices/:id', authenticateToken, (req, res) => {
    const sql = "DELETE FROM invoices WHERE InvoiceID = ?";
    db.query(sql, [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: "Lỗi xóa hóa đơn" });
        res.json({ message: "Đã xóa hóa đơn thành công" });
    });
});


