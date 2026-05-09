// ════════════════════════════════════════════════════════════
//  เพิ่มใน apiCall switch ของ Code.gs
// ════════════════════════════════════════════════════════════
// case "getSurveySummary":  return getSurveySummary();
// case "getSurveyFormUrl":  return getSurveyFormUrl();

// ════════════════════════════════════════════════════════════
//  เพิ่มใน loadPageData() ของ App.html
// ════════════════════════════════════════════════════════════
// else if (page === "surveyreport") loadSurveyReport();

// ════════════════════════════════════════════════════════════
//  เพิ่มใน nav ของ Index.html (admin-only)
// ════════════════════════════════════════════════════════════
// <button class="nav-btn admin-only hidden" onclick="showPage('surveyreport')" data-page="surveyreport">
//   <i class="ti ti-report-analytics"></i> สรุปผลประเมิน
// </button>

// ════════════════════════════════════════════════════════════
//  JS Functions (วางใน App.html)
// ════════════════════════════════════════════════════════════

// ── หน้าสรุปผลประเมิน (admin) ─────────────────────────────
var surveyChart = null;
var surveyRadar = null;

function loadSurveyReport() {
  showLoading(true);
  call("getSurveySummary", {}, function(res) {
    showLoading(false);
    if (!res.ok) { toast("โหลดข้อมูลผิดพลาด", "error"); return; }

    var avg = parseFloat(res.totalAvg);
    var lvl = getLocalLevel(avg);

    // ── KPI ภาพรวม ──
    document.getElementById("srOverall").innerHTML =
      '<div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:8px">' +
      kpiBox(res.total + " คน", "ผู้ตอบแบบประเมินทั้งหมด", "info") +
      kpiBox(res.totalAvg || "-", "คะแนนเฉลี่ยรวม (1–5)", "ok") +
      kpiBox(lvl.text, "ระดับความพึงพอใจภาพรวม", lvl.cls) +
      '</div>';

    // ── แสดง Form URL ──
    call("getSurveyFormUrl", {}, function(urlRes) {
      if (urlRes.ok && urlRes.url) {
        var urlEl = document.getElementById("srFormUrl");
        if (urlEl) {
          urlEl.innerHTML =
            '<div class="alert info" style="margin-bottom:12px">' +
            '<i class="ti ti-link"></i> <strong>Form URL สำหรับแชร์ชาวบ้าน:</strong> ' +
            '<a href="' + urlRes.url + '" target="_blank" style="color:var(--info);word-break:break-all">' + urlRes.url + '</a>' +
            '</div>';
        }
      }
    });

    // ── กราฟแท่งเปรียบเทียบ 7 ด้าน รายสถานี ──
    var dims = ["คุณภาพน้ำ","ปริมาณ/แรงดัน","ความต่อเนื่อง","ราคา","บริการ","โครงสร้าง","สื่อสาร"];
    var colors = ["#1D9E75","#185FA5","#f29900","#d93025","#8B4FCB","#e8730c","#2b9e9e"];
    var stationsWithData = (res.byStation || []).filter(function(s){ return s.count > 0; });

    if (stationsWithData.length > 0) {
      document.getElementById("srBarWrap").style.display = "";
      var ctxBar = document.getElementById("srBarChart").getContext("2d");
      if (surveyChart) surveyChart.destroy();
      surveyChart = new Chart(ctxBar, {
        type: "bar",
        data: {
          labels: dims,
          datasets: stationsWithData.map(function(s, i) {
            return {
              label: s.stName,
              data: s.d.map(function(v){ return parseFloat(v) || 0; }),
              backgroundColor: colors[i % colors.length] + "cc",
              borderColor: colors[i % colors.length],
              borderWidth: 1,
            };
          })
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "bottom" },
            tooltip: { mode: "index" }
          },
          scales: {
            y: { min: 0, max: 5, title: { display: true, text: "คะแนนเฉลี่ย" } }
          }
        }
      });
    } else {
      document.getElementById("srBarWrap").style.display = "none";
    }

    // ── ตารางรายสถานี ──
    var tbody = document.getElementById("srTableBody");
    if (!res.byStation || !res.byStation.length) {
      tbody.innerHTML = '<tr><td colspan="10" class="notice">ยังไม่มีข้อมูล</td></tr>';
    } else {
      tbody.innerHTML = res.byStation.map(function(s) {
        if (!s.count) return '<tr><td><strong>' + s.stName + '</strong></td><td colspan="9" class="notice" style="text-align:left">ยังไม่มีการประเมิน</td></tr>';
        var avgV = parseFloat(s.avg);
        var lvlBadge = '<span class="badge ' + getLocalLevel(avgV).cls + '">' + s.avg + '</span>';
        var dimCells = s.d.map(function(v) {
          var fv = parseFloat(v);
          var color = fv >= 4 ? "var(--primary)" : fv >= 3 ? "var(--info)" : "var(--warn)";
          return '<td style="font-weight:700;color:' + color + ';text-align:center">' + v + '</td>';
        }).join("");
        return '<tr><td><strong>' + s.stName + '</strong></td><td style="text-align:center">' + s.count + '</td><td style="text-align:center">' + lvlBadge + '</td>' + dimCells + '</tr>';
      }).join("");
    }

    // ── ข้อเสนอแนะ ──
    var commEl = document.getElementById("srComments");
    if (!res.comments || !res.comments.length) {
      commEl.innerHTML = '<div class="notice">ยังไม่มีข้อเสนอแนะ</div>';
    } else {
      commEl.innerHTML = res.comments.map(function(c) {
        var ts = c.ts instanceof Date ? c.ts.toLocaleDateString("th-TH") : String(c.ts).split(" ")[0];
        return '<div style="padding:10px 14px;border-left:3px solid var(--primary);background:var(--gray-light);border-radius:0 6px 6px 0;margin-bottom:8px">' +
          '<div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">' + c.stName + ' · ' + ts + '</div>' +
          '<div style="font-size:13px">' + c.suggestion + '</div></div>';
      }).join("");
    }

    // ── สัดส่วนเพศ/อายุ ──
    renderDemographic("srGender", res.genderCount || {}, "เพศ");
    renderDemographic("srAge",    res.ageCount    || {}, "ช่วงอายุ");
  });
}

function kpiBox(val, lbl, cls) {
  return '<div class="kpi ' + cls + '" style="flex:1;min-width:140px"><div class="kpi-val" style="font-size:22px">' + val + '</div><div class="kpi-lbl">' + lbl + '</div></div>';
}

function getLocalLevel(avg) {
  if (avg >= 4.5) return { text: "พึงพอใจมากที่สุด", cls: "ok" };
  if (avg >= 3.5) return { text: "พึงพอใจมาก",       cls: "ok" };
  if (avg >= 2.5) return { text: "ปานกลาง",           cls: "info" };
  if (avg >= 1.5) return { text: "พึงพอใจน้อย",       cls: "warn" };
  if (avg > 0)    return { text: "ควรปรับปรุง",       cls: "danger" };
  return { text: "-", cls: "gray" };
}

function renderDemographic(elId, data, label) {
  var el = document.getElementById(elId);
  if (!el) return;
  var total = Object.values(data).reduce(function(s,v){ return s+v; }, 0);
  if (!total) { el.innerHTML = '<div class="notice">ไม่มีข้อมูล</div>'; return; }
  el.innerHTML = Object.keys(data).filter(function(k){ return k && k !== "ไม่ระบุ"; }).map(function(k) {
    var pct = Math.round(data[k] / total * 100);
    return '<div style="margin-bottom:6px">' +
      '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px"><span>' + k + '</span><span>' + data[k] + ' คน (' + pct + '%)</span></div>' +
      '<div style="height:8px;background:var(--border);border-radius:4px"><div style="height:100%;width:' + pct + '%;background:var(--primary);border-radius:4px"></div></div>' +
      '</div>';
  }).join("");
}
