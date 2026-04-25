import React, { useState } from 'react';
import axios from 'axios';
const Register = () => {
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const [role, setRole] = useState('Patient'); // Mặc định là Patient
const [message, setMessage] = useState('');
const handleSubmit = async (e) => {
e.preventDefault();
setMessage('');
try {
    const response = await axios.post('http://localhost:3001/api/register', {
    username,
    password,
    role
    });
    setMessage(`${response.data.message}`);
    // Reset form
    setUsername('');
    setPassword('');
    setRole('Patient');
    } catch (error) {
    // Hiển thị thông báo lỗi từ server (409 hoặc 500)
    const errorMessage = error.response ? error.response.data.message : 'Lỗi kết nối Server Backend.';
    setMessage(`${errorMessage}`);
    }
    };
    return (
    <div>
    <h2>Đăng ký Tài khoản Hệ thống Y tế</h2>
    <form onSubmit={handleSubmit}>
    <div>
    <label>Username:</label>
    <input
    type="text"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
required
/>
</div>
<div>
<label>Password:</label>
<input
type="password"
value={password}
onChange={(e) => setPassword(e.target.value)}
required
/>
</div>
<div>
<label>Vai trò (Role):</label>
<select value={role} onChange={(e) => setRole(e.target.value)}>
<option value="Patient">Bệnh nhân</option>
<option value="Doctor">Bác sĩ</option>
<option value="Nurse">Y tá</option>
<option value="Admin">Admin</option>
</select>
</div>
<button type="submit">Đăng ký</button>
</form>
{message && <p style={{ marginTop: '10px' }}>{message}</p>}
</div>
);
};
export default Register