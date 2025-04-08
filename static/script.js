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
  const searchBtn = document.getElementById("search-button");
  const artistInput = document.getElementById("artist-input");
  const selectAll = document.getElementById("select-all-filters");
  const filterCheckboxes = document.querySelectorAll(".filter-key");

  // Если элемент "Select All" существует, вешаем слушатель
  if (selectAll) {
    selectAll.addEventListener("change", function() {
      filterCheckboxes.forEach(cb => {
        cb.checked = this.checked;
      });
      updateFilterSettings();
    });
  }

  // Обработчики для чекбоксов "To Look For"
  const lookForCheckboxes = document.querySelectorAll(".look-for");
  lookForCheckboxes.forEach(cb => {
    cb.addEventListener("change", function() {
      updateLookForSettings();
    });
  });



  // Слушатель для кнопки Start
  startButton.addEventListener("click", () => {
    welcomeScreen.classList.add("fade-out");
    setTimeout(() => {
      welcomeScreen.style.display = "none";
      appInterface.classList.remove("invisible");
      appInterface.classList.add("visible");
    }, 1200);
  });

  // Слушатели для поиска
  searchBtn.addEventListener("click", searchArtist);
  artistInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchArtist();
  });

  // Слушатель для меню
  document.addEventListener("click", (e) => {
    const toggleBtn = document.getElementById("menu-toggle");
    const menu = document.getElementById("navLinks");
    if (toggleBtn.contains(e.target)) {
      menu.style.display = menu.style.display === "flex" ? "none" : "flex";
    } else if (!menu.contains(e.target)) {
      menu.style.display = "none";
    }
  });
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
  const input = document.getElementById("artist-input").value.trim();
  const dropdown = document.getElementById("dropdown-results");
  const imgContainer = document.getElementById("artist-image-container");

  imgContainer.innerHTML = '<div class="panel-title">↓ Artist\'s Image ↓</div>';

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
    li.textContent = `${artist.name} (${artist.id})`;
    li.dataset.id = artist.id;

    li.addEventListener("click", () => {
      selectedArtistId = artist.id;
      selectedArtistName = artist.name;
      updateArtistImage(artist.id);
      dropdown.classList.add("hidden");
      loadDiscography(artist.id);
    });

    dropdown.appendChild(li);
  });

  dropdown.classList.remove("hidden");
}

function updateArtistImage(artistId) {
  const imgContainer = document.getElementById("artist-image-container");
  imgContainer.innerHTML = '<div class="panel-title">↓ Artist\'s Image ↓</div>';

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
  const sorted = albums.slice().sort((a, b) => b.popularity - a.popularity);
  const names = sorted.map(a => `${a.name} (${a.release_year})`);
  const pops = sorted.map(a => a.popularity);

  Plotly.newPlot("album-chart", [{
    type: "bar",
    x: pops,
    y: names,
    orientation: "h",
    marker: { color: "#1DB954" }
  }], {
    title: selectedArtistName ? `Album Popularity — ${selectedArtistName}` : "Album Popularity",
    margin: { t: 50, l: 300 },
    yaxis: {
      automargin: true,
      autorange: "reversed",
      tickfont: { size: 12 }
    },
    xaxis: {
      title: "Popularity",
      tickfont: { size: 12 }
    }
  }, { responsive: true });
}

function drawTrackChart(album) {
  const tracks = album.tracks.slice().sort((a, b) => b.popularity - a.popularity);
  const names = tracks.map(t => t.name);
  const pops = tracks.map(t => t.popularity);

  Plotly.newPlot("track-chart", [{
    type: "bar",
    x: pops,
    y: names,
    orientation: "h",
    marker: { color: "orange" }
  }], {
    title: `Tracks in ${album.name}`,
    margin: { t: 50, l: 300 },
    yaxis: {
      automargin: true,
      autorange: "reversed",
      tickfont: { size: 12 }
    },
    xaxis: {
      title: "Popularity",
      tickfont: { size: 12 }
    }
  }, { responsive: true });
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
  const appInterface = document.getElementById("app-interface");

  // Плавное затухание главного интерфейса
  appInterface.classList.remove("visible");
  appInterface.classList.add("invisible");

  setTimeout(() => {
    appInterface.style.display = "none";

    rawDataScreen.style.display = "flex";
    // Принудительный reflow для корректного применения transition
    void rawDataScreen.offsetWidth;
    rawDataScreen.classList.remove("invisible");
    rawDataScreen.classList.add("visible");

    // Заполняем Raw Data отформатированным текстом
    const rawText = document.getElementById("raw-data-text");
    rawText.textContent = formatRawData();
  }, 1200); // время анимации
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
  const appInterface = document.getElementById("app-interface");

  // Плавно затухаем главный интерфейс
  appInterface.classList.remove("visible");
  appInterface.classList.add("invisible");

  setTimeout(() => {
    appInterface.style.display = "none";
    settingsScreen.style.display = "flex";
    // Принудительный reflow для применения transition
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
