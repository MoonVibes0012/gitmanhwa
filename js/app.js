// Data series — edit di sini untuk menambah manhwa baru
// Struktur chapter di GitHub: series/<slug>/chapter-1/01.jpg , 02.jpg ...
const SERIES = [
  {
    id: "hell-login",
    title: "Hell Login",
    cover: "series/hell-login/cover.png",
    flag: "🇰🇷",
    type: "manhwa",
    status: "Ongoing",
    chapters: [
      { num: 9, folder: "chapter-9", time: "15 mnt lalu" },
      { num: 8, folder: "chapter-8", time: "7 hari lalu" },
      { num: 7, folder: "chapter-7", time: "14 hari lalu" }
    ]
  },
  {
    id: "kisah-kultivator",
    title: "Kisah Kultivator Pembantai Demon",
    cover: "series/kisah-kultivator/cover.png",
    flag: "🇰🇷",
    type: "manhwa",
    status: "Ongoing",
    chapters: [
      { num: 1, folder: "chapter-1", time: "1 hari lalu" }
    ]
  },
  {
    id: "pemuda-abadi",
    title: "Pemuda Abadi",
    cover: "series/pemuda-abadi/cover.png",
    flag: "🇰🇷",
    type: "manhwa",
    status: "Ongoing",
    chapters: [
      { num: 1, folder: "chapter-1", time: "2 hari lalu" }
    ]
  }
];

// Render rekomendasi grid
function renderSeriesGrid(filter = "manhwa") {
  const grid = document.getElementById("series-grid");
  if (!grid) return;
  const filtered = SERIES.filter(s => s.type === filter);
  grid.innerHTML = filtered.map(s => `
    <a href="series.html?id=${s.id}" class="series-card">
      <div class="series-cover">
        \( {s.cover ? `<img src=" \){s.cover}" alt="${s.title}" style="width:100%;height:100%;object-fit:cover">` : s.title}
        <span class="flag">${s.flag}</span>
      </div>
      <div class="series-meta">
        <div class="series-title">${s.title}</div>
        <div class="series-info">
          <span>⏱ ${s.chapters[0]?.time || "-"}</span>
        </div>
      </div>
    </a>
  `).join("");
}

// Render update list
function renderUpdates() {
  const list = document.getElementById("update-list");
  if (!list) return;
  list.innerHTML = SERIES.filter(s => s.chapters.length).map(s => `
    <div class="update-item">
      <div class="update-cover">
        \( {s.cover ? `<img src=" \){s.cover}" style="width:100%;height:100%;object-fit:cover;border-radius:6px">` : s.title.slice(0,8)}
      </div>
      <div class="update-info">
        <div class="update-title">
          <span class="up">UP</span> ${s.title}
        </div>
        <div class="chapter-list">
          ${s.chapters.slice(0,3).map(c => `
            <a href="reader.html?series=\( {s.id}&chapter= \){c.folder}" class="chapter-row">
              <span class="chapter-name">Chapter ${c.num}</span>
              <span class="chapter-time">${c.time}</span>
            </a>
          `).join("")}
        </div>
      </div>
    </div>
  `).join("");
}

// Tabs
document.querySelectorAll(".tab[data-tab]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab[data-tab]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderSeriesGrid(btn.dataset.tab);
  });
});

// Init
renderSeriesGrid("manhwa");
renderUpdates();
