const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const XLSX = require('xlsx');
const path = require('path');

const app = express();
const PORT = 3000;

// إعدادات الخادم
app.use(bodyParser.json());

// تقديم ملف HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ملف Excel حيث سيتم تخزين البيانات
const FILE_NAME = 'data.xlsx';

// إنشاء ملف Excel إذا لم يكن موجودًا
if (!fs.existsSync(FILE_NAME)) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([["الاسم", "اسم الأم", "محافظة الولادة", "رقم الهاتف"]]);
    XLSX.utils.book_append_sheet(wb, ws, "بيانات");
    XLSX.writeFile(wb, FILE_NAME);
}

// استلام البيانات وحفظها في ملف Excel
app.post('/save-data', (req, res) => {
    const { name, motherName, birthProvince, phone } = req.body;

    if (!name || !motherName || !birthProvince || !phone) {
        return res.status(400).send("يرجى ملء جميع الحقول.");
    }

    // قراءة ملف Excel
    const wb = XLSX.readFile(FILE_NAME);
    const ws = wb.Sheets["بيانات"];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

    // إضافة البيانات الجديدة
    data.push([name, motherName, birthProvince, phone]);

    // تحديث ملف Excel
    const newWs = XLSX.utils.aoa_to_sheet(data);
    wb.Sheets["بيانات"] = newWs;
    XLSX.writeFile(wb, FILE_NAME);

    res.status(200).send("تم حفظ البيانات بنجاح!");
});

// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
