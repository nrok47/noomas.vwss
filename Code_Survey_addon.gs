// ═══════════════════════════════════════════════════════════
//  ส่วนที่ต้องเพิ่มใน Code.gs เดิม
//  ─────────────────────────────────────────────────────────
//  1) ใน apiCall switch เพิ่ม:
//     case "getSurveySummary": return getSurveySummary();
//     case "getSurveyFormUrl": return getSurveyFormUrl();
//
//  2) ใน onOpen() เพิ่ม:
//     .addItem("สร้าง Form ประเมินความพึงพอใจ (รัน 1 ครั้ง)", "createSurveyForm")
//
//  3) วางโค้ดทั้งหมดด้านล่างต่อท้าย Code.gs
// ═══════════════════════════════════════════════════════════

const SURVEY_SHEET = "แบบประเมินความพึงพอใจ";

const SURVEY_HEADER = [
  "Timestamp","สถานีID","ชื่อสถานี","เพศ","ช่วงอายุ",
  "Q1_สีใส","Q2_กลิ่น","Q3_ความสะอาด",
  "Q4_ปริมาณ","Q5_แรงดัน",
  "Q6_ต่อเนื่อง","Q7_ฟื้นตัวเร็ว",
  "Q8_ราคา","Q9_ใบแจ้งหนี้",
  "Q10_ติดต่อได้","Q11_แก้ปัญหาเร็ว","Q12_สุภาพ",
  "Q13_ท่อไม่รั่ว","Q14_มิเตอร์แม่นยำ",
  "Q15_แจ้งล่วงหน้า","Q16_รับเรื่องร้องเรียน",
  "D1_คุณภาพ","D2_ปริมาณ","D3_ต่อเนื่อง",
  "D4_ราคา","D5_บริการ","D6_โครงสร้าง","D7_สื่อสาร",
  "คะแนนรวม","คะแนนเฉลี่ย","ระดับความพึงพอใจ","ข้อเสนอแนะ"
];

// ════════════════════════════════════════════════════════════
//  STEP 1: สร้าง Google Form  (รัน 1 ครั้งเท่านั้น)
// ════════════════════════════════════════════════════════════
function createSurveyForm() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // ดึงรายชื่อสถานีจาก Sheet ข้อมูลทั่วไป
  const stSheet = ss.getSheetByName("ข้อมูลทั่วไป");
  const stations = [];
  if (stSheet) {
    const rows = stSheet.getDataRange().getValues();
    let found = false;
    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][0]).includes("ลำดับ")) { found = true; continue; }
      if (found && rows[i][1] && !isNaN(parseFloat(rows[i][0])))
        stations.push(String(rows[i][1]).trim());
    }
  }
  if (!stations.length) stations.push("ระบบประปาในพื้นที่");

  // สร้าง Form
  const form = FormApp.create("แบบประเมินความพึงพอใจผู้ใช้น้ำประปา เทศบาลตำบลห้องแซง");
  form.setDescription(
    "กรุณาประเมินความพึงพอใจในการใช้บริการน้ำประปา\n" +
    "เกณฑ์คะแนน: 1=ควรปรับปรุง  2=พึงพอใจน้อย  3=ปานกลาง  4=พึงพอใจมาก  5=พึงพอใจมากที่สุด"
  );
  form.setCollectEmail(false);
  form.setLimitOneResponsePerUser(false);
  form.setConfirmationMessage("ขอบคุณสำหรับการประเมิน ข้อมูลของท่านมีประโยชน์อย่างมาก 🙏");

  // ── ข้อมูลทั่วไป ─────────────────────────────────────────
  form.addSectionHeaderItem()
    .setTitle("ส่วนที่ 1: ข้อมูลผู้ตอบแบบสอบถาม");

  form.addListItem()                                         // idx 0
    .setTitle("สถานีประปาที่ท่านใช้บริการ")
    .setChoiceValues(stations).setRequired(true);

  form.addMultipleChoiceItem()                               // idx 1
    .setTitle("เพศ")
    .setChoiceValues(["ชาย","หญิง","ไม่ระบุ"]).setRequired(false);

  form.addMultipleChoiceItem()                               // idx 2
    .setTitle("ช่วงอายุ")
    .setChoiceValues(["ต่ำกว่า 20 ปี","20–35 ปี","36–50 ปี","51–65 ปี","มากกว่า 65 ปี"])
    .setRequired(false);

  // helper สร้าง Scale item
  function addScale(q) {
    form.addScaleItem()
      .setTitle(q)
      .setLabels("ควรปรับปรุง","พึงพอใจมากที่สุด")
      .setBounds(1, 5).setRequired(true);
  }

  // ── ด้านที่ 1: คุณภาพน้ำ (idx 3,4,5) ───────────────────
  form.addSectionHeaderItem().setTitle("ด้านที่ 1: คุณภาพน้ำประปา");
  addScale("น้ำประปามีสีใส ไม่มีตะกอนหรือสิ่งแปลกปลอม");
  addScale("น้ำประปาไม่มีกลิ่นผิดปกติ");
  addScale("น้ำประปาสะอาด ปลอดภัยสำหรับการอุปโภค");

  // ── ด้านที่ 2: ปริมาณ/แรงดัน (idx 6,7) ─────────────────
  form.addSectionHeaderItem().setTitle("ด้านที่ 2: ปริมาณและแรงดันน้ำ");
  addScale("ปริมาณน้ำเพียงพอต่อความต้องการในครัวเรือน");
  addScale("แรงดันน้ำเหมาะสม ไม่อ่อนหรือแรงเกินไป");

  // ── ด้านที่ 3: ความต่อเนื่อง (idx 8,9) ──────────────────
  form.addSectionHeaderItem().setTitle("ด้านที่ 3: ความต่อเนื่องของการให้บริการ");
  addScale("น้ำประปาไหลต่อเนื่องตลอด 24 ชั่วโมง");
  addScale("เมื่อเกิดปัญหาหรือไฟฟ้าดับ ระบบฟื้นตัวได้รวดเร็ว");

  // ── ด้านที่ 4: ราคา (idx 10,11) ─────────────────────────
  form.addSectionHeaderItem().setTitle("ด้านที่ 4: ราคาและค่าบริการ");
  addScale("ราคาค่าน้ำประปามีความเหมาะสมกับคุณภาพที่ได้รับ");
  addScale("ใบแจ้งหนี้/ใบเสร็จมีความถูกต้องและชัดเจน");

  // ── ด้านที่ 5: บริการ (idx 12,13,14) ────────────────────
  form.addSectionHeaderItem().setTitle("ด้านที่ 5: การบริการของเจ้าหน้าที่");
  addScale("ติดต่อเจ้าหน้าที่ได้ง่าย สะดวก");
  addScale("เจ้าหน้าที่แก้ไขปัญหาได้รวดเร็วเมื่อมีการแจ้ง");
  addScale("เจ้าหน้าที่มีความสุภาพและให้บริการด้วยความเต็มใจ");

  // ── ด้านที่ 6: โครงสร้าง (idx 15,16) ───────────────────
  form.addSectionHeaderItem().setTitle("ด้านที่ 6: โครงสร้างพื้นฐาน");
  addScale("ท่อน้ำประปาอยู่ในสภาพดี ไม่รั่วซึมบ่อยครั้ง");
  addScale("มิเตอร์น้ำทำงานได้ถูกต้องและแม่นยำ");

  // ── ด้านที่ 7: สื่อสาร (idx 17,18) ─────────────────────
  form.addSectionHeaderItem().setTitle("ด้านที่ 7: การสื่อสารและรับเรื่องร้องเรียน");
  addScale("มีการแจ้งล่วงหน้าเมื่อน้ำจะหยุดหรือมีการซ่อมบำรุง");
  addScale("ช่องทางรับเรื่องร้องเรียนเข้าถึงง่าย และมีการติดตามผล");

  // ── ข้อเสนอแนะ (idx 19) ─────────────────────────────────
  form.addSectionHeaderItem().setTitle("ข้อเสนอแนะ");
  form.addParagraphTextItem()
    .setTitle("มีข้อเสนอแนะหรือความคิดเห็นเพิ่มเติมอะไรบ้าง?")
    .setRequired(false);

  // ── ผูก Form กับ Spreadsheet ─────────────────────────────
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // ── เก็บ URL ไว้ใน Script Properties ────────────────────
  const shortUrl = form.shortenFormUrl(form.getPublishedUrl());
  PropertiesService.getScriptProperties().setProperties({
    SURVEY_FORM_ID:  form.getId(),
    SURVEY_FORM_URL: shortUrl,
  });

  // ── ตั้ง Trigger onFormSubmit ─────────────────────────────
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === "onSurveySubmit") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("onSurveySubmit")
    .forSpreadsheet(ss).onFormSubmit().create();

  // ── สร้าง Sheet รับผล ─────────────────────────────────────
  ensureSurveySheet();

  SpreadsheetApp.getUi().alert(
    "✅ สร้าง Google Form สำเร็จ!\n\n" +
    "🔗 แชร์ URL นี้ให้ชาวบ้าน:\n" + shortUrl + "\n\n" +
    "📌 Trigger onFormSubmit ถูกตั้งค่าแล้วอัตโนมัติ\n" +
    "📊 Sheet 'แบบประเมินความพึงพอใจ' ถูกสร้างแล้ว"
  );
}

// ════════════════════════════════════════════════════════════
//  STEP 2: Trigger — ทำงานทุกครั้งที่มีคนตอบ Form
// ════════════════════════════════════════════════════════════
function onSurveySubmit(e) {
  try {
    const ss      = SpreadsheetApp.getActiveSpreadsheet();
    const answers = e.response.getItemResponses();

    // ── ดึงคำตอบตาม index ────────────────────────────────────
    // idx 0=สถานี  1=เพศ  2=อายุ  3-5=D1  6-7=D2  8-9=D3
    // 10-11=D4  12-14=D5  15-16=D6  17-18=D7  19=ข้อเสนอแนะ
    function ans(i) { return answers[i] ? answers[i].getResponse() : ""; }
    function score(i) { var v = parseInt(ans(i)); return isNaN(v) ? 0 : v; }

    const stName = ans(0);
    const gender = ans(1);
    const age    = ans(2);

    // หา stationId จากชื่อ
    let stId = "";
    const stSh = ss.getSheetByName("ข้อมูลทั่วไป");
    if (stSh) {
      const d = stSh.getDataRange().getValues();
      let hf = false;
      for (let i = 0; i < d.length; i++) {
        if (String(d[i][0]).includes("ลำดับ")) { hf = true; continue; }
        if (hf && String(d[i][1]).trim() === stName.trim()) { stId = String(d[i][0]); break; }
      }
    }

    // คะแนนแต่ละข้อ Q1–Q16
    const q = [];
    for (let i = 0; i < 16; i++) q.push(score(3 + i));

    // คะแนนรายด้าน
    const d1 = ((q[0]+q[1]+q[2])/3).toFixed(2);
    const d2 = ((q[3]+q[4])/2).toFixed(2);
    const d3 = ((q[5]+q[6])/2).toFixed(2);
    const d4 = ((q[7]+q[8])/2).toFixed(2);
    const d5 = ((q[9]+q[10]+q[11])/3).toFixed(2);
    const d6 = ((q[12]+q[13])/2).toFixed(2);
    const d7 = ((q[14]+q[15])/2).toFixed(2);

    const total   = q.reduce(function(s,v){ return s+v; }, 0);
    const avgScore = (total / 16).toFixed(2);
    const level   = calcLevel(parseFloat(avgScore));
    const suggest = ans(19);
    const ts      = Utilities.formatDate(e.response.getTimestamp(), "Asia/Bangkok", "yyyy-MM-dd HH:mm:ss");

    // ── บันทึกลง Sheet ────────────────────────────────────────
    const sh = ensureSurveySheet();
    sh.appendRow([
      ts, stId, stName, gender, age,
      q[0],q[1],q[2],            // D1
      q[3],q[4],                  // D2
      q[5],q[6],                  // D3
      q[7],q[8],                  // D4
      q[9],q[10],q[11],           // D5
      q[12],q[13],                // D6
      q[14],q[15],                // D7
      d1,d2,d3,d4,d5,d6,d7,
      total, avgScore, level, suggest
    ]);

    // Highlight สีตามระดับ
    const bg = {"พึงพอใจมากที่สุด":"#e6f4ea","พึงพอใจมาก":"#f0faf4",
                "พึงพอใจปานกลาง":"#fef7e0","พึงพอใจน้อย":"#fff3e0","ควรปรับปรุง":"#fce8e6"};
    const lastRow = sh.getLastRow();
    sh.getRange(lastRow,1,1,SURVEY_HEADER.length).setBackground(bg[level]||"#fff");

  } catch(err) {
    Logger.log("onSurveySubmit error: " + err.message);
  }
}

function calcLevel(avg) {
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
    sh.getRange(1,1,1,SURVEY_HEADER.length)
      .setBackground("#1D9E75").setFontColor("#fff").setFontWeight("bold");
    sh.setColumnWidths(1, SURVEY_HEADER.length, 90);
    sh.setColumnWidth(3, 220);
    sh.setColumnWidth(SURVEY_HEADER.length, 300);
  }
  return sh;
}

// ════════════════════════════════════════════════════════════
//  STEP 3: API สำหรับ Web App Dashboard
// ════════════════════════════════════════════════════════════
function getSurveyFormUrl() {
  const url = PropertiesService.getScriptProperties().getProperty("SURVEY_FORM_URL") || "";
  return { ok: true, url: url };
}

function getSurveySummary() {
  const stResult = getStations();
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SURVEY_SHEET);
  if (!sh || sh.getLastRow() <= 1)
    return { ok:true, total:0, totalAvg:"0", byStation:[], comments:[], genderCount:{}, ageCount:{} };

  const data = sh.getDataRange().getValues();
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    if (!r[0]) continue;
    const ts = r[0] instanceof Date
      ? Utilities.formatDate(r[0],"Asia/Bangkok","yyyy-MM-dd HH:mm")
      : String(r[0]).substring(0,16);
    rows.push({
      ts:      ts,
      stId:    String(r[1]),
      stName:  String(r[2]),
      gender:  String(r[3]),
      age:     String(r[4]),
      avg:     parseFloat(r[29]) || 0,
      level:   String(r[30]),
      suggest: String(r[31]||""),
      d: [
        parseFloat(r[21])||0, parseFloat(r[22])||0, parseFloat(r[23])||0,
        parseFloat(r[24])||0, parseFloat(r[25])||0, parseFloat(r[26])||0,
        parseFloat(r[27])||0
      ],
    });
  }

  // ภาพรวม
  const total    = rows.length;
  const totalAvg = total > 0
    ? (rows.reduce(function(s,r){return s+r.avg;},0)/total).toFixed(2) : "0";

  // รายสถานี
  const bySt = {};
  (stResult.data||[]).forEach(function(s){
    bySt[String(s.id)] = {stId:String(s.id),stName:s.name,count:0,sumAvg:0,sumD:[0,0,0,0,0,0,0]};
  });
  rows.forEach(function(r){
    if (!bySt[r.stId]) bySt[r.stId]={stId:r.stId,stName:r.stName,count:0,sumAvg:0,sumD:[0,0,0,0,0,0,0]};
    var b=bySt[r.stId]; b.count++; b.sumAvg+=r.avg;
    r.d.forEach(function(v,i){b.sumD[i]+=v;});
  });
  const byStation = Object.values(bySt).map(function(b){
    var n=b.count||1;
    return {
      stId:b.stId, stName:b.stName, count:b.count,
      avg: b.count>0?(b.sumAvg/b.count).toFixed(2):"-",
      d:   b.count>0?b.sumD.map(function(v){return (v/n).toFixed(2);}):["–","–","–","–","–","–","–"],
    };
  });

  // ข้อเสนอแนะล่าสุด 10 รายการ
  const comments = rows
    .filter(function(r){return r.suggest&&r.suggest.trim();})
    .slice(-10).reverse()
    .map(function(r){return {stName:r.stName,suggest:r.suggest,ts:r.ts};});

  // Demographics
  const genderCount={}, ageCount={};
  rows.forEach(function(r){
    genderCount[r.gender]=(genderCount[r.gender]||0)+1;
    ageCount[r.age]=(ageCount[r.age]||0)+1;
  });

  return { ok:true, total:total, totalAvg:totalAvg, byStation:byStation,
           comments:comments, genderCount:genderCount, ageCount:ageCount };
}
