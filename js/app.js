const SERIES = [
  {
    id: "taylor",
    title: "taylor",
    cover: "series/taylor/cover.png",
    flag: "🇰🇷",
    type: "manhwa",
    status: "Ongoing",
    chapters: [
      { num: 9, folder: "chapter-9", time: "15 mnt lalu" },
      { num: 8, folder: "chapter-8", time: "7 hari lalu" },
      { num: 7, folder: "chapter-7", time: "14 hari lalu" },
      { num: 6, folder: "chapter-6", time: "1 bulan lalu" },
      { num: 5, folder: "chapter-5", time: "1 bulan lalu" },
      { num: 4, folder: "chapter-4", time: "1 bulan lalu" },
      { num: 3, folder: "chapter-3", time: "1 bulan lalu" },
      { num: 2, folder: "chapter-2", time: "1 bulan lalu" },
      { num: 1, folder: "chapter-1", time: "1 bulan lalu" },
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

function renderSeriesGrid(filter = "manhwa") {
  const grid = document.getElementById("series-grid");
  if (!grid) return;

  const filtered = SERIES.filter(s => s.type === filter);

  grid.innerHTML = filtered.map(s => {
    return '<a href="series.html?id=' + s.id + '" class="series-card">' +
      '<div class="series-cover">' +
        '<img src="' + s.cover + '" alt="' + s.title + '" style="width:100%;height:100%;object-fit:cover">' +
        '<span class="flag">' + s.flag + '</span>' +
      '</div>' +
      '<div class="series-meta">' +
        '<div class="series-title">' + s.title + '</div>' +
        '<div class="series-info"><span>⏱ ' + (s.chapters[0] ? s.chapters[0].time : '-') + '</span></div>' +
      '</div>' +
    '</a>';
  }).join('');
}

function renderUpdates() {
  const list = document.getElementById("update-list");
  if (!list) return;

  list.innerHTML = SERIES.filter(s => s.chapters.length).map(s => {
    let chaptersHtml = s.chapters.slice(0, 3).map(c => {
      return '<a href="reader.html?series=' + s.id + '&chapter=' + c.folder + '" class="chapter-row">' +
        '<span class="chapter-name">Chapter ' + c.num + '</span>' +
        '<span class="chapter-time">' + c.time + '</span>' +
      '</a>';
    }).join('');
    

    return '<div class="update-item">' +
      '<div class="update-cover">' +
        '<img src="' + s.cover + '" style="width:100%;height:100%;object-fit:cover;border-radius:6px">' +
      '</div>' +
      '<div class="update-info">' +
        '<div class="update-title"><span class="up">UP</span> ' + s.title + '</div>' +
        '<div class="chapter-list">' + chaptersHtml + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

document.querySelectorAll(".tab[data-tab]").forEach(function(btn) {
  btn.addEventListener("click", function() {
    document.querySelectorAll(".tab[data-tab]").forEach(function(b) {
      b.classList.remove("active");
    });
    btn.classList.add("active");
    renderSeriesGrid(btn.dataset.tab);
  });
});

renderSeriesGrid("manhwa");
renderUpdates();
