// ════════════════════════════════════════════════════════════
//  SATISFACTION SURVEY  (เพิ่มใน Code.gs ต่อท้ายโค้ดเดิม)
// ════════════════════════════════════════════════════════════

// เพิ่มใน SHEET constant ด้านบน:
// SURVEY: "แบบประเมินความพึงพอใจ",

// เพิ่มใน apiCall switch:
// case "getSurveyResults":  return getSurveyResults(payload);
// case "addSurveyResult":   return addSurveyResult(payload);
// case "getSurveySummary":  return getSurveySummary();

const SURVEY_HEADER = [
  "ID","วันที่","สถานีID","ชื่อสถานี","หมู่ที่",
  // ด้านที่ 1: คุณภาพน้ำ (3 ข้อ)
  "Q1_สี","Q2_กลิ่น","Q3_ความสะอาด",
  // ด้านที่ 2: ปริมาณและแรงดัน (2 ข้อ)
  "Q4_ปริมาณ","Q5_แรงดัน",
  // ด้านที่ 3: ความต่อเนื่อง (2 ข้อ)
  "Q6_ความต่อเนื่อง","Q7_ไฟดับกระทบ",
  // ด้านที่ 4: ราคาและค่าบริการ (2 ข้อ)
  "Q8_ราคาเหมาะสม","Q9_ใบแจ้งหนี้",
  // ด้านที่ 5: การบริการ (3 ข้อ)
  "Q10_การติดต่อ","Q11_แก้ปัญหาเร็ว","Q12_เจ้าหน้าที่",
  // ด้านที่ 6: โครงสร้างพื้นฐาน (2 ข้อ)
  "Q13_ท่อรั่ว","Q14_มิเตอร์",
  // ด้านที่ 7: การสื่อสาร (2 ข้อ)
  "Q15_แจ้งข่าว","Q16_รับเรื่องร้องเรียน",
  // สรุป
  "คะแนนรวม","ระดับความพึงพอใจ",
  "ข้อเสนอแนะ","เพศ","ช่วงอายุ","เวลาบันทึก"
];

function ensureSurveyHeader() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName("แบบประเมินความพึงพอใจ");
  if (!sh) sh = ss.insertSheet("แบบประเมินความพึงพอใจ");
  if (sh.getLastRow() === 0) {
    sh.appendRow(SURVEY_HEADER);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, SURVEY_HEADER.length)
      .setBackground("#1D9E75").setFontColor("#ffffff").setFontWeight("bold");
  }
  return sh;
}

function addSurveyResult(p) {
  const sh = ensureSurveyHeader();
  const id  = "S" + new Date().getTime();
  const now = Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyy-MM-dd HH:mm:ss");

  // คะแนนทุกข้อ (Q1-Q16)
  const scores = [
    p.q1, p.q2, p.q3,
    p.q4, p.q5,
    p.q6, p.q7,
    p.q8, p.q9,
    p.q10, p.q11, p.q12,
    p.q13, p.q14,
    p.q15, p.q16
  ].map(function(v){ return parseInt(v) || 0; });

  const total = scores.reduce(function(a,b){ return a+b; }, 0);
  const avg   = total / scores.length; // 1-5
  let level   = "ควรปรับปรุง";
  if (avg >= 4.5) level = "พึงพอใจมากที่สุด";
  else if (avg >= 3.5) level = "พึงพอใจมาก";
  else if (avg >= 2.5) level = "พึงพอใจปานกลาง";
  else if (avg >= 1.5) level = "พึงพอใจน้อย";

  sh.appendRow([
    id, p.date, p.stId, p.stName, p.moo,
    ...scores,
    avg.toFixed(2), level,
    p.suggestion || "", p.gender || "", p.age || "", now
  ]);

  // Highlight ตามระดับ
  const bgMap = {
    "พึงพอใจมากที่สุด": "#e6f4ea",
    "พึงพอใจมาก":        "#f0faf4",
    "พึงพอใจปานกลาง":   "#fef7e0",
    "พึงพอใจน้อย":       "#fce8e6",
    "ควรปรับปรุง":       "#fce8e6"
  };
  const lastRow = sh.getLastRow();
  sh.getRange(lastRow, 1, 1, SURVEY_HEADER.length).setBackground(bgMap[level] || "#ffffff");

  return { ok: true, id: id, avg: avg.toFixed(2), level: level };
}

function getSurveyResults(filter) {
  const sh = ensureSurveyHeader();
  const data = sh.getDataRange().getValues();
  if (data.length <= 1) return { ok: true, data: [] };
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    if (!r[0]) continue;
    const dateStr = r[1] instanceof Date
      ? Utilities.formatDate(r[1], "Asia/Bangkok", "yyyy-MM-dd")
      : String(r[1]);
    if (filter && filter.stId && String(r[2]) !== String(filter.stId)) continue;
    rows.push({
      rowIndex: i + 1,
      id:     String(r[0]),
      date:   dateStr,
      stId:   r[2],
      stName: String(r[3] || ""),
      moo:    String(r[4] || ""),
      scores: [r[5],r[6],r[7],r[8],r[9],r[10],r[11],r[12],r[13],r[14],r[15],r[16],r[17],r[18],r[19],r[20]],
      avg:    parseFloat(r[21]) || 0,
      level:  String(r[22] || ""),
      suggestion: String(r[23] || ""),
      gender: String(r[24] || ""),
      age:    String(r[25] || ""),
    });
  }
  rows.sort(function(a,b){ return b.date.localeCompare(a.date); });
  return { ok: true, data: rows };
}

function getSurveySummary() {
  const stResult = getStations();
  const svResult = getSurveyResults({});
  if (!stResult.ok) return stResult;

  // สรุปรายสถานี
  const byStation = {};
  stResult.data.forEach(function(s) {
    byStation[s.id] = {
      stName: s.name, count: 0, sumAvg: 0,
      d1: 0, d2: 0, d3: 0, d4: 0, d5: 0, d6: 0, d7: 0
    };
  });

  svResult.data.forEach(function(r) {
    const b = byStation[r.stId];
    if (!b) return;
    b.count++;
    b.sumAvg += r.avg;
    // รวมคะแนนแต่ละด้าน (index ใน scores[])
    b.d1 += (r.scores[0]+r.scores[1]+r.scores[2]) / 3;
    b.d2 += (r.scores[3]+r.scores[4]) / 2;
    b.d3 += (r.scores[5]+r.scores[6]) / 2;
    b.d4 += (r.scores[7]+r.scores[8]) / 2;
    b.d5 += (r.scores[9]+r.scores[10]+r.scores[11]) / 3;
    b.d6 += (r.scores[12]+r.scores[13]) / 2;
    b.d7 += (r.scores[14]+r.scores[15]) / 2;
  });

  const summary = Object.keys(byStation).map(function(k) {
    const b = byStation[k];
    const n = b.count || 1;
    return {
      stId: k, stName: b.stName, count: b.count,
      avg:  b.count > 0 ? (b.sumAvg / b.count).toFixed(2) : "-",
      d1:   b.count > 0 ? (b.d1/n).toFixed(2) : "-",
      d2:   b.count > 0 ? (b.d2/n).toFixed(2) : "-",
      d3:   b.count > 0 ? (b.d3/n).toFixed(2) : "-",
      d4:   b.count > 0 ? (b.d4/n).toFixed(2) : "-",
      d5:   b.count > 0 ? (b.d5/n).toFixed(2) : "-",
      d6:   b.count > 0 ? (b.d6/n).toFixed(2) : "-",
      d7:   b.count > 0 ? (b.d7/n).toFixed(2) : "-",
    };
  });

  // สรุปภาพรวมทั้งหมด
  const all = svResult.data;
  const totalAvg = all.length > 0
    ? (all.reduce(function(s,r){ return s + r.avg; }, 0) / all.length).toFixed(2)
    : 0;

  return {
    ok: true,
    total: all.length,
    totalAvg: totalAvg,
    byStation: summary
  };
}
