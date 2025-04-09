  // Если глобальный объект settings ещё не создан, создаём его
window.settings = window.settings || {
  types: ["album", "single", "compilation"],
  filters: []
};

document.addEventListener("DOMContentLoaded", () => {
  // Объявляем элементы, доступные после загрузки DOM
  const startButton = document.getElementById("start-button");
  const welcomeScreen = document.getElementById("welcome-screen");
  const appInterface = document.getElementById("app-interface");
  const searchBtnTop = document.getElementById("search-button-top");
  const artistInputTop = document.getElementById("artist-input-top");
    const menuBar = document.getElementById("menu-bar");         // ДОБАВЛЕНО
  const footer = document.querySelector("footer");
  // (Если нужен "search-button", добавьте его обработчик только если такой элемент есть)
  // const searchBtn = document.getElementById("search-button");

  // Обработчики для чекбоксов "To Filter Out"
const filterCheckboxes = document.querySelectorAll(".filter-key");
const selectAll = document.getElementById("select-all-filters");

// При изменении любого чекбокса в группе "To Filter Out"
filterCheckboxes.forEach(cb => {
  cb.addEventListener("change", function() {
    updateFilterSettings();
    applySettings();
    // Если все чекбоксы "filter-key" отмечены, то selectAll становится активным, иначе - снимается
    const allChecked = Array.from(filterCheckboxes).every(chk => chk.checked);
    if (selectAll) {
      selectAll.checked = allChecked;
    }
  });
});

// Обработчик для чекбокса "Select All"
if (selectAll) {
  selectAll.addEventListener("change", function() {
    // При изменении selectAll задаём всем чекбоксам состояние, соответствующее selectAll
    filterCheckboxes.forEach(cb => {
      cb.checked = this.checked;
    });
    updateFilterSettings();
    applySettings();
  });
}

// Обработчики для чекбоксов "To Look For"
const lookForCheckboxes = document.querySelectorAll(".look-for");
lookForCheckboxes.forEach(cb => {
  cb.addEventListener("change", function() {
    updateLookForSettings();
    applySettings(); // применяем фильтр сразу
  });
});

  // Слушатель для кнопки Start
  startButton.addEventListener("click", () => {
  console.log("Кнопка Start нажата");
  welcomeScreen.classList.add("fade-out");
  setTimeout(() => {
    // Скрываем экран приветствия
    welcomeScreen.style.display = "none";

    // Показываем основной интерфейс
    appInterface.classList.remove("invisible");
    appInterface.classList.add("visible");

    // Показываем панель меню
    menuBar.classList.remove("invisible");
    menuBar.classList.add("visible");

    // Отображаем футер (если нужен)
    footer.style.display = "block";
    // Возвращаем прокрутку после исчезновения приветственного экрана
    document.body.style.overflow = "auto";
  }, 1200);
});


  // Слушатели для поиска (уже есть элемент search-button-top)
  searchBtnTop.addEventListener("click", () => {
    searchArtist();
  });
  artistInputTop.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      searchArtist();
    }
  });

  // Слушатель для меню
  document.addEventListener("click", (e) => {
    const toggleBtn = document.getElementById("menu-toggle");
    const menu = document.getElementById("navLinks");
    if (!toggleBtn || !menu) return;
    if (toggleBtn.contains(e.target)) {
      menu.classList.toggle("active");
    } else if (!menu.contains(e.target)) {
      menu.classList.remove("active");
    }
  });
});

// Скрытие выпадающего списка, если клик вне области поиска
document.addEventListener("click", (e) => {
  const searchWrapper = document.querySelector(".search-wrapper");
  const dropdown = document.getElementById("dropdown-results");
  // Если клик не в области поиска, скрываем список
  if (searchWrapper && !searchWrapper.contains(e.target)) {
    dropdown.classList.add("hidden");
  }
});

// Функции для обновления настроек
function updateFilterSettings() {
  const filterCheckboxes = document.querySelectorAll(".filter-key");
  const selectedFilters = [];
  filterCheckboxes.forEach(cb => {
    if (cb.checked) {
      selectedFilters.push(cb.value);
    }
  });
  window.settings.filters = selectedFilters;
  console.log("Filters updated:", window.settings.filters);
}

function updateLookForSettings() {
  const lookForCheckboxes = document.querySelectorAll(".look-for");
  const selectedTypes = [];
  lookForCheckboxes.forEach(cb => {
    if (cb.checked) {
      selectedTypes.push(cb.value);
    }
  });
  window.settings.types = selectedTypes;
  console.log("Types updated:", window.settings.types);
}


let selectedArtistId = null;
let selectedArtistName = "";
let artistImages = {};
let discographyData = null;
let selectedAlbum = null;

async function searchArtist() {
  const input = document.getElementById("artist-input-top").value.trim();
  const dropdown = document.getElementById("dropdown-results");
  const imgContainer = document.getElementById("artist-image-container");

  imgContainer.innerHTML = '<div class="panel-title">Artist\'s Image</div>';

  if (!input) {
    dropdown.classList.add("hidden");
    return;
  }

  const res = await fetch("/search_artist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ artist: input })
  });

  const data = await res.json();
  dropdown.innerHTML = "";
  artistImages = {};

  data.results.forEach((artist) => {
  artistImages[artist.id] = artist.image || null;

  const li = document.createElement("li");
  li.textContent = artist.name; // ID удалён из отображаемого текста
  li.dataset.id = artist.id;

  li.addEventListener("click", () => {
    selectedArtistId = artist.id;
    selectedArtistName = artist.name;
    updateArtistImage(artist.id);
    dropdown.classList.add("hidden");
    // Сбрасываем настройки к значениям по умолчанию при выборе нового исполнителя
    resetSettingsToDefault();
    loadDiscography(artist.id);
  });

  dropdown.appendChild(li);
});


  dropdown.classList.remove("hidden");
}


function updateArtistImage(artistId) {
  const imgContainer = document.getElementById("artist-image-container");
  imgContainer.innerHTML = '<div class="panel-title">Artist\'s Image</div>';

  const imageUrl = artistImages[artistId];
  if (imageUrl) {
    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = "Artist";
    img.classList.add("artist-image");
    imgContainer.appendChild(img);
  }
}

async function loadDiscography(artist_id) {
  showLoading(true);

  const res = await fetch("/get_discography", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ artist_id })
  });

  const data = await res.json();
  showLoading(false);

  // Сохраняем данные дискографии (ожидается, что JSON содержит поля artist и albums)
  discographyData = data;
  // Сбрасываем выбранный альбом
  selectedAlbum = null;

  const albumList = document.getElementById("album-list");
  albumList.innerHTML = "";

  data.albums.forEach(album => {
    // Для показа краткой информации в списке используем, например, имя и год выпуска
    const li = document.createElement("li");
    li.textContent = `${album.name} (${album.release_year}) [pop: ${album.popularity}]`;
    li.addEventListener("click", () => {
      drawTrackChart(album);
      selectedAlbum = album;
    });
    albumList.appendChild(li);
  });

  drawAlbumChart(data.albums);
}

function drawAlbumChart(albums) {
  // Сортируем по убыванию популярности (наибольшая популярность первой)
  const sorted = albums.slice().sort((a, b) => b.popularity - a.popularity);
  // Формируем массив названий альбомов; при горизонтальном графике,
  // чтобы самый популярный был сверху, оставляем сортировку,
  // но далее задаем yaxis.autorange: "reversed"
  const names = sorted.map(a => `${a.name} (${a.release_year})`);
  const pops = sorted.map(a => a.popularity);

  // Тема графика для тёмного оформления, с чуть более светлым фоном:
  const darkTheme = {
    // Измените здесь для светлого фона графика
    paper_bgcolor: "#222222", // Фон всей области графика
    plot_bgcolor: "#222222",  // Фон области рисования графика
    font: { color: "#FFFFFF" },
    xaxis: {
      gridcolor: "#333333", // Цвет линий сетки по оси x
      tickfont: { color: "#FFFFFF", size: 12 },
      title: { text: "Popularity", font: { color: "#FFFFFF", size: 12 } }
    },
    yaxis: {
      gridcolor: "#333333", // Цвет линий сетки по оси y
      tickfont: { color: "#FFFFFF", size: 12 },
      autorange: "reversed" // Обеспечивает, что самый популярный элемент окажется сверху
    },
    margin: { t: 50, l: 300 }
  };

  Plotly.newPlot("album-chart", [{
    type: "bar",
    x: pops,
    y: names,
    orientation: "h",
    marker: { color: "#1DB954" }
  }], Object.assign({
    title: selectedArtistName ? `Album Popularity — ${selectedArtistName}` : "Album Popularity"
  }, darkTheme), { responsive: true });
}



function drawTrackChart(album) {
  // Сортируем треки по убыванию популярности
  const tracks = album.tracks.slice().sort((a, b) => b.popularity - a.popularity);
  const names = tracks.map(t => t.name);
  const pops = tracks.map(t => t.popularity);

  // Тема графика, аналогичная предыдущей, для тёмного оформления:
  const darkTheme = {
    // Измените здесь фон (фон графика чуть светлее)
    paper_bgcolor: "#222222", // Фон всей области графика
    plot_bgcolor: "#222222",  // Фон области рисования графика
    font: { color: "#FFFFFF" },
    xaxis: {
      gridcolor: "#333333",
      tickfont: { color: "#FFFFFF", size: 12 },
      title: { text: "Popularity", font: { color: "#FFFFFF", size: 12 } }
    },
    yaxis: {
      gridcolor: "#333333",
      tickfont: { color: "#FFFFFF", size: 12 },
      autorange: "reversed" // Обеспечивает, что самый популярный трек окажется сверху
    },
    margin: { t: 50, l: 300 }
  };

  Plotly.newPlot("track-chart", [{
    type: "bar",
    x: pops,
    y: names,
    orientation: "h",
    marker: { color: "orange" }
  }], Object.assign({
    title: `Tracks in ${album.name}`
  }, darkTheme), { responsive: true });
}


function showLoading(show) {
  const spinner = document.getElementById("loader");
  spinner.style.display = show ? "block" : "none";
}

function exportData() {
  alert("Export functionality coming soon!");
}

/* Функция для форматирования данных Raw Data */
function formatRawData() {
  let text = "";

  // Если данные о дискографии не загружены
  if (!discographyData) {
    text += "Albums: No album data available.\n";
    text += "Tracks: No track data available.";
    return text;
  }

  // Форматирование информации об артисте, если есть
  if (discographyData.artist) {
    text += "Artist Info:\n";
    text += `  Name: ${discographyData.artist.name}\n`;
    text += `  Genres: ${discographyData.artist.genres.join(', ')}\n`;
    text += `  Followers: ${discographyData.artist.followers}\n`;
    text += `  Spotify URL: ${discographyData.artist.spotify_url}\n\n`;
  }

  // Форматирование информации об альбомах
  if (discographyData.albums && discographyData.albums.length > 0) {
    text += "Albums:\n";
    discographyData.albums.forEach(album => {
      // Используем первые 4 символа release_date как год (если формат "YYYY-MM-DD")
      let releaseYear = album.release_date ? album.release_date.substring(0, 4) : "";
      text += `  • ${album.name} (${releaseYear})\n`;
      text += `     ID: ${album.id}\n`;
      text += `     Popularity: ${album.popularity}\n`;
      text += `     Release date: ${album.release_date}\n`;
      text += `     Spotify URL: ${album.spotify_url}\n\n`;
    });
  } else {
    text += "Albums: No album data available.\n\n";
  }

  // Форматирование информации о треках: выводим только для выбранного альбома
  if (selectedAlbum && selectedAlbum.tracks && selectedAlbum.tracks.length > 0) {
    text += "Tracks:\n\n";
    selectedAlbum.tracks.forEach(track => {
      text += `  • ${track.name}\n`;
      text += `     ID: ${track.id}\n`;
      text += `     Popularity: ${track.popularity}\n\n`;
    });
  } else {
    text += "Tracks: No track data available.";
  }

  return text;
}

/* Обновляем функцию showRawData, чтобы выводить отформатированный текст */
function showRawData() {
  const rawDataScreen = document.getElementById("raw-data-screen");
  const settingsScreen = document.getElementById("settings-screen");
  const appInterface = document.getElementById("app-interface");

  // Скрываем экран настроек, если он виден
  if (settingsScreen.style.display !== "none") {
    settingsScreen.classList.remove("visible");
    settingsScreen.classList.add("invisible");
    setTimeout(() => {
      settingsScreen.style.display = "none";
    }, 1200);
  }

  appInterface.classList.remove("visible");
  appInterface.classList.add("invisible");

  setTimeout(() => {
    appInterface.style.display = "none";
    rawDataScreen.style.display = "flex";
    void rawDataScreen.offsetWidth;
    rawDataScreen.classList.remove("invisible");
    rawDataScreen.classList.add("visible");

    // Заполнение Raw Data текстом
    const rawText = document.getElementById("raw-data-text");
    rawText.textContent = formatRawData();
  }, 1200);
}

function goBack() {
  const rawDataScreen = document.getElementById("raw-data-screen");
  const appInterface = document.getElementById("app-interface");

  // Плавное затухание экрана Raw Data
  rawDataScreen.classList.remove("visible");
  rawDataScreen.classList.add("invisible");

  setTimeout(() => {
    // Скрываем Raw Data
    rawDataScreen.style.display = "none";

    // Возвращаем основной интерфейс
    appInterface.style.display = "flex";
    void appInterface.offsetWidth;
    appInterface.classList.remove("invisible");
    appInterface.classList.add("visible");
  }, 1200);
}

function showSettings() {
  const settingsScreen = document.getElementById("settings-screen");
  const rawDataScreen = document.getElementById("raw-data-screen");
  const appInterface = document.getElementById("app-interface");

  // Скрываем экран Raw Data, если он виден
  if (rawDataScreen.style.display !== "none") {
    rawDataScreen.classList.remove("visible");
    rawDataScreen.classList.add("invisible");
    setTimeout(() => {
      rawDataScreen.style.display = "none";
    }, 1200);
  }

  appInterface.classList.remove("visible");
  appInterface.classList.add("invisible");

  setTimeout(() => {
    appInterface.style.display = "none";
    settingsScreen.style.display = "flex";
    void settingsScreen.offsetWidth;
    settingsScreen.classList.remove("invisible");
    settingsScreen.classList.add("visible");
  }, 1200);
}


function closeSettings() {
  const settingsScreen = document.getElementById("settings-screen");
  const appInterface = document.getElementById("app-interface");

  // Плавное затухание экрана настроек
  settingsScreen.classList.remove("visible");
  settingsScreen.classList.add("invisible");

  setTimeout(() => {
    settingsScreen.style.display = "none";
    appInterface.style.display = "flex";
    void appInterface.offsetWidth;
    appInterface.classList.remove("invisible");
    appInterface.classList.add("visible");
  }, 1200);
}

function applySettings() {
  if (!discographyData) return;

  // Фильтруем альбомы по типу (предполагается, что album.album_type существует; если нет – удалите эту проверку)
  let filteredAlbums = discographyData.albums.filter(album => {
    if (album.album_type) {
      return window.settings.types.includes(album.album_type.toLowerCase());
    }
    return true;
  });

  // Убираем альбомы, название которых содержит выбранные ключевые слова для фильтрации
  if (window.settings.filters && window.settings.filters.length > 0) {
    filteredAlbums = filteredAlbums.filter(album => {
      const albumNameLower = album.name.toLowerCase();
      return !window.settings.filters.some(filterWord => albumNameLower.includes(filterWord.toLowerCase()));
    });
  }

  // Обновляем HTML‑список альбомов
  const albumList = document.getElementById("album-list");
  albumList.innerHTML = "";
  filteredAlbums.forEach(album => {
    const li = document.createElement("li");
    li.textContent = `${album.name} (${album.release_year}) [pop: ${album.popularity}]`;
    li.addEventListener("click", () => {
      // Перед отрисовкой треков, фильтруем их по ключевым словам (если они есть)
      let albumForDisplay = Object.assign({}, album);
      if (albumForDisplay.tracks && window.settings.filters && window.settings.filters.length > 0) {
        albumForDisplay.tracks = albumForDisplay.tracks.filter(track => {
          return !window.settings.filters.some(filterWord => track.name.toLowerCase().includes(filterWord.toLowerCase()));
        });
      }
      drawTrackChart(albumForDisplay);
      selectedAlbum = albumForDisplay;
    });
    albumList.appendChild(li);
  });

  // Обновляем график альбомов – функция использует отфильтрованный список
  drawAlbumChart(filteredAlbums);
}

function closeSettings() {
  const settingsScreen = document.getElementById("settings-screen");
  const appInterface = document.getElementById("app-interface");

  // Плавное затухание экрана настроек
  settingsScreen.classList.remove("visible");
  settingsScreen.classList.add("invisible");

  setTimeout(() => {
    settingsScreen.style.display = "none";
    appInterface.style.display = "flex";
    void appInterface.offsetWidth;
    appInterface.classList.remove("invisible");
    appInterface.classList.add("visible");

    // Применяем настройки: обновляем отображение дискографии и график
    applySettings();
  }, 1200);
}
function goToMain() {
  const raw = document.getElementById("raw-data-screen");
  const settings = document.getElementById("settings-screen");
  const app = document.getElementById("app-interface");

  // Если какой-либо из экранов открыт, плавно скрываем его
  [raw, settings].forEach(screen => {
    if (screen.style.display !== "none") {
      screen.classList.remove("visible");
      screen.classList.add("invisible");
      setTimeout(() => {
        screen.style.display = "none";
      }, 1200);
    }
  });

  // После завершения анимации показываем главный интерфейс
  setTimeout(() => {
    app.style.display = "flex";
    void app.offsetWidth;
    app.classList.remove("invisible");
    app.classList.add("visible");
  }, 1200);
}
// Функция сброса настроек к значениям по умолчанию
function resetSettingsToDefault() {
  // Сброс объекта настроек
  window.settings.types = ["album", "single", "compilation"];
  window.settings.filters = [];

  // Сброс чекбоксов "To Look For" (по умолчанию все включены)
  const lookForCheckboxes = document.querySelectorAll(".look-for");
  lookForCheckboxes.forEach(cb => {
    cb.checked = true;
  });

  // Сброс чекбоксов "To Filter Out" (по умолчанию ни один не выбран)
  const filterCheckboxes = document.querySelectorAll(".filter-key");
  filterCheckboxes.forEach(cb => {
    cb.checked = false;
  });

  // Сбрасываем чекбокс "Select All"
  const selectAll = document.getElementById("select-all-filters");
  if (selectAll) {
    selectAll.checked = false;
  }
}
