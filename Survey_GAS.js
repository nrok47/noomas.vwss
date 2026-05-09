// ============================================================
//  ระบบประเมินความพึงพอใจผู้ใช้น้ำ เทศบาลตำบลห้องแซง
//  วิธีใช้: วางโค้ดนี้ใน Code.gs เดิม แล้วรัน createSurveyForm() 1 ครั้ง
// ============================================================

// ── Sheet name ──────────────────────────────────────────────
const SURVEY_SHEET = "แบบประเมินความพึงพอใจ";

// ── Survey Header ────────────────────────────────────────────
const SURVEY_HEADER = [
  "Timestamp","สถานีID","ชื่อสถานี","เพศ","ช่วงอายุ",
  // ด้านที่ 1: คุณภาพน้ำ
  "Q1_สี_ใส","Q2_กลิ่น","Q3_ความสะอาด",
  // ด้านที่ 2: ปริมาณ/แรงดัน
  "Q4_ปริมาณ","Q5_แรงดัน",
  // ด้านที่ 3: ความต่อเนื่อง
  "Q6_ต่อเนื่อง","Q7_ฟื้นตัวเร็ว",
  // ด้านที่ 4: ราคา
  "Q8_ราคา","Q9_ใบแจ้งหนี้",
  // ด้านที่ 5: บริการ
  "Q10_ติดต่อได้","Q11_แก้ปัญหาเร็ว","Q12_สุภาพ",
  // ด้านที่ 6: โครงสร้าง
  "Q13_ท่อไม่รั่ว","Q14_มิเตอร์แม่นยำ",
  // ด้านที่ 7: สื่อสาร
  "Q15_แจ้งล่วงหน้า","Q16_รับเรื่องร้องเรียน",
  // สรุป
  "คะแนนD1_คุณภาพ","คะแนนD2_ปริมาณ","คะแนนD3_ต่อเนื่อง",
  "คะแนนD4_ราคา","คะแนนD5_บริการ","คะแนนD6_โครงสร้าง","คะแนนD7_สื่อสาร",
  "คะแนนรวม","คะแนนเฉลี่ย","ระดับความพึงพอใจ","ข้อเสนอแนะ"
];

// ════════════════════════════════════════════════════════════
//  1. สร้าง Google Form (รัน 1 ครั้ง)
// ════════════════════════════════════════════════════════════
function createSurveyForm() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // ดึงรายชื่อสถานีจาก Sheet ข้อมูลทั่วไป
  const stSheet = ss.getSheetByName("ข้อมูลทั่วไป");
  const stData  = stSheet ? stSheet.getDataRange().getValues() : [];
  const stations = [];
  let headerFound = false;
  for (let i = 0; i < stData.length; i++) {
    if (String(stData[i][0]).includes("ลำดับ")) { headerFound = true; continue; }
    if (headerFound && stData[i][1] && !isNaN(stData[i][0])) {
      stations.push(String(stData[i][1]).trim());
    }
  }
  if (!stations.length) stations.push("ระบบประปาหมู่บ้าน");

  // สร้าง Form
  const form = FormApp.create("แบบประเมินความพึงพอใจผู้ใช้น้ำประปา เทศบาลตำบลห้องแซง");
  form.setDescription(
    "กรุณาประเมินความพึงพอใจในการใช้บริการน้ำประปา\n" +
    "เกณฑ์คะแนน: 5=พึงพอใจมากที่สุด  4=พึงพอใจมาก  3=ปานกลาง  2=พึงพอใจน้อย  1=ควรปรับปรุง"
  );
  form.setCollectEmail(false);
  form.setLimitOneResponsePerUser(false);
  form.setConfirmationMessage("ขอบคุณสำหรับการประเมิน ความคิดเห็นของท่านมีคุณค่าอย่างยิ่ง 🙏");

  const LIKERT = ["1 – ควรปรับปรุง","2 – พึงพอใจน้อย","3 – ปานกลาง","4 – พึงพอใจมาก","5 – พึงพอใจมากที่สุด"];

  // ── ส่วนที่ 1: ข้อมูลทั่วไป ────────────────────────────
  form.addSectionHeaderItem()
    .setTitle("ส่วนที่ 1: ข้อมูลทั่วไป")
    .setHelpText("กรุณาระบุสถานีที่ท่านใช้บริการ");

  form.addListItem()
    .setTitle("สถานีประปาที่ท่านใช้บริการ")
    .setChoiceValues(stations)
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("เพศ")
    .setChoiceValues(["ชาย","หญิง","ไม่ระบุ"])
    .setRequired(false);

  form.addMultipleChoiceItem()
    .setTitle("ช่วงอายุ")
    .setChoiceValues(["ต่ำกว่า 20 ปี","20–35 ปี","36–50 ปี","51–65 ปี","มากกว่า 65 ปี"])
    .setRequired(false);

  // ── ด้านที่ 1: คุณภาพน้ำ ────────────────────────────────
  form.addSectionHeaderItem()
    .setTitle("ด้านที่ 1: คุณภาพน้ำประปา")
    .setHelpText("ประเมินลักษณะทางกายภาพและความปลอดภัยของน้ำ");

  const q1Items = [
    "น้ำประปามีสีใส ไม่มีตะกอนหรือสิ่งแปลกปลอม",
    "น้ำประปาไม่มีกลิ่นผิดปกติ",
    "น้ำประปาสะอาด ปลอดภัยสำหรับการอุปโภค",
  ];
  q1Items.forEach(function(q) {
    form.addScaleItem()
      .setTitle(q).setLabels("ควรปรับปรุง","พึงพอใจมากที่สุด")
      .setBounds(1,5).setRequired(true);
  });

  // ── ด้านที่ 2: ปริมาณและแรงดัน ──────────────────────────
  form.addSectionHeaderItem()
    .setTitle("ด้านที่ 2: ปริมาณและแรงดันน้ำ");

  ["ปริมาณน้ำเพียงพอต่อความต้องการในครัวเรือน",
   "แรงดันน้ำเหมาะสม ไม่อ่อนหรือแรงเกินไป"]
  .forEach(function(q) {
    form.addScaleItem()
      .setTitle(q).setLabels("ควรปรับปรุง","พึงพอใจมากที่สุด")
      .setBounds(1,5).setRequired(true);
  });

  // ── ด้านที่ 3: ความต่อเนื่อง ─────────────────────────────
  form.addSectionHeaderItem()
    .setTitle("ด้านที่ 3: ความต่อเนื่องของการให้บริการ");

  ["น้ำประปาไหลต่อเนื่องตลอด 24 ชั่วโมง",
   "เมื่อเกิดปัญหาหรือไฟฟ้าดับ ระบบฟื้นตัวได้รวดเร็ว"]
  .forEach(function(q) {
    form.addScaleItem()
      .setTitle(q).setLabels("ควรปรับปรุง","พึงพอใจมากที่สุด")
      .setBounds(1,5).setRequired(true);
  });

  // ── ด้านที่ 4: ราคาและค่าบริการ ─────────────────────────
  form.addSectionHeaderItem()
    .setTitle("ด้านที่ 4: ราคาและค่าบริการ");

  ["ราคาค่าน้ำประปามีความเหมาะสมกับคุณภาพที่ได้รับ",
   "ใบแจ้งหนี้/ใบเสร็จมีความถูกต้องและชัดเจน"]
  .forEach(function(q) {
    form.addScaleItem()
      .setTitle(q).setLabels("ควรปรับปรุง","พึงพอใจมากที่สุด")
      .setBounds(1,5).setRequired(true);
  });

  // ── ด้านที่ 5: การบริการ ──────────────────────────────────
  form.addSectionHeaderItem()
    .setTitle("ด้านที่ 5: การบริการของเจ้าหน้าที่");

  ["ติดต่อเจ้าหน้าที่ได้ง่าย สะดวก",
   "เจ้าหน้าที่แก้ไขปัญหาได้รวดเร็วเมื่อมีการแจ้ง",
   "เจ้าหน้าที่มีความสุภาพและให้บริการด้วยความเต็มใจ"]
  .forEach(function(q) {
    form.addScaleItem()
      .setTitle(q).setLabels("ควรปรับปรุง","พึงพอใจมากที่สุด")
      .setBounds(1,5).setRequired(true);
  });

  // ── ด้านที่ 6: โครงสร้างพื้นฐาน ─────────────────────────
  form.addSectionHeaderItem()
    .setTitle("ด้านที่ 6: โครงสร้างพื้นฐาน");

  ["ท่อน้ำประปาอยู่ในสภาพดี ไม่รั่วซึมบ่อยครั้ง",
   "มิเตอร์น้ำทำงานได้ถูกต้องและแม่นยำ"]
  .forEach(function(q) {
    form.addScaleItem()
      .setTitle(q).setLabels("ควรปรับปรุง","พึงพอใจมากที่สุด")
      .setBounds(1,5).setRequired(true);
  });

  // ── ด้านที่ 7: การสื่อสาร ────────────────────────────────
  form.addSectionHeaderItem()
    .setTitle("ด้านที่ 7: การสื่อสารและการรับเรื่องร้องเรียน");

  ["มีการแจ้งล่วงหน้าเมื่อน้ำจะหยุดหรือมีการซ่อมบำรุง",
   "ช่องทางรับเรื่องร้องเรียนเข้าถึงได้ง่าย และมีการติดตามผล"]
  .forEach(function(q) {
    form.addScaleItem()
      .setTitle(q).setLabels("ควรปรับปรุง","พึงพอใจมากที่สุด")
      .setBounds(1,5).setRequired(true);
  });

  // ── ข้อเสนอแนะ ────────────────────────────────────────────
  form.addSectionHeaderItem().setTitle("ข้อเสนอแนะ (ถ้ามี)");
  form.addParagraphTextItem()
    .setTitle("ท่านมีข้อเสนอแนะหรือความคิดเห็นเพิ่มเติมอะไรบ้าง?")
    .setRequired(false);

  // ── ผูก Form กับ Spreadsheet ──────────────────────────────
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // ── บันทึก Form URL ──────────────────────────────────────
  const formUrl  = form.getPublishedUrl();
  const editUrl  = form.getEditUrl();
  const shortUrl = form.shortenFormUrl(formUrl);

  // เซฟ URL ไว้ใน Script Properties เพื่อใช้ต่อ
  PropertiesService.getScriptProperties().setProperties({
    SURVEY_FORM_ID:  form.getId(),
    SURVEY_FORM_URL: shortUrl,
  });

  // ── ตั้ง Trigger onFormSubmit ─────────────────────────────
  // ลบ trigger เก่าก่อน (ถ้ามี)
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === "onSurveySubmit") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("onSurveySubmit")
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();

  // ── ตั้งค่า Sheet รับผล ───────────────────────────────────
  ensureSurveySheet();

  // แจ้งผล
  SpreadsheetApp.getUi().alert(
    "✅ สร้าง Form สำเร็จ!\n\n" +
    "📋 Form URL (แชร์ให้ชาวบ้าน):\n" + shortUrl + "\n\n" +
    "✏️ Edit URL (สำหรับแก้ไข):\n" + editUrl + "\n\n" +
    "หมายเหตุ: Trigger onFormSubmit ถูกตั้งแล้วอัตโนมัติ"
  );

  Logger.log("Form URL: " + shortUrl);
  Logger.log("Edit URL: " + editUrl);
}

// ════════════════════════════════════════════════════════════
//  2. Trigger: เมื่อมีคนตอบ Form
// ════════════════════════════════════════════════════════════
function onSurveySubmit(e) {
  try {
    const ss   = SpreadsheetApp.getActiveSpreadsheet();
    const resp = e.response;                          // FormResponse
    const answers = resp.getItemResponses();

    // Map คำตอบตามลำดับ items ใน Form
    // index 0 = สถานี, 1 = เพศ, 2 = อายุ
    // index 3–5  = D1 (Q1–Q3)
    // index 6–7  = D2 (Q4–Q5)
    // index 8–9  = D3 (Q6–Q7)
    // index 10–11= D4 (Q8–Q9)
    // index 12–14= D5 (Q10–Q12)
    // index 15–16= D6 (Q13–Q14)
    // index 17–18= D7 (Q15–Q16)
    // index 19   = ข้อเสนอแนะ

    function getAns(idx) {
      return answers[idx] ? answers[idx].getResponse() : "";
    }
    function getScore(idx) {
      const v = parseInt(getAns(idx));
      return isNaN(v) ? 0 : v;
    }

    const stationName = getAns(0);
    const gender      = getAns(1);
    const age         = getAns(2);

    // หา stationId จากชื่อสถานี
    const stSheet = ss.getSheetByName("ข้อมูลทั่วไป");
    let stId = "";
    if (stSheet) {
      const stData = stSheet.getDataRange().getValues();
      let hFound = false;
      for (let i = 0; i < stData.length; i++) {
        if (String(stData[i][0]).includes("ลำดับ")) { hFound = true; continue; }
        if (hFound && String(stData[i][1]).trim() === stationName.trim()) {
          stId = String(stData[i][0]);
          break;
        }
      }
    }

    // คะแนนแต่ละข้อ
    const q  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    const offset = 3; // items 0–2 คือ info
    for (let i = 0; i < 16; i++) {
      q[i] = getScore(offset + i);
    }

    // คะแนนรายด้าน (เฉลี่ย)
    const d1 = avg3(q[0],q[1],q[2]);
    const d2 = avg2(q[3],q[4]);
    const d3 = avg2(q[5],q[6]);
    const d4 = avg2(q[7],q[8]);
    const d5 = avg3(q[9],q[10],q[11]);
    const d6 = avg2(q[12],q[13]);
    const d7 = avg2(q[14],q[15]);

    const totalScore = q.reduce(function(a,b){ return a+b; }, 0);
    const avgScore   = totalScore / 16;
    const level      = getLevel(avgScore);
    const suggestion = getAns(19);
    const ts         = Utilities.formatDate(resp.getTimestamp(), "Asia/Bangkok", "yyyy-MM-dd HH:mm:ss");

    // บันทึกลง Sheet
    const sh = ensureSurveySheet();
    sh.appendRow([
      ts, stId, stationName, gender, age,
      q[0],q[1],q[2],           // D1
      q[3],q[4],                 // D2
      q[5],q[6],                 // D3
      q[7],q[8],                 // D4
      q[9],q[10],q[11],          // D5
      q[12],q[13],               // D6
      q[14],q[15],               // D7
      d1,d2,d3,d4,d5,d6,d7,
      totalScore, avgScore.toFixed(2), level, suggestion
    ]);

    // Highlight สี
    const bgMap = {
      "พึงพอใจมากที่สุด": "#e6f4ea",
      "พึงพอใจมาก":        "#f0faf4",
      "พึงพอใจปานกลาง":   "#fef7e0",
      "พึงพอใจน้อย":       "#fff3e0",
      "ควรปรับปรุง":       "#fce8e6",
    };
    const lastRow = sh.getLastRow();
    sh.getRange(lastRow, 1, 1, SURVEY_HEADER.length).setBackground(bgMap[level] || "#ffffff");

  } catch(err) {
    Logger.log("onSurveySubmit error: " + err.message);
  }
}

function avg2(a, b) { return ((a + b) / 2).toFixed(2); }
function avg3(a, b, c) { return ((a + b + c) / 3).toFixed(2); }

function getLevel(avg) {
  if (avg >= 4.5) return "พึงพอใจมากที่สุด";
  if (avg >= 3.5) return "พึงพอใจมาก";
  if (avg >= 2.5) return "พึงพอใจปานกลาง";
  if (avg >= 1.5) return "พึงพอใจน้อย";
  return "ควรปรับปรุง";
}

function ensureSurveySheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SURVEY_SHEET);
  if (!sh) {
    sh = ss.insertSheet(SURVEY_SHEET);
    sh.appendRow(SURVEY_HEADER);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, SURVEY_HEADER.length)
      .setBackground("#1D9E75").setFontColor("#fff").setFontWeight("bold");
    sh.setColumnWidth(1, 140);
    sh.setColumnWidth(3, 200);
    sh.setColumnWidth(SURVEY_HEADER.length, 300); // ข้อเสนอแนะ
  }
  return sh;
}

// ════════════════════════════════════════════════════════════
//  3. API สำหรับ Web App (เพิ่มใน apiCall switch)
//  case "getSurveySummary":  return getSurveySummary();
//  case "getSurveyComments": return getSurveyComments();
//  case "getSurveyFormUrl":  return getSurveyFormUrl();
// ════════════════════════════════════════════════════════════
function getSurveyFormUrl() {
  const url = PropertiesService.getScriptProperties().getProperty("SURVEY_FORM_URL") || "";
  return { ok: true, url: url };
}

function getSurveySummary() {
  const stResult = getStations();
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SURVEY_SHEET);
  if (!sh || sh.getLastRow() <= 1) {
    return { ok: true, total: 0, totalAvg: 0, byStation: [], recent: [] };
  }

  const data = sh.getDataRange().getValues();
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    if (!r[0]) continue;
    rows.push({
      ts:       r[0],
      stId:     String(r[1]),
      stName:   String(r[2]),
      gender:   String(r[3]),
      age:      String(r[4]),
      d1: parseFloat(r[21]) || 0,
      d2: parseFloat(r[22]) || 0,
      d3: parseFloat(r[23]) || 0,
      d4: parseFloat(r[24]) || 0,
      d5: parseFloat(r[25]) || 0,
      d6: parseFloat(r[26]) || 0,
      d7: parseFloat(r[27]) || 0,
      avgScore:   parseFloat(r[29]) || 0,
      level:      String(r[30]),
      suggestion: String(r[31] || ""),
    });
  }

  // สรุปภาพรวม
  const total    = rows.length;
  const totalAvg = total > 0
    ? (rows.reduce(function(s,r){ return s + r.avgScore; }, 0) / total).toFixed(2)
    : 0;

  // สรุปรายสถานี
  const byStation = {};
  (stResult.data || []).forEach(function(s) {
    byStation[String(s.id)] = {
      stId: String(s.id), stName: s.name,
      count: 0, sumAvg: 0,
      sumD: [0,0,0,0,0,0,0]
    };
  });
  rows.forEach(function(r) {
    if (!byStation[r.stId]) {
      byStation[r.stId] = { stId: r.stId, stName: r.stName, count: 0, sumAvg: 0, sumD: [0,0,0,0,0,0,0] };
    }
    const b = byStation[r.stId];
    b.count++;
    b.sumAvg += r.avgScore;
    b.sumD[0] += r.d1; b.sumD[1] += r.d2; b.sumD[2] += r.d3;
    b.sumD[3] += r.d4; b.sumD[4] += r.d5; b.sumD[5] += r.d6; b.sumD[6] += r.d7;
  });

  const stationSummary = Object.values(byStation).map(function(b) {
    const n = b.count || 1;
    return {
      stId:   b.stId,
      stName: b.stName,
      count:  b.count,
      avg:    b.count > 0 ? (b.sumAvg / b.count).toFixed(2) : "-",
      d:      b.count > 0
        ? b.sumD.map(function(v){ return (v/n).toFixed(2); })
        : ["-","-","-","-","-","-","-"],
    };
  });

  // ข้อเสนอแนะล่าสุด 10 รายการ
  const comments = rows
    .filter(function(r){ return r.suggestion && r.suggestion.trim(); })
    .slice(-10).reverse()
    .map(function(r){ return { stName: r.stName, suggestion: r.suggestion, ts: r.ts }; });

  // เพศ / อายุ distribution
  const genderCount = {}, ageCount = {};
  rows.forEach(function(r) {
    genderCount[r.gender] = (genderCount[r.gender] || 0) + 1;
    ageCount[r.age]       = (ageCount[r.age]       || 0) + 1;
  });

  return {
    ok: true, total: total, totalAvg: totalAvg,
    byStation: stationSummary,
    comments: comments,
    genderCount: genderCount,
    ageCount: ageCount,
  };
}

// ── Custom Menu ──────────────────────────────────────────────
// เพิ่มใน onOpen() เดิม:
// .addItem("สร้าง Google Form ประเมินความพึงพอใจ", "createSurveyForm")
