# 🚰 ระบบกำกับติดตามน้ำประปา — เทศบาลตำบลห้องแซง

> **VWSS** — Village Water Supply Surveillance System  
> พัฒนาด้วย Google Apps Script + Google Sheets + Chart.js

---

## 📋 ภาพรวม

ระบบ Web App สำหรับกำกับติดตามคุณภาพน้ำประปาในพื้นที่เทศบาลตำบลห้องแซง ครอบคลุม 10 สถานี รองรับ 3 บทบาทผู้ใช้งาน และทำงานบน Google Sheets เป็น database ไม่มีค่าใช้จ่ายเพิ่มเติม

### ฟีเจอร์หลัก

| โมดูล | คำอธิบาย |
|-------|-----------|
| 📊 ภาพรวม | สถานะ 10 สถานีแบบ real-time + แจ้งเตือนอัตโนมัติ |
| 📋 บันทึกรายวัน | คลอรีน / pH / สารส้ม / ปูนขาว พร้อมแจ้งเตือนค่าผิดปกติ |
| 🔬 ผลแล็บ | บันทึกผลตามเกณฑ์กรมอนามัย 2563 ตรวจ Pass/Fail อัตโนมัติ |
| 🏠 ข้อมูลสถานี | ทะเบียน 10 สถานี แก้ไขได้โดย supervisor ขึ้นไป |
| 📣 ร้องเรียน | รับ ติดตาม ปิดเรื่อง พร้อม workflow สถานะ |
| 📈 กราฟแนวโน้ม | คลอรีน + pH ย้อนหลัง 30 วัน รายสถานี |
| ⭐ ประเมินความพึงพอใจ | Google Form Likert 7 ด้าน sync เข้า Sheet อัตโนมัติ |
| 📑 สรุปผลประเมิน | กราฟ + ตารางรายสถานี + demographics (admin เท่านั้น) |

---

## 🗂️ โครงสร้างไฟล์

```
noomas.vwss/
├── Code.gs                  ← GAS backend หลัก (CRUD ทุกโมดูล)
├── Code_Survey_addon.gs     ← addon: สร้าง Form + Trigger + API ประเมิน
├── Index.html               ← HTML หลัก (layout + nav)
├── App.html                 ← JavaScript ทั้งหมด (logic + API calls)
├── Style.html               ← CSS ทั้งหมด
├── Modals.html              ← HTML modals (บันทึก/แก้ไข/ลบ/login)
└── README.md
```

> ⚠️ ไฟล์ `.html` ใน GAS ไม่ใช่ HTML ปกติ — Style.html เป็น CSS ล้วน, App.html เป็น JS ล้วน

---

## 🚀 วิธี Deploy ครั้งแรก

### ขั้นตอนที่ 1 — เตรียม Google Sheet

1. เปิด Google Sheet ที่มีข้อมูล **ทะเบียนระบบประปาของเทศบาลตำบลห้องแซง**
2. ตรวจสอบว่า Sheet ชื่อ **"ข้อมูลทั่วไป"** มีข้อมูลสถานีครบ

### ขั้นตอนที่ 2 — สร้าง Apps Script Project

1. ใน Google Sheet กด **Extensions → Apps Script**
2. ลบโค้ดเดิมใน `Code.gs` ทิ้ง
3. วางโค้ดจาก `Code.gs` ใน repo นี้
4. วางโค้ดจาก `Code_Survey_addon.gs` **ต่อท้าย** Code.gs เดิม
5. แก้ `apiCall` switch ใน Code.gs เพิ่ม:
   ```javascript
   case "getSurveySummary": return getSurveySummary();
   case "getSurveyFormUrl": return getSurveyFormUrl();
   ```
6. แก้ `onOpen()` เพิ่ม:
   ```javascript
   .addItem("สร้าง Form ประเมินความพึงพอใจ (รัน 1 ครั้ง)", "createSurveyForm")
   ```

### ขั้นตอนที่ 3 — สร้างไฟล์ HTML

สร้างไฟล์ใหม่ใน Apps Script (ชื่อต้องตรงเป๊ะ):

| ชื่อไฟล์ | ประเภท | เนื้อหา |
|---------|--------|---------|
| `Index` | HTML | จาก `Index.html` |
| `App` | HTML | จาก `App.html` (JS ล้วน ไม่มี `<script>` tag) |
| `Style` | HTML | จาก `Style.html` (CSS ล้วน ไม่มี `<style>` tag) |
| `Modals` | HTML | จาก `Modals.html` |

### ขั้นตอนที่ 4 — Deploy Web App

1. กด **Deploy → New deployment**
2. Type: **Web App**
3. Execute as: **Me**
4. Who has access: **Anyone** (หรือ Anyone with Google Account)
5. กด **Deploy** → คัดลอก URL

### ขั้นตอนที่ 5 — Setup ครั้งแรก

1. เปิด Google Sheet → เมนู **🚰 ระบบประปา** จะปรากฏขึ้น
2. กด **ตั้งค่า Sheet (รัน 1 ครั้ง)** → สร้าง Sheet ที่จำเป็นทั้งหมด
3. กด **สร้าง Form ประเมินความพึงพอใจ (รัน 1 ครั้ง)** → ระบบ popup URL ของ Form

---

## 👤 บทบาทผู้ใช้งาน

| บทบาท | รหัสผ่าน | สิทธิ์ |
|-------|---------|-------|
| **ดูอย่างเดียว** (ไม่ login) | — | ดูข้อมูลและกราฟได้ทั้งหมด |
| **ผู้ปฏิบัติงาน** | `123` | บันทึก/แก้ไขข้อมูล แต่ลบไม่ได้ |
| **หัวหน้างาน** | `123` | ทุกอย่าง + แก้ไขข้อมูลสถานี |
| **ผู้บริหาร** | `123` | ทุกอย่าง + รายงาน + สรุปผลประเมิน |

> 💡 **Production:** ควรย้ายรหัสผ่านไปเก็บใน **Script Properties** (GAS → Project Settings → Script Properties) แทนการฝังใน Code

---

## 📊 Sheet ที่ระบบใช้

| ชื่อ Sheet | สร้างโดย | คำอธิบาย |
|-----------|---------|---------|
| ข้อมูลทั่วไป | มีอยู่แล้ว | ทะเบียนสถานี 10 แห่ง |
| บันทึกรายวัน | `setupSheets()` | คลอรีน pH สารส้ม ปูนขาว |
| ผลแล็บ | `setupSheets()` | ผลตรวจวิเคราะห์น้ำ |
| เรื่องร้องเรียน | `setupSheets()` | ระบบรับและติดตามเรื่อง |
| แบบประเมินความพึงพอใจ | `createSurveyForm()` | ผลประเมิน Likert 7 ด้าน |
| Form Responses (auto) | Google Forms | Sheet รับผลจาก Form โดยตรง |

---

## 🔧 การแก้ไขโค้ดและ Deploy ใหม่

เมื่อแก้ไขโค้ดแล้วต้องการ deploy ใหม่:

```
Deploy → Manage deployments → แก้ไข (✏️) → Version: New version → Deploy
```

> ⚠️ ถ้ากด Deploy โดยไม่เปลี่ยน version ผู้ใช้จะยังเห็นเวอร์ชันเก่าอยู่

---

## 🩺 เกณฑ์มาตรฐานที่ระบบตรวจสอบ

อ้างอิงตามประกาศกรมอนามัย พ.ศ. 2563

| พารามิเตอร์ | เกณฑ์ |
|------------|-------|
| คลอรีนปลายท่อ | ≥ 0.2 mg/L |
| pH | 6.5 – 8.5 |
| ความขุ่น | ≤ 5 NTU |
| เหล็ก | ≤ 0.3 mg/L |
| แมงกานีส | ≤ 0.3 mg/L |
| โคลิฟอร์มแบคทีเรีย | < 1.1 MPN/100mL |
| E. coli | = 0 (ต้องไม่ตรวจพบ) |

---

## 📱 การแชร์ Form ให้ชาวบ้าน

1. หลังรัน `createSurveyForm()` ระบบจะแสดง URL อัตโนมัติ
2. นำ URL ไปแปลง QR Code ที่ [qr.io](https://qr.io) หรือ [qrcode-monkey.com](https://qrcode-monkey.com)
3. พิมพ์ QR Code ติดไว้ที่สถานีประปา หรือแชร์ใน LINE กลุ่มหมู่บ้าน
4. ชาวบ้านสแกน → กรอก Form → ข้อมูลเข้า Sheet อัตโนมัติ

---

## 🛠️ Tech Stack

- **Backend:** Google Apps Script (GAS)
- **Database:** Google Sheets
- **Frontend:** Vanilla HTML/CSS/JS
- **Charts:** [Chart.js 4.4](https://www.chartjs.org/)
- **Icons:** [Tabler Icons 3.10](https://tabler.io/icons)
- **Survey:** Google Forms + GAS Trigger

---

## 📝 TODO / แผนพัฒนาต่อ

- [ ] ระบบ Login ด้วย Google Account (`Session.getActiveUser()`)
- [ ] Export รายงาน PDF/Excel
- [ ] โมดูลบำรุงรักษาเชิงป้องกัน (Preventive Maintenance)
- [ ] แจ้งเตือน Email อัตโนมัติเมื่อผลแล็บไม่ผ่าน
- [ ] ย้ายรหัสผ่านไปเก็บใน Script Properties

---

## 👥 ทีมพัฒนา

พัฒนาสำหรับ **เทศบาลตำบลห้องแซง** ภายใต้โครงการวิจัย TQM ระบบประปาชุมชน  
ติดต่อ: [nrok47](https://github.com/nrok47)
