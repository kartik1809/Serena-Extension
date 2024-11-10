const backgroundJS = chrome.extension.getBackgroundPage(),
  htmlTemplates = document.querySelector(".js-templates");
let data,
  html,
  ranks = {},
  dateElCurrent = document.querySelector(".js-chart-types__current-day");
const getDomainsData = (e, t) => {
    let a,
      s,
      n,
      r,
      o,
      l,
      d,
      i,
      c,
      u = 0;
    const m = dateElCurrent.dataset.date;
    if (
      ((o =
        getDateDiffDays(backgroundJS.dates.today, backgroundJS.dates.start) +
        1),
      (a = {
        range: e,
        resolution: t,
        dateStart: backgroundJS.dates.start,
        daysSinceStart: o,
        domains: [],
        total: {
          name: "Total",
          time: 0,
          percentage: 100,
          percentageText: "100.00 %",
        },
      }),
      (s = backgroundJS.domains),
      e === RANGE_DAY)
    )
      for (l in ((n = m),
      (r = Object.values(s).reduce(
        (e, t) => e + (t?.days?.[n]?.seconds || 0),
        0
      )),
      s))
        s.hasOwnProperty(l) &&
          s[l].days.hasOwnProperty(n) &&
          ((d = (s[l].days[n].seconds / r) * 100),
          (i = getPercentageString(d)),
          (c = d > GRAPH_MIN_PERCENTAGE_TO_INCLUDE),
          (u += c ? 1 : 0),
          a.domains.push({
            name: s[l].name,
            time: s[l].days[n].seconds,
            percentage: d,
            percentageString: i,
            graphed: c,
          }));
    if (e === RANGE_AVERAGE)
      for (l in ((r = backgroundJS.seconds.alltime / o), s))
        s.hasOwnProperty(l) &&
          ((d = ((s[l].alltime.seconds / r) * 100) / o),
          (i = getPercentageString(d)),
          (c = d > GRAPH_MIN_PERCENTAGE_TO_INCLUDE),
          (u += c ? 1 : 0),
          a.domains.push({
            name: s[l].name,
            time: parseInt(s[l].alltime.seconds / o),
            percentage: d,
            percentageString: i,
            graphed: c,
          }));
    if (e === RANGE_ALLTIME)
      for (l in ((r = backgroundJS.seconds.alltime), s))
        s.hasOwnProperty(l) &&
          ((d = (s[l].alltime.seconds / r) * 100),
          (i = getPercentageString(d)),
          (c = d > GRAPH_MIN_PERCENTAGE_TO_INCLUDE),
          (u += c ? 1 : 0),
          a.domains.push({
            name: s[l].name,
            time: s[l].alltime.seconds,
            percentage: d,
            percentageString: i,
            graphed: c,
          }));
    for (
      a.total.time = r,
        a.domains.sort((e, t) => t.percentage - e.percentage),
        l = 0;
      l < a.domains.length;
      l++
    )
      a.domains[l].graphed && (a.domains[l].color = getHSL(l, u));
    return a;
  },
  updateDoughnutInfotext = (e, t, a) => {
    (document.querySelector(
      "#doughnut-" + e + " .foreign-object .name"
    ).innerHTML = t),
      (document.querySelector(
        "#doughnut-" + e + " .foreign-object .percentage"
      ).innerHTML = a);
  },
  renderUIRange = (e, t, a, s, n) => {
    let r = getDomainsData(e, t);
    a && renderUIRangeDoughnut(r, e),
      s && renderUIRangeTable(r, e),
      n && countRanks(r.domains, e);
  },
  renderUIRangeTable = (e, t) => {
    let a = tplHtmlTable(e);
    htmlRenderInto("table-" + t, a);
  },
  renderUIRangeDoughnut = (e, t) => {
    let a = tplElementDoughnut(e, backgroundJS.settings.graphGap);
    elementInsertInto("doughnut-" + t, a);
  },
  countRanks = (e, t) => {
    let a;
    for (ranks[t] = { total: e.length, domains: {} }, a = 0; a < e.length; a++)
      ranks[t].domains[e[a].name] = a + 1;
  },
  renderControlIdleTime = () => {
    let e = {
      min: 0,
      max: [IDLE_TIME_TABLE.length - 1],
      raw: getSliderRawFromComputed(
        IDLE_TIME_TABLE,
        IDLE_TIME_DEFAULT,
        backgroundJS.settings.idleTime
      ),
      computed: getIdleTimeComputedString(backgroundJS.settings.idleTime),
      default: getIdleTimeComputedString(IDLE_TIME_DEFAULT),
    };
    (html = tplHtmlIdleTimeControl(e)), htmlRenderInto("idle-time", html);
  },
  renderControlGraphGap = () => {
    let e = {
      min: 0,
      max: [GRAPH_GAP_TABLE.length - 1],
      raw: getSliderRawFromComputed(
        GRAPH_GAP_TABLE,
        GRAPH_GAP_DEFAULT,
        backgroundJS.settings.graphGap
      ),
    };
    (html = tplHtmlGraphGapControl(e)), htmlRenderInto("graph-gap", html);
  };
let renderControlBadgeDisplay = () => {
  let e = { checked: backgroundJS.settings.badgeDisplay };
  (html = tplHtmlBadgeDisplayControl(e)), htmlRenderInto("badge-display", html);
};
const clearOverallStats = () => {
  (document.querySelector(
    "#pseudomodal .container.stats .stats-wrapper .text"
  ).innerHTML = ""),
    (document.querySelector(
      "#pseudomodal .container.stats .stats-wrapper .charts"
    ).innerHTML = ""),
    (document.querySelector(
      "#pseudomodal .container.stats .stats-wrapper"
    ).dataset.statsReady = "0");
};
let renderUI = () => {
  renderUIRange(RANGE_DAY, RESOLUTION_HOURS, !0, !0, !0),
    renderUIRange(RANGE_AVERAGE, RESOLUTION_HOURS, !0, !0, !1),
    renderUIRange(RANGE_ALLTIME, RESOLUTION_DAYS, !0, !0, !0),
    renderControlIdleTime(),
    renderControlGraphGap(),
    renderControlBadgeDisplay(),
    (document.querySelector(
      "#pseudomodal .container.stats .stats-wrapper .text"
    ).innerHTML = ""),
    (document.querySelector(
      "#pseudomodal .container.stats .stats-wrapper .charts"
    ).innerHTML = ""),
    (document.querySelector(
      "#pseudomodal .container.stats .stats-wrapper"
    ).dataset.statsReady = "0"),
    dcl("UI rendered");
};
const screenshotUIShow = () => {
    document.querySelector("html").classList.add("screenshot-mode"),
      (document.querySelector(".footer").style.display = "none"),
      screenshotUICaptureShow(),
      chrome.permissions.contains({ origins: ["<all_urls>"] }, (e) => {
        if (
          (chrome.runtime.lastError &&
            chrome.runtime.lastError.message &&
            dcl(
              "Screenshot - permission.contains: " +
                chrome.runtime.lastError.message
            ),
          e)
        ) {
          if (!backgroundJS.settings.screenshotInstructionsRead) {
            let e = htmlTemplates.querySelector(
                "#screenshot-info-instructions-list"
              ),
              t = document.importNode(e.content, !0);
            elementInsertIntoElement(
              document.querySelector(".screenshot-info .instructions .list"),
              t
            ),
              (document.querySelector(".screenshot-overlay").style.display =
                "block"),
              (document.querySelector(".screenshot-info").style.display =
                "block"),
              (document.querySelector(
                ".screenshot-info .instructions"
              ).style.display = "block"),
              (document.querySelector(
                ".screenshot-info .permission-grant"
              ).style.display = "none"),
              backgroundJS.setScreenshotInstructionsRead(!0),
              backgroundJS.saveScreenshotInstructionsRead();
          }
        } else
          (document.querySelector(".screenshot-overlay").style.display =
            "block"),
            (document.querySelector(".screenshot-info").style.display =
              "block"),
            (document.querySelector(
              ".screenshot-info .instructions"
            ).style.display = "none"),
            (document.querySelector(
              ".screenshot-info .permission-grant"
            ).style.display = "block");
      });
  },
  screenshotUIHide = () => {
    (document.querySelector(".screenshot-overlay").style.display = "none"),
      (document.querySelector(".screenshot-info").style.display = "none");
  },
  screenshotUICaptureShow = () => {
    document.querySelector(".screenshot-capture").style.display = "block";
  },
  screenshotUICaptureHide = () => {
    document.querySelector(".screenshot-capture").style.display = "none";
  },
  renderScreenshotUI = () => {
    window.location.search === SCREENSHOT_MODE_QUERY &&
      ((SCREENSHOT_MODE = !0), screenshotUIShow());
  },
  initialize = () => {
    (dateElCurrent.dataset.date = getDateString()),
      renderUI(),
      window.location.search === SCREENSHOT_MODE_QUERY &&
        ((SCREENSHOT_MODE = !0), screenshotUIShow()),
      dcl("Application initialized");
  };
(dateElCurrent.dataset.date = getDateString()),
  renderUI(),
  window.location.search === SCREENSHOT_MODE_QUERY &&
    ((SCREENSHOT_MODE = !0), screenshotUIShow()),
  dcl("Application initialized"),
  addMultipleDelegatedEventListeners("body", "click", (e, t) => {
    if (e.detail >= 2)
      if (document.selection && document.selection.empty)
        document.selection.empty();
      else if (window.getSelection) {
        window.getSelection().removeAllRanges();
      }
  }),
  addMultipleDelegatedEventListeners(
    ".doughnut .group",
    "click,mouseover,mouseout",
    (e, t) => {
      let a,
        s,
        n = "",
        r = "",
        o = t.parentNode.getAttribute("wt:range"),
        l = t.getAttribute("wt:connect-id"),
        d = t.getAttribute("wt:url"),
        i = t.getAttribute("wt:no-data"),
        c = !1;
      if ("click" === e.type) "other" !== d && window.open("http://" + d);
      else {
        let d = document.querySelectorAll(
          "#table-" + o + ' tr.domain[data-connect-id="' + l + '"]'
        );
        if ("mouseover" === e.type) {
          let e = document.querySelectorAll("#doughnut-" + o + " .group");
          for (a = 0; a < e.length; a++) e[a].classList.remove("active");
          t.classList.add("active"),
            (n = t.getAttribute("wt:name")),
            (r = t.getAttribute("wt:percentage-string"));
          let l = document.querySelectorAll("#table-" + o + " tr.domain");
          if (l) for (s = 0; s < l.length; s++) l[s].classList.remove("active");
          if (d) for (s = 0; s < d.length; s++) d[s].classList.add("active");
        } else if (SCREENSHOT_MODE) c = !0;
        else if ((t.classList.remove("active"), d.length > 0))
          for (s = 0; s < d.length; s++) d[s].classList.remove("active");
        "false" === i && !1 === c && updateDoughnutInfotext(o, n, r);
      }
    }
  ),
  addMultipleDelegatedEventListeners(
    ".datatable tbody tr",
    "click,mouseover,mouseout",
    (e, t) => {
      let a,
        s = "",
        n = "",
        r = t.parentNode.parentNode.dataset.range,
        o = t.dataset.connectId,
        l = t.dataset.url;
      if ("click" === e.type && t.classList.contains("domain"))
        renderDomainStats({ contextEl: t, range: r, connectId: o, url: l });
      else {
        let d = document.querySelector(
          "#doughnut-" + r + ' .group[wt\\:connect-id="' + o + '"]'
        );
        if (d) {
          if ("mouseover" === e.type) {
            let e = document.querySelectorAll("#table-" + r + " tr.domain");
            if (e)
              for (a = 0; a < e.length; a++) e[a].classList.remove("active");
            d.classList.add("active"),
              (s = d.getAttribute("wt:name")),
              (n = d.getAttribute("wt:percentage-string"));
          }
          if (
            ("mouseout" === e.type && d.classList.remove("active"),
            t.classList.contains("stats"))
          ) {
            let t = document.querySelector(
              "#table-" + r + ' tr.domain[data-url="' + l + '"]'
            );
            "mouseover" === e.type
              ? t.classList.add("active")
              : t.classList.remove("active");
          }
          updateDoughnutInfotext(r, s, n);
        }
      }
    }
  ),
  addMultipleDelegatedEventListeners(
    ".chart-days .chart .days g.group",
    "mouseover,mouseout",
    (e, t) => {
      let a = t.closest(".chart-days").querySelector(".info .date"),
        s = t.closest(".chart-days").querySelector(".info .time"),
        n = t.getAttribute("wt:date"),
        r = t.getAttribute("wt:time");
      "mouseover" === e.type
        ? ((a.innerHTML = n),
          (s.innerHTML = tplHtmlTimeObjectFragment({
            value: r,
            resolution: RESOLUTION_HOURS,
          })))
        : "mouseout" === e.type &&
          ((a.innerHTML = "&nbsp;"), (s.innerHTML = "&nbsp;"));
    }
  ),
  addMultipleDelegatedEventListeners(
    ".chart-daynames .chart .daynames g.group",
    "mouseover,mouseout",
    (e, t) => {
      let a = t.closest(".chart-daynames").querySelector(".info .percentage"),
        s = t.closest(".chart-daynames").querySelector(".info .time"),
        n = t.getAttribute("wt:percentage-string"),
        r = t.getAttribute("wt:time");
      "mouseover" === e.type
        ? ((s.innerHTML = tplHtmlTimeObjectFragment({
            value: r,
            resolution: RESOLUTION_DAYS,
          })),
          (a.innerHTML = n))
        : "mouseout" === e.type &&
          ((s.innerHTML = "&nbsp;"), (a.innerHTML = "&nbsp;"));
    }
  ),
  addMultipleDelegatedEventListeners(
    ".js-chart-types .js-chart-types__visibility",
    "click",
    (e, t) => {
      e.preventDefault();
      let a = t.dataset.visibility;
      document.getElementById("wrapper").dataset.visibility = a;
    }
  ),
  addMultipleDelegatedEventListeners(
    ".js-chart-types__change-day",
    "click",
    (e, t) => {
      e.preventDefault();
      const a = dateElCurrent.dataset.date,
        s = backgroundJS.dates.start,
        n = backgroundJS.dates.today,
        r = getDateDiffDays(s, n);
      let o = s;
      loadIsSupporter((e) => {
        if (!e && r >= 3) {
          const e = new Date(n);
          e.setDate(e.getDate() - 3), (o = e.toISOString().split("T")[0]);
        }
        const l = new Date(a),
          d = parseInt(t.dataset.shift);
        l.setDate(l.getDate() + d);
        const i = l.toISOString().split("T")[0];
        if (i >= s && i <= n) {
          dateElCurrent.dataset.date = i;
          const t = document.querySelector(".js-doughnut-day"),
            a = document.querySelector(".js-datatable-day__table"),
            s = document.querySelector(".js-datatable-day__pwyl-message");
          !e && i < o
            ? (t.classList.add("is-blurred"),
              a.classList.add("is-hidden"),
              s.classList.remove("is-hidden"))
            : (t.classList.remove("is-blurred"),
              a.classList.remove("is-hidden"),
              s.classList.add("is-hidden")),
            renderUIRange(RANGE_DAY, RESOLUTION_HOURS, !0, !0, !0),
            dcl("UI updated");
        }
      });
    }
  ),
  addMultipleDelegatedEventListeners(
    "#pseudomodal .menu a",
    "click",
    (e, t) => {
      e.preventDefault();
      let a = t.getAttribute("id");
      if ("screenshot" !== a)
        document.querySelector("#pseudomodal").dataset.visibility = a;
      else if (SCREENSHOT_MODE) {
        document.querySelector("#pseudomodal").dataset.visibility = a;
        let e = htmlTemplates.querySelector(
            "#screenshot-info-instructions-list"
          ),
          t = document.importNode(e.content, !0);
        elementInsertIntoElement(
          document.querySelector("#pseudomodal .container.screenshot .list"),
          t
        );
      }
      if ("stats" === a) {
        let e = document.querySelector(
          "#pseudomodal .container.stats .stats-wrapper"
        );
        if ("1" !== e.dataset.statsReady) {
          dcl("Stats overall - render");
          let t = getAvailableElementWidth(e),
            a = getOverallData(),
            s = htmlTemplates.querySelector("#stats-overall");
          tplElementStatsOverall(a, s.content);
          let n = document.importNode(s.content, !0);
          if (
            (elementInsertIntoElement(e.querySelector(".text"), n),
            a.days.visited > 0)
          ) {
            let s = htmlTemplates.querySelector("#stats-charts");
            tplElementStatsCharts(a, s.content);
            let n = document.importNode(s.content, !0);
            elementInsertIntoElement(e.querySelector(".charts"), n);
            let r = tplElementChartStatsDays({
              chartWidth: t,
              chartHeight: CHART_STATS_HEIGHT_DAYS,
              stepHeightMin: CHART_STATS_STEP_HEIGHT_MIN,
              timeValueMax: a.timeValues.max,
              daysTotal: a.days.total,
              days: a.dates.days,
            });
            elementInsertIntoElement(e.querySelector(".chart-days .chart"), r);
            let o = tplElementChartStatsDaynames({
              chartWidth: t,
              chartHeight: CHART_STATS_HEIGHT_DAYNAMES,
              stepHeightMin: CHART_STATS_STEP_HEIGHT_MIN,
              daynames: a.dates.daynames,
            });
            elementInsertIntoElement(
              e.querySelector(".chart-daynames .chart"),
              o
            );
          }
          e.dataset.statsReady = "1";
        }
      }
    }
  ),
  addMultipleDelegatedEventListeners(
    "#pseudomodal #idle-time .slider",
    "input,change",
    (e, t) => {
      let a = t.value,
        s = getIdleTimeComputedFromRaw(a),
        n = getIdleTimeComputedString(s);
      (document.querySelector("#pseudomodal #idle-time .display").innerHTML =
        n),
        "change" === e.type &&
          (backgroundJS.setIdleTime(s),
          backgroundJS.saveIdleTime(),
          dcl("Idle time saved: " + s));
    }
  ),
  addMultipleDelegatedEventListeners(
    "#pseudomodal #graph-gap .slider",
    "input,change",
    (e, t) => {
      let a = t.value,
        s = getSliderComputedFromRaw(GRAPH_GAP_TABLE, GRAPH_GAP_DEFAULT, a);
      (document.querySelector("#pseudomodal #graph-gap .display").innerHTML =
        a),
        "change" === e.type &&
          (backgroundJS.setGraphGap(s),
          backgroundJS.saveGraphGap(),
          renderUIRange(RANGE_DAY, RESOLUTION_HOURS, !0, !1, !1),
          renderUIRange(RANGE_AVERAGE, RESOLUTION_DAYS, !0, !1, !1),
          renderUIRange(RANGE_ALLTIME, RESOLUTION_DAYS, !0, !1, !1),
          dcl("Graph gap saved: " + s));
    }
  ),
  addMultipleDelegatedEventListeners(
    "#pseudomodal #badge-display .checkbox",
    "change",
    (e, t) => {
      let a = t.checked;
      "change" === e.type &&
        (backgroundJS.setBadgeDisplay(a),
        backgroundJS.saveBadgeDisplay(),
        backgroundJS.updateDomains(!0),
        dcl("Badge display saved: " + a));
    }
  ),
  addMultipleDelegatedEventListeners(
    "#pseudomodal .trigger",
    "click",
    (e, t) => {
      e.preventDefault(),
        t.parentNode.querySelector(".confirm").classList.add("visible");
    }
  ),
  addMultipleDelegatedEventListeners(
    "#pseudomodal .confirm .cancel",
    "click",
    (e, t) => {
      e.preventDefault(), t.parentNode.classList.remove("visible");
    }
  ),
  addMultipleDelegatedEventListeners(
    "#pseudomodal .options-clear-all",
    "click",
    (e, t) => {
      let a = t.querySelector(".text"),
        s = t.querySelector(".loading");
      e.preventDefault(),
        t.classList.contains("active")
          ? (t.classList.remove("active"),
            (a.innerText = a.dataset.default),
            s.classList.remove("running"),
            backgroundJS.clearAllGeneratedData(),
            (dateElCurrent.dataset.date = getDateString()),
            renderUI(),
            dcl("All data cleared"))
          : (t.classList.add("active"),
            (a.innerText = a.dataset.active),
            s.classList.add("running", "warning"),
            (s.querySelector(".shifter").style.animationDuration =
              INTERVAL_UI_LOADING + "ms"),
            setTimeout(() => {
              t.classList.remove("active"),
                (a.innerText = a.dataset.default),
                s.classList.remove("running");
            }, INTERVAL_UI_LOADING));
    }
  ),
  addMultipleDelegatedEventListeners(
    "#pseudomodal .options-reset-settings",
    "click",
    (e, t) => {
      let a = t.querySelector(".text"),
        s = t.querySelector(".loading");
      e.preventDefault(),
        t.classList.contains("active")
          ? (t.classList.remove("active"),
            (a.innerText = a.dataset.default),
            s.classList.remove("running"),
            (backgroundJS.settings.idleTime = IDLE_TIME_DEFAULT),
            backgroundJS.saveIdleTime(),
            (backgroundJS.settings.graphGap = GRAPH_GAP_DEFAULT),
            backgroundJS.saveGraphGap(),
            (backgroundJS.settings.badgeDisplay = BADGE_DISPLAY_DEFAULT),
            backgroundJS.saveBadgeDisplay(),
            backgroundJS.updateDomains(!0),
            renderUI(),
            dcl("Settings reset"))
          : (t.classList.add("active"),
            (a.innerText = a.dataset.active),
            s.classList.add("running", "warning"),
            (s.querySelector(".shifter").style.animationDuration =
              INTERVAL_UI_LOADING + "ms"),
            setTimeout(() => {
              t.classList.remove("active"),
                (a.innerText = a.dataset.default),
                s.classList.remove("running");
            }, INTERVAL_UI_LOADING));
    }
  ),
  addMultipleDelegatedEventListeners(
    "#pseudomodal .options-export-csv",
    "click",
    (e, t) => {
      e.preventDefault();
      let a = convertArrayToCsv(
        backgroundJS.domains,
        backgroundJS.dates.start,
        backgroundJS.dates.today
      );
      initiateDownload(
        [a],
        "octet/stream",
        "webtime-tracker-" + backgroundJS.dates.today + ".csv"
      );
    }
  ),
  addMultipleDelegatedEventListeners(
    "#pseudomodal .options-backup",
    "click",
    (e, t) => {
      let a,
        s,
        n = {
          domains: backgroundJS.domains,
          dates: { start: backgroundJS.dates.start },
          seconds: { alltime: backgroundJS.seconds.alltime },
          settings: backgroundJS.settings,
        },
        r = JSON.stringify(n);
      e.preventDefault(),
        sha256(r).then((e) => {
          (a = { content: n, hash: { sha256: e } }),
            (s = JSON.stringify(a)),
            initiateDownload(
              [s],
              "octet/stream",
              "webtime-tracker-backup-" + backgroundJS.dates.today + ".json"
            );
        });
    }
  ),
  addMultipleDelegatedEventListeners(
    "#pseudomodal .options-restore",
    "click",
    (e, t) => {
      let a = t.querySelector('input[type="file"]');
      (a.value = null), a.click();
    }
  ),
  addMultipleDelegatedEventListeners("#screenshot", "click", (e, t) => {
    if (!SCREENSHOT_MODE) {
      let e = window.location.href + SCREENSHOT_MODE_QUERY,
        t = window.innerWidth;
      t -=
        window.innerHeight <= document.body.scrollHeight ? SCROLLBAR_WIDTH : 0;
      let a = window.innerHeight,
        s = Math.round(screen.availWidth / 2 - t / 2);
      dcl(screen.availWidth);
      let n = 40;
      window.open(
        e,
        "_blank",
        "width=" +
          t +
          ",height=" +
          a +
          ",left=" +
          s +
          ",top=" +
          n +
          ",resizable=yes,location=no,menubar=no,scrollbars=no,status=no,titlebar=no,toolbar=no"
      );
    }
  }),
  addMultipleDelegatedEventListeners(
    '#pseudomodal .options-restore input[type="file"]',
    "change",
    (e, t) => {
      let a,
        s = e.target.files[0],
        n = new FileReader();
      (n.onload = (e) => {
        (a = e.target.result), restoreFromJson(a);
      }),
        n.readAsText(s);
    }
  ),
  addMultipleDelegatedEventListeners(
    ".screenshot-info .ok",
    "click",
    (e, t) => {
      (document.querySelector(".screenshot-overlay").style.display = "none"),
        (document.querySelector(".screenshot-info").style.display = "none");
    }
  ),
  addMultipleDelegatedEventListeners(
    ".screenshot-info .permission-grant",
    "click",
    (e, t) => {
      chrome.permissions.request({ origins: ["<all_urls>"] }, (e) => {
        chrome.runtime.lastError &&
          chrome.runtime.lastError.message &&
          dcl(
            "Screenshot - permission.request: " +
              chrome.runtime.lastError.message
          ),
          screenshotUIShow();
      });
    }
  ),
  addMultipleDelegatedEventListeners(
    ".screenshot-capture .capture",
    "click",
    (e, t) => {
      e.preventDefault(),
        console.log("Screenshot - start"),
        (document.querySelector(".screenshot-capture").style.display = "none"),
        setTimeout(() => {
          chrome.tabs.captureVisibleTab(null, { format: "png" }, (e) => {
            if (chrome.runtime.lastError && chrome.runtime.lastError.message)
              dcl("Screenshot - error: " + chrome.runtime.lastError.message);
            else {
              let t = e.split(",")[0].split(":")[1].split(";")[0],
                a = window.atob(e.split(",")[1]),
                s = new Uint8Array(a.length);
              for (let e = 0; e < a.length; e++) s[e] = a.charCodeAt(e);
              let n = new Date()
                .toISOString()
                .replace(/[T:]/g, "-")
                .split(".")[0];
              initiateDownload(
                [s],
                t,
                "webtime-tracker-screenshot-" + n + ".png"
              ),
                screenshotUICaptureShow();
            }
          });
        }, SCREENSHOT_WAIT);
    }
  );
const restoreFromJson = (e) => {
    let t = document.querySelector("#pseudomodal .options-restore"),
      a = t.querySelector(".text"),
      s = t.querySelector(".loading");
    const n = () => {
      (a.innerText = a.dataset.warning),
        s.classList.add("blinking", "warning"),
        (s.querySelector(".shifter").style.animationDuration =
          UI_LOADING_BLINKING_INTERVAL + "ms"),
        (s.querySelector(".shifter").style.animationIterationCount =
          UI_LOADING_BLINKING_COUNT),
        setTimeout(() => {
          (a.innerText = a.dataset.default), s.classList.remove("blinking");
        }, UI_LOADING_BLINKING_INTERVAL * UI_LOADING_BLINKING_COUNT);
    };
    let r, o;
    try {
      (o = JSON.parse(e)), (r = JSON.stringify(o.content));
    } catch (e) {
      n();
    }
    sha256(r).then((e) => {
      o.hash.sha256 === e || SKIP_RESTORE_HASH_CHECK
        ? (o.hash.sha256 !== e && dcl("Restore - hashes mismatch!"),
          (backgroundJS.domains = o.content.domains),
          (backgroundJS.dates.start = o.content.dates.start),
          (backgroundJS.seconds.today = getTotalSecondsForDate(
            o.content.domains,
            getDateString()
          )),
          (backgroundJS.seconds.alltime = o.content.seconds.alltime),
          (backgroundJS.settings = o.content.settings),
          backgroundJS.saveDomains(),
          backgroundJS.saveDateStart(),
          backgroundJS.saveSecondsAlltime(),
          backgroundJS.saveIdleTime(),
          backgroundJS.saveGraphGap(),
          renderUI(),
          (a.innerText = a.dataset.restored),
          s.classList.add("blinking", "success"),
          (s.querySelector(".shifter").style.animationDuration =
            UI_LOADING_BLINKING_INTERVAL + "ms"),
          (s.querySelector(".shifter").style.animationIterationCount =
            UI_LOADING_BLINKING_COUNT),
          setTimeout(() => {
            (a.innerText = a.dataset.default), s.classList.remove("blinking");
          }, UI_LOADING_BLINKING_INTERVAL * UI_LOADING_BLINKING_COUNT),
          dcl("Restore - done!"))
        : (n(), dcl("Restore - data corrupted"));
    });
  },
  renderDomainStats = (e) => {
    let t;
    if ("1" !== e.contextEl.dataset.statsReady) {
      dcl(`Rendering stats for: ${e.url}`);
      let a = getDomainData(e.url);
      (a = Object.assign(a, e)),
        (a.color = e.contextEl.querySelector(".label span").style.color);
      let s = htmlTemplates.querySelector("#stats-domain");
      tplElementStatsDomain(a, s.content);
      let n = document.importNode(s.content, !0);
      elementInsertAfterElement(e.contextEl, n),
        (t = document.querySelector(
          "#table-" + e.range + ' tr.stats[data-url="' + e.url + '"]'
        ));
      let r = htmlTemplates.querySelector("#stats-charts");
      tplElementStatsCharts(a, r.content);
      let o = document.importNode(r.content, !0);
      elementAppendToElement(t.querySelector(".content"), o);
      let l = getAvailableElementWidth(t.querySelector(".content")),
        d = tplElementChartStatsDays({
          chartWidth: l,
          chartHeight: CHART_STATS_HEIGHT_DAYS,
          stepHeightMin: CHART_STATS_STEP_HEIGHT_MIN,
          timeValueMax: a.timeValues.max,
          daysTotal: a.days.total,
          days: a.dates.days,
        });
      elementInsertIntoElement(t.querySelector(".chart-days .chart"), d);
      let i = tplElementChartStatsDaynames({
        chartWidth: l,
        chartHeight: CHART_STATS_HEIGHT_DAYNAMES,
        stepHeightMin: CHART_STATS_STEP_HEIGHT_MIN,
        daynames: a.dates.daynames,
      });
      elementInsertIntoElement(t.querySelector(".chart-daynames .chart"), i),
        (e.contextEl.dataset.statsReady = "1");
    }
    "1" === e.contextEl.dataset.statsVisible
      ? ((document.querySelector(
          "#table-" + e.range + ' tr.stats[data-url="' + e.url + '"]'
        ).style.display = "none"),
        (e.contextEl.dataset.statsVisible = "0"))
      : ((document.querySelector(
          "#table-" + e.range + ' tr.stats[data-url="' + e.url + '"]'
        ).style.display = "table-row"),
        (e.contextEl.dataset.statsVisible = "1"));
  },
  getDomainData = (e) => {
    let t,
      a,
      s,
      n,
      r,
      o,
      l,
      d = Number.MAX_SAFE_INTEGER,
      i = Number.MIN_SAFE_INTEGER,
      c = backgroundJS.dates.start,
      u = backgroundJS.dates.start,
      m = backgroundJS.dates.today,
      g = backgroundJS.dates.start,
      p = [],
      S = 0,
      y = backgroundJS.domains[e],
      h =
        getDateDiffDays(backgroundJS.dates.today, backgroundJS.dates.start) + 1;
    for (
      o = getDatesSparse(backgroundJS.dates.start, h - 1),
        l = [0, 0, 0, 0, 0, 0, 0],
        t = 0;
      t < o.length;
      t++
    )
      (n = o[t]),
        (r = 0),
        y.days.hasOwnProperty(o[t]) &&
          (S++,
          (r = y.days[n].seconds),
          (c = r < d ? n : c),
          (u = r > i ? n : u),
          (d = r < d ? r : d),
          (i = r > i ? r : i),
          (m = n < m ? n : m),
          (g = n > g ? n : g)),
        (s = (new Date(n).getDay() + 6) % 7),
        (l[s] += r),
        p.push({ date: n, seconds: r });
    return (
      (a = {
        days: { total: h, domain: S },
        timeValues: { min: d, max: i },
        visits: { first: m, last: g },
        ranks: {
          [RANGE_DAY]: {
            position: ranks[RANGE_DAY].domains[e] || "-",
            total: ranks[RANGE_DAY].total,
          },
          [RANGE_ALLTIME]: {
            position: ranks[RANGE_ALLTIME].domains[e],
            total: ranks[RANGE_ALLTIME].total,
          },
        },
        times: {
          [RANGE_DAY]:
            (y.days[backgroundJS.dates.today] &&
              y.days[backgroundJS.dates.today].seconds) ||
            0,
          [RANGE_AVERAGE]: parseInt(y.alltime.seconds / h),
          [RANGE_AVERAGE + "-pure"]: parseInt(y.alltime.seconds / S),
          [RANGE_ALLTIME]: y.alltime.seconds,
        },
        dates: {
          start: backgroundJS.dates.start,
          today: backgroundJS.dates.today,
          timeMin: c,
          timeMax: u,
          days: p,
          daynames: l,
        },
      }),
      a
    );
  },
  getOverallData = () => {
    let e,
      t,
      a,
      s,
      n,
      r,
      o,
      l,
      d,
      i,
      c = Number.MAX_SAFE_INTEGER,
      u = Number.MIN_SAFE_INTEGER,
      m = backgroundJS.dates.start,
      g = backgroundJS.dates.start,
      p = backgroundJS.dates.today,
      S = backgroundJS.dates.start,
      y = [],
      h = 0,
      E =
        getDateDiffDays(backgroundJS.dates.today, backgroundJS.dates.start) + 1;
    for (o in ((d = getDatesSparse(backgroundJS.dates.start, E - 1)),
    (i = [0, 0, 0, 0, 0, 0, 0]),
    (n = {}),
    backgroundJS.domains))
      if (backgroundJS.domains.hasOwnProperty(o))
        for (s in ((l = backgroundJS.domains[o].days), l))
          l.hasOwnProperty(s) &&
            ((n[s] = n[s] || { seconds: 0 }), (n[s].seconds += l[s].seconds));
    for (e = 0; e < d.length; e++)
      (s = d[e]),
        (r = 0),
        n.hasOwnProperty(d[e]) &&
          ((r = n[s].seconds),
          (m = r < c ? s : m),
          (g = r > u ? s : g),
          (c = r < c ? r : c),
          (u = r > u ? r : u),
          (p = s < p ? s : p),
          (S = s > S ? s : S)),
        (a = (new Date(s).getDay() + 6) % 7),
        (i[a] += r),
        r > 0 && h++,
        y.push({ date: s, seconds: r });
    return (
      (t = {
        days: { total: E, visited: h },
        timeValues: {
          min: c === Number.MAX_SAFE_INTEGER ? 0 : c,
          max: u === Number.MIN_SAFE_INTEGER ? 0 : u,
        },
        visits: { first: p, last: S },
        times: {
          [RANGE_DAY]: backgroundJS.seconds.today,
          [RANGE_AVERAGE]: parseInt(backgroundJS.seconds.alltime / E),
          [RANGE_AVERAGE + "-pure"]:
            h > 0 ? parseInt(backgroundJS.seconds.alltime / h) : 0,
          [RANGE_ALLTIME]: backgroundJS.seconds.alltime,
        },
        dates: {
          start: backgroundJS.dates.start,
          today: backgroundJS.dates.today,
          timeMin: m,
          timeMax: g,
          days: y,
          daynames: i,
        },
      }),
      t
    );
  };

const login = document.querySelector("#login");

login.addEventListener("click", () => {
  const uuid = document.querySelector("#pass-key").value;
  chrome.storage.local.set({ uuid: uuid });
  document.querySelector(".login-div").style.display = "none";
  document.querySelector(".container").style.display = "block";
  alert("Login Successful");
});

const authenticate = () => {
  chrome.storage.local.get(["uuid"], (result) => {
    if (result.uuid) {
      console.log("Login Successful");
      document.querySelector(".login-div").style.display = "none";
      document.querySelector(".container").style.display = "block";
    } else {
      console.log("Login Required");
      document.querySelector(".login-div").style.display = "block";
      document.querySelector(".container").style.display = "none";
    }
  });
};

const logout = document.querySelector("#logout");

logout.addEventListener("click", () => {
  chrome.storage.local.remove("uuid");
  document.querySelector(".login-div").style.display = "block";
  document.querySelector(".container").style.display = "none";
  alert("Logout Successful");
});

authenticate();
