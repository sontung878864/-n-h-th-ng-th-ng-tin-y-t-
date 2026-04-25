const mysql = require('mysql');
const db = mysql.createConnection({
host: 'localhost',
user: 'root', // Thay thế bằng user của bạn
password: '', // Thay thế bằng password của bạn
database: 'healthcare_db' //Thay thế bằng database mà bạn đã tạo
});
db.connect(function (err) {
if (err) {
console.error('Lỗi kết nối CSDL: ' + err.stack);
return;
}
console.log('Kết nối CSDL thành công với ID: ' + db.threadId);
});
module.exports = db;