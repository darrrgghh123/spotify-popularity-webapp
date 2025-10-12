
const BLINKS_PER_PHRASE = 5;

let loaderBlinkCount = 0;
let loaderMode = 'start';           // 'start' -> сначала базовая фраза, далее 'facts'
let lastFactIndex = -1;
let loaderHandlerBound = null;      // чтобы корректно снимать слушатель


// loader phrases!
  const loaderPhrases = [
  "Loading discography, please hold on...",
  "Still fetching albums... Spotify servers might be busy",
  "The Beatles hold the record for most #1 hits",
  "Spotify launched on October 7, 2008",
  "The most-streamed artist of all time is Drake",
  "Billie Eilish was only 17 when she won her first Grammy",
  "You can sort albums by popularity once loaded",
  "Metallica was the first band to play on all seven continents",
  "The longest song on Spotify lasts over 13 hours!",
  "Hang tight — good music takes time to load!",
  "The shortest charting song ever is 36 seconds long",
  "Queen’s 'Bohemian Rhapsody' has no chorus — and still became a hit",
  "The first ever streamed song on Spotify was 'Humble' by Muse",
  "You can filter out releases you don't need in Settings",
  "The most followed playlist on Spotify is 'Today’s Top Hits'"
];
  // Если глобальный объект settings ещё не создан, создаём его
window.settings = window.settings || {
  types: ["album"],
  filters: []
};

document.addEventListener("DOMContentLoaded", () => {
 // Задержка появления экрана приветствия (например, 500 мс)
  const welcomeScreen = document.getElementById("welcome-screen");
  setTimeout(() => {
    welcomeScreen.classList.remove("invisible");
    welcomeScreen.classList.add("visible");
  }, 1000);
  // Объявляем элементы, доступные после загрузки DOM
  const startButton = document.getElementById("start-button");
  const appInterface = document.getElementById("app-interface");
  const searchBtnTop = document.getElementById("search-button-top");
  const artistInputTop = document.getElementById("artist-input-top");
    const menuBar = document.getElementById("menu-bar");         // ДОБАВЛЕНО
    // плавно меняем фон меню при прокрутке
window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    menuBar.classList.add('scrolled');
  } else {
    menuBar.classList.remove('scrolled');
  }
});
  const footer = document.querySelector("footer");
  // (Если нужен "search-button", добавьте его обработчик только если такой элемент есть)
  // const searchBtn = document.getElementById("search-button");
   // Подключаем функциональность для кнопки очистки поиска (clear search)
  const searchInput = document.getElementById("artist-input-top");
  const clearSearchBtn = document.getElementById("clear-search");
  const dropdown = document.getElementById("dropdown-results");
clearSearchBtn.style.display = "none";
// Добавляем обработчик изменения поля ввода,
// чтобы кнопка очистки появлялась только если что-то введено.
searchInput.addEventListener("input", function() {
  if (this.value.trim().length > 0) {
    clearSearchBtn.style.display = "block";  // Показываем крестик
  } else {
    clearSearchBtn.style.display = "none";     // Скрываем, если поле пустое
  }
});
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      searchInput.value = "";                // Очищаем поле ввода
      dropdown.classList.add("hidden");      // Скрываем выпадающий список, если он открыт
      // Запускаем событие input для обновления динамического поиска (если требуется)
      searchInput.dispatchEvent(new Event("input"));
    });
  }
  // Обработка нажатия на мобильный гамбургер (элемент с id="menu-toggle")
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation(); // чтобы клик не срабатывал в document
      mobileMenu.classList.toggle("hidden");
    });
  }
  window.mobileMenuLinkClicked = function() {
  if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
    mobileMenu.classList.add("hidden");
  }
};

// Если экран меньше или равен 768px – мобильное устройство:
  if (window.innerWidth <= 768) {
    document.getElementById("artist-input-top").placeholder = "Enter artist name";
  }
  // Функция для закрытия мобильного меню при клике по ссылке
  window.mobileMenuLinkClicked = function() {
    if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
      mobileMenu.classList.add("hidden");
    }
  };

  // Закрытие мобильного меню при клике вне него
  document.addEventListener("click", (e) => {
    if (mobileMenu && !e.target.closest("#mobile-menu") && !e.target.closest("#menu-toggle")) {
      if (!mobileMenu.classList.contains("hidden")) {
        mobileMenu.classList.add("hidden");
      }
    }
  });




    // === Export: controls ===
  const expOrder = document.getElementById("export-order");
  const expRange = document.getElementById("export-range");
  const expCount = document.getElementById("export-count");
  const expBtn   = document.getElementById("export-download");

  if (expOrder) {
    expOrder.addEventListener("change", () => updateExportPreviewCount());
  }
  if (expRange) {
    expRange.addEventListener("input", () => {
      expCount.textContent = expRange.value;
    });
  }
  if (expBtn) {
    expBtn.addEventListener("click", exportToCsv);
  }

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


function setArtistImageUrl(url) {
  const imgContainer = document.getElementById("artist-image-container");
  imgContainer.innerHTML = '<div class="panel-title">Artist\'s Image</div>';
  if (url) {
    const img = document.createElement("img");
    img.src = url;
    img.alt = "Artist";
    img.classList.add("artist-image");
    imgContainer.appendChild(img);
  }
}


// ЗАМЕНИ СУЩЕСТВУЮЩУЮ updateArtistImage НА ЭТУ
function updateArtistImage(artistId) {
  const imgContainer = document.getElementById("artist-image-container");
  imgContainer.innerHTML = '<div class="panel-title">Artist\'s Image</div>';

  // 1) пробуем достать hi-res из загруженной дискографии
  let hiResUrl = null;
  if (discographyData && discographyData.artist && Array.isArray(discographyData.artist.images) && discographyData.artist.images.length > 0) {
    // как правило, Spotify отдаёт самый большой первым
    hiResUrl = discographyData.artist.images[0]?.url || null;
  }

  // 2) если hi-res ещё не доступен — используем маленький thumbnail из поиска
  const fallbackThumb = artistImages[artistId] || null;

  const finalUrl = hiResUrl || fallbackThumb;
  if (finalUrl) {
    const img = document.createElement("img");
    img.src = finalUrl;
    img.alt = "Artist";
    img.classList.add("artist-image");
    imgContainer.appendChild(img);
  }
}


async function loadDiscography(artist_id, releaseTypes = "album") {
  showLoading(true);
  const res = await fetch("/get_discography", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ artist_id: artist_id, release_types: releaseTypes })
  });
  const data = await res.json();
  showLoading(false);

  discographyData = data;
 updateArtistImage(selectedArtistId);

  selectedAlbum = null;
  const albumList = document.getElementById("album-list");
  albumList.innerHTML = "";

  data.albums.forEach(album => {
    const li = document.createElement("li");
    li.textContent = `${album.name} (${album.release_year}) [pop: ${album.popularity}]`;
    li.addEventListener("click", () => {
      let albumForDisplay = Object.assign({}, album);
      if (albumForDisplay.tracks && window.settings.filters && window.settings.filters.length > 0) {
        albumForDisplay.tracks = albumForDisplay.tracks.filter(track => {
          return !window.settings.filters.some(filterWord => track.name.toLowerCase().includes(filterWord.toLowerCase()));
        });
      }
      if (albumForDisplay.tracks.length > 0) {
        drawTrackChart(albumForDisplay);
      } else {
        document.getElementById("track-chart").innerHTML = "";
      }
      selectedAlbum = albumForDisplay;
    });
    albumList.appendChild(li);
  });

  drawAlbumChart(data.albums);
}


function drawAlbumChart(albums) {
  // 1) Определяем префикс по window.settings.types
  let prefix;
  const types = window.settings.types; // ["album"], ["single"], ["album","single"], …
  if (types.includes("album") && types.includes("single")) {
    prefix = "Discography Popularity";
  } else if (types.includes("single")) {
    prefix = "Singles Popularity";
  } else {
    prefix = "Album Popularity";
  }

  // 2) Формируем полный текст заголовка
  const titleText = selectedArtistName
    ? `${prefix} — ${selectedArtistName}`
    : prefix;

  // 3) Строим сам график, подставляя titleText вместо статичного "Album Popularity"
  const sorted = albums.slice().sort((a, b) => b.popularity - a.popularity);
  const names = sorted.map(a => `${a.name} (${a.release_year})`);
  const pops  = sorted.map(a => a.popularity);

  const darkTheme = {
    paper_bgcolor: "#222222",
    plot_bgcolor:  "#222222",
    font: { color: "#FFFFFF" },
    xaxis: {
      gridcolor: "#333333",
      tickfont: { color: "#FFFFFF", size: 12 },
      title: { text: "Popularity", font: { color: "#FFFFFF", size: 12 } }
    },
    yaxis: {
      gridcolor: "#333333",
      tickfont: { color: "#FFFFFF", size: 12 },
      autorange: "reversed"
    },
    margin: { t: 50, l: 300 }
  };

  Plotly.newPlot(
    "album-chart",
    [{ type: "bar", x: pops, y: names, orientation: "h", marker: { color: "#1DB954" } }],
    Object.assign({ title: titleText }, darkTheme),
    { responsive: true }
  );
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


let loaderInterval = null;
let phraseIndex = 0;

function showLoading(show) {
  const spinner = document.getElementById("loader");

  // помощники
  const baseText = "Loading discography, please hold on...";
  const factsPool = (Array.isArray(loaderPhrases) ? loaderPhrases : [])
    // из пула для фактов убираем базовую фразу(ы), если вдруг есть похожие
    .filter(p => p.toLowerCase().indexOf("loading discography") === -1);

  // подобрать новый факт, не повторяя предыдущий подряд
  function pickNextFact() {
    if (!factsPool.length) return baseText;
    let idx;
    do {
      idx = Math.floor(Math.random() * factsPool.length);
    } while (factsPool.length > 1 && idx === lastFactIndex);
    lastFactIndex = idx;
    return factsPool[idx];
  }

  // обработчик одного полного цикла анимации (одно мигание)
  function onBlink() {
    loaderBlinkCount++;
    if (loaderBlinkCount >= BLINKS_PER_PHRASE) {
      loaderBlinkCount = 0;

      if (loaderMode === 'start') {
        loaderMode = 'facts';
        spinner.textContent = pickNextFact();
      } else {
        spinner.textContent = pickNextFact();
      }
    }
  }

  if (show) {
    // показать и инициализировать
    spinner.style.display = "block";
    spinner.style.opacity = "0";              // начнём с нуля и дадим анимации войти
    spinner.textContent = baseText;
    loaderBlinkCount = 0;
    loaderMode = 'start';

    // перевесим слушатель (на всякий случай снимем старый)
    if (loaderHandlerBound) {
      spinner.removeEventListener("animationiteration", loaderHandlerBound);
    }
    loaderHandlerBound = onBlink;
    spinner.addEventListener("animationiteration", loaderHandlerBound);

    // быстро выставим видимость (анимация сама погонит мигания)
    requestAnimationFrame(() => { spinner.style.opacity = "0"; }); // уже 0, но пусть зафиксируется
  } else {
    // плавно тушим и чистим состояние
    spinner.style.transition = "opacity 1s ease";
    spinner.style.opacity = "0";
    setTimeout(() => {
      spinner.style.display = "none";
      spinner.style.transition = "";
      loaderBlinkCount = 0;
      loaderMode = 'start';
      lastFactIndex = -1;
      if (loaderHandlerBound) {
        spinner.removeEventListener("animationiteration", loaderHandlerBound);
        loaderHandlerBound = null;
      }
    }, 1000);
  }
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

  // Вывод информации об артисте, если объект artist присутствует
  if (discographyData.artist) {
    // У Spotify API подписчики (followers) приходят в виде объекта { total: число }
    const followers = discographyData.artist.followers ? discographyData.artist.followers.total : "N/A";
    // Жанры обычно передаются в виде массива в свойстве genres
    const genres = (discographyData.artist.genres && discographyData.artist.genres.length > 0)
                     ? discographyData.artist.genres.join(", ")
                     : "N/A";
    text += `Artist: ${discographyData.artist.name}\n`;
    text += `Followers: ${followers}\n`;
    text += `Genres: ${genres}\n\n`;
  } else {
    text += "Artist info not available.\n\n";
  }

  // Вычисляем самый свежий релиз на основе release_date
  if (discographyData.albums && discographyData.albums.length > 0) {
    let latest = discographyData.albums.reduce((a, b) => {
      // Если release_date отсутствует или некорректен, считаем его как "0000-00-00"
      let dateA = a.release_date && a.release_date !== "undefined" ? a.release_date : "0000-00-00";
      let dateB = b.release_date && b.release_date !== "undefined" ? b.release_date : "0000-00-00";
      return dateA > dateB ? a : b;
    });
    text += `Latest Release: ${latest.name} (pop: ${latest.popularity}, ${latest.release_year})\n\n`;
  } else {
    text += "No albums available.\n\n";
  }

  // Форматирование информации об альбомах – выводим поля: название, ID, популярность и дату выпуска
  if (discographyData.albums && discographyData.albums.length > 0) {
    text += "Albums:\n";
    discographyData.albums.forEach(album => {
      // Выводим только название без дополнительных скобок
      text += `  • ${album.name}\n`;
      text += `     ID: ${album.id}\n`;
      text += `     Popularity: ${album.popularity}\n`;
      text += `     Release date: ${album.release_date}\n\n`;
    });
  } else {
    text += "Albums: No album data available.\n\n";
  }

  // Форматирование информации о треках для выбранного альбома
  if (selectedAlbum && selectedAlbum.tracks && selectedAlbum.tracks.length > 0) {
    text += "Tracks:\n\n";
    selectedAlbum.tracks.forEach(track => {
      text += `  • ${track.name}\n`;
      text += `     ID: ${track.id}\n`;
      text += `     Popularity: ${track.popularity}\n\n`;
    });
  } else {
    text += "Tracks: No track data available.\n";
  }

  return text;
}


/* Обновляем функцию showRawData, чтобы выводить отформатированный текст */
function showRawData() {
  const rawDataScreen  = document.getElementById("raw-data-screen");
  const settingsScreen = document.getElementById("settings-screen");
  const aboutScreen    = document.getElementById("about-screen");
  const exportScreen   = document.getElementById("export-screen");
  const appInterface   = document.getElementById("app-interface");

  // Скрываем Export, Settings и About, если видны
  [settingsScreen, aboutScreen, exportScreen].forEach(screen => {
    if (screen && screen.style.display !== "none") {
      screen.classList.remove("visible");
      screen.classList.add("invisible");
      setTimeout(() => { screen.style.display = "none"; }, 1200);
    }
  });

  appInterface.classList.remove("visible");
  appInterface.classList.add("invisible");

  setTimeout(() => {
    appInterface.style.display = "none";
    rawDataScreen.style.display = "flex";
    void rawDataScreen.offsetWidth;
    rawDataScreen.classList.remove("invisible");
    rawDataScreen.classList.add("visible");

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

function showAbout() {
  const aboutScreen    = document.getElementById("about-screen");
  const settingsScreen = document.getElementById("settings-screen");
  const rawDataScreen  = document.getElementById("raw-data-screen");
  const exportScreen   = document.getElementById("export-screen");
  const appInterface   = document.getElementById("app-interface");

  // Скрываем Export, Raw Data и Settings, если открыты
  [settingsScreen, rawDataScreen, exportScreen].forEach(screen => {
    if (screen && screen.style.display !== "none") {
      screen.classList.remove("visible");
      screen.classList.add("invisible");
      setTimeout(() => { screen.style.display = "none"; }, 1200);
    }
  });

  appInterface.classList.remove("visible");
  appInterface.classList.add("invisible");

  setTimeout(() => {
    appInterface.style.display = "none";
    aboutScreen.style.display = "flex";
    void aboutScreen.offsetWidth;
    aboutScreen.classList.remove("invisible");
    aboutScreen.classList.add("visible");
  }, 1200);
}


function getFilteredAlbums() {
  if (!discographyData || !discographyData.albums) return [];

  // типы (album/single)
  let albums = discographyData.albums.filter(a => {
    return a.album_type ? window.settings.types.includes(a.album_type.toLowerCase()) : true;
  });

  // фильтры по словам
  if (window.settings.filters && window.settings.filters.length > 0) {
    albums = albums.filter(a => {
      const low = a.name.toLowerCase();
      return !window.settings.filters.some(f => low.includes(f.toLowerCase()));
    });
  }
  return albums;
}

function showExport() {
  const exportScreen  = document.getElementById("export-screen");
  const settingsScreen = document.getElementById("settings-screen");
  const rawDataScreen  = document.getElementById("raw-data-screen");
  const aboutScreen    = document.getElementById("about-screen");
  const appInterface   = document.getElementById("app-interface");

  // закрыть остальные
  [settingsScreen, rawDataScreen, aboutScreen].forEach(screen => {
    if (screen && screen.style.display !== "none") {
      screen.classList.remove("visible");
      screen.classList.add("invisible");
      setTimeout(() => { screen.style.display = "none"; }, 1200);
    }
  });

  // спрятать главный интерфейс
  appInterface.classList.remove("visible");
  appInterface.classList.add("invisible");

  setTimeout(() => {
    appInterface.style.display = "none";
    exportScreen.style.display = "flex";
    void exportScreen.offsetWidth;
    exportScreen.classList.remove("invisible");
    exportScreen.classList.add("visible");

    // обновить контролы в зависимости от наличия данных
    updateExportControls();
  }, 1200);
}


function showSettings() {
  const settingsScreen = document.getElementById("settings-screen");
  const rawDataScreen  = document.getElementById("raw-data-screen");
  const aboutScreen    = document.getElementById("about-screen");
  const exportScreen   = document.getElementById("export-screen");
  const appInterface   = document.getElementById("app-interface");

  // Скрываем Raw Data, About и Export, если видны
  [rawDataScreen, aboutScreen, exportScreen].forEach(screen => {
    if (screen && screen.style.display !== "none") {
      screen.classList.remove("visible");
      screen.classList.add("invisible");
      setTimeout(() => { screen.style.display = "none"; }, 1200);
    }
  });

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

  // Фильтруем альбомы по типу
  let filteredAlbums = discographyData.albums.filter(album => {
    if (album.album_type) {
      return window.settings.types.includes(album.album_type.toLowerCase());
    }
    return true;
  });

  // Убираем альбомы, название которых содержит выбранные ключевые слова
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
      let albumForDisplay = Object.assign({}, album);
      if (albumForDisplay.tracks && window.settings.filters && window.settings.filters.length > 0) {
        albumForDisplay.tracks = albumForDisplay.tracks.filter(track => {
          return !window.settings.filters.some(filterWord => track.name.toLowerCase().includes(filterWord.toLowerCase()));
        });
      }
      if (albumForDisplay.tracks.length > 0) {
        drawTrackChart(albumForDisplay);
      } else {
        document.getElementById("track-chart").innerHTML = "";
      }
      selectedAlbum = albumForDisplay;
    });
    albumList.appendChild(li);
  });

  // Обновляем график альбомов
  drawAlbumChart(filteredAlbums);
  // синхронизируем панель экспорта
  updateExportControls();

  // Обновляем график треков для выбранного альбома
  if (selectedAlbum) {
    // Если выбранный альбом уже не входит в отфильтрованные альбомы,
    // очищаем контейнер графика треков и сбрасываем selectedAlbum.
    if (!filteredAlbums.some(album => album.id === selectedAlbum.id)) {
      selectedAlbum = null;
      document.getElementById("track-chart").innerHTML = "";
    } else {
      // Применяем фильтр к трекам выбранного альбома
      let filteredTracks = selectedAlbum.tracks.filter(track => {
        return !window.settings.filters.some(filterWord => track.name.toLowerCase().includes(filterWord.toLowerCase()));
      });
      if (filteredTracks.length > 0) {
        selectedAlbum.tracks = filteredTracks;
        drawTrackChart(selectedAlbum);
      } else {
        document.getElementById("track-chart").innerHTML = "";
      }
    }
  }
}

function updateExportControls() {
  const emptyMsg = document.getElementById("export-empty");
  const controls = document.getElementById("export-controls");
  const expRange = document.getElementById("export-range");
  const expCount = document.getElementById("export-count");

  const albums = getFilteredAlbums();

  if (!discographyData || albums.length === 0) {
    if (emptyMsg)   emptyMsg.style.display = "block";
    if (controls)   controls.classList.add("hidden");
    return;
  }

  if (emptyMsg) emptyMsg.style.display = "none";
  if (controls) controls.classList.remove("hidden");

  // настроим слайдер
  const maxVal = Math.max(1, albums.length);
  expRange.max = String(maxVal);
  expRange.min = "1";
  expRange.step = "1";
  expRange.value = String(maxVal);
  expCount.textContent = String(maxVal);
}

function updateExportPreviewCount() {
  const expCount = document.getElementById("export-count");
  const expRange = document.getElementById("export-range");
  if (expCount && expRange) expCount.textContent = expRange.value;
}

function exportToCsv() {
  const expOrder = document.getElementById("export-order").value; // 'asc' or 'desc'
  const expRange = parseInt(document.getElementById("export-range").value, 10);

  let albums = getFilteredAlbums();
  if (albums.length === 0) return;

  // сортировка по популярности
  albums.sort((a, b) => {
    const diff = (a.popularity || 0) - (b.popularity || 0);
    return expOrder === "asc" ? diff : -diff;
  });

  // ограничение количеством
  albums = albums.slice(0, expRange);

  // сведения об артисте
  const artistName = (discographyData.artist && discographyData.artist.name) || selectedArtistName || "";
  const followers  = discographyData.artist?.followers?.total ?? "";
  const genres     = (discographyData.artist?.genres && discographyData.artist.genres.length > 0)
                     ? discographyData.artist.genres.join("; ")
                     : "";

  // заголовки
  const baseHeaders = [
    "Artist","Followers","Genres",
    "Release Type","Release Name","Release Date","Release ID","Popularity Score"
  ];

  // Если выбран альбом — добавим трековые колонки
  const addTracks = !!(selectedAlbum && selectedAlbum.tracks && selectedAlbum.tracks.length > 0);
  const trackHeaders = addTracks ? ["Selected Release","Track","Track ID","Track Score"] : [];
  const headers = baseHeaders.concat(trackHeaders);

  const rows = [];

  // строки по релизам
  albums.forEach(a => {
    const row = [
      artistName,
      followers,
      genres,
      a.album_type || "",
      a.name || "",
      a.release_date || "",
      a.id || "",
      a.popularity ?? ""
    ];
    // для «общих» релизов — дополнит. трековые поля пусты
    if (addTracks) row.push("", "", "", "");
    rows.push(row);
  });

  // если выбранный релиз есть — добавим строки по его трекам
  if (addTracks) {
    const albumName = selectedAlbum.name;
    (selectedAlbum.tracks || []).forEach(t => {
      rows.push([
        artistName,
        followers,
        genres,
        selectedAlbum.album_type || "album",
        selectedAlbum.name || "",
        selectedAlbum.release_date || "",
        selectedAlbum.id || "",
        selectedAlbum.popularity ?? "",
        albumName || "",
        t.name || "",
        t.id || "",
        t.popularity ?? ""
      ]);
    });
  }

  // CSV: экранирование
  const esc = v => {
    const s = (v === null || v === undefined) ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
  };

  const csv = [headers.map(esc).join(",")]
    .concat(rows.map(r => r.map(esc).join(",")))
    .join("\n");

  // скачать в браузере
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g,"-");
  a.href = url;
  a.download = `${(artistName || "discography").replace(/\s+/g,"_")}_export_${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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
  const raw      = document.getElementById("raw-data-screen");
  const settings = document.getElementById("settings-screen");
  const about    = document.getElementById("about-screen");
  const exportSc = document.getElementById("export-screen");
  const app      = document.getElementById("app-interface");

  [raw, settings, about, exportSc].forEach(screen => {
    if (screen && screen.style.display !== "none") {
      screen.classList.remove("visible");
      screen.classList.add("invisible");
      setTimeout(() => { screen.style.display = "none"; }, 1200);
    }
  });

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
  window.settings.types = ["album"];
  window.settings.filters = [];

 // Обработчики для чекбоксов "To Look For"
const lookForCheckboxes = document.querySelectorAll(".look-for");
lookForCheckboxes.forEach(cb => {
  cb.addEventListener("change", function() {
    updateLookForSettings();
    // Если уже выбран исполнитель, выполняем повторную загрузку дискографии
    if (selectedArtistId) {
      // Собираем значение для параметра release_types, например, "album" или "album,single"
      const releaseTypes = window.settings.types.join(",");
      loadDiscography(selectedArtistId, releaseTypes);
    }
  });
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

// Функция дебаунса
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => { func.apply(this, args); }, delay);
  };
}

// Глобальная переменная для отслеживания выделенного индекса в выпадающем списке
let dropdownSelectedIndex = -1;



// ДОБАВЬ ВВЕРХ (рядом с levenshtein):
function normalizeStr(s) {
  return s
    .toLowerCase()
    .normalize("NFKD")                 // диакритика -> базовые символы
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/\$/g, "s")
    .replace(/[^\w\s]+/g, " ")         // пунктуация в пробел
    .replace(/\s+/g, " ")
    .trim();
}

// Счёт по словам: суммируем минимальные расстояния от каждого q-токена до любого токена имени
function multiWordScore(name, query) {
  const n = normalizeStr(name).split(" ");
  const q = normalizeStr(query).split(" ");

  // если все q-токены входят подстрокой — это «идеальный» матч
  const allIn = q.every(tok => n.join(" ").includes(tok));
  if (allIn) return 0;

  let sum = 0;
  for (const tok of q) {
    let best = Infinity;
    for (const w of n) {
      const d = levenshtein(w, tok);
      if (d < best) best = d;
      if (best === 0) break;
    }
    sum += best;
  }

  // Буст за префиксное совпадение целиком
  const nn = normalizeStr(name);
  const qq = normalizeStr(query);
  if (nn.startsWith(qq)) sum = Math.max(0, sum - 2);

  return sum;
}



// Функция вычисления расстояния Левенштейна между строками
function levenshtein(a, b) {
  const matrix = [];
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Инициализируем первую строку и столбец
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Заполняем матрицу
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,  // замена
          matrix[i][j - 1] + 1,      // вставка
          matrix[i - 1][j] + 1       // удаление
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Функция обработки динамического поиска с фаззи-поддержкой
async function doDynamicSearch() {
  const inputEl = document.getElementById("artist-input-top");
  const query = inputEl.value.trim();
  const dropdown = document.getElementById("dropdown-results");

  if (query.length < 2) {
    dropdown.classList.add("hidden");
    dropdown.innerHTML = "";
    dropdownSelectedIndex = -1;
    return;
  }

  const res = await fetch("/search_artist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ artist: query })
  });
  const data = await res.json();

  // скорим по словам
  let scored = data.results.map(a => ({ artist: a, score: multiWordScore(a.name, query) }));

  // мягкий порог: ~0.5 * средняя длина q-токенов * кол-во токенов
  const qTokens = normalizeStr(query).split(" ");
  const avgLen = qTokens.reduce((s, t) => s + t.length, 0) / qTokens.length;
  const threshold = Math.max(2, Math.round(qTokens.length * Math.max(1, avgLen * 0.5)));

  let results = scored
    .filter(x => x.score <= threshold)
    .sort((a, b) => a.score - b.score)
    .map(x => x.artist);

  dropdown.innerHTML = "";

  if (results.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No matches found";
    li.classList.add("no-results-message");
    dropdown.appendChild(li);
    dropdown.classList.remove("hidden");
    return;
  }

  results.forEach(artist => {
    artistImages[artist.id] = artist.image || null;

    const li = document.createElement("li");
    li.classList.add("dropdown-item");
    li.dataset.id = artist.id;
    // мини-аватар + имя; если картинки нет — квадрат-заглушка через CSS
    li.innerHTML = `
      <span class="avatar" ${artist.image ? `style="background-image:url('${artist.image}')"` : ""}></span>
      <span class="name">${artist.name}</span>
    `;

    li.addEventListener("click", () => { selectArtist(artist); });
    dropdown.appendChild(li);
  });

  dropdown.classList.remove("hidden");
  dropdownSelectedIndex = -1;
}



// Обновлённая функция для выделения пунктов dropdown с автопрокруткой
function updateDropdownSelection() {
  const dropdown = document.getElementById("dropdown-results");
  const items = dropdown.getElementsByTagName("li");
  for (let i = 0; i < items.length; i++) {
    if (i === dropdownSelectedIndex) {
      items[i].classList.add("selected");
      // Прокручиваем выбранный элемент в область видимости
      items[i].scrollIntoView({ block: "nearest", behavior: "smooth" });
    } else {
      items[i].classList.remove("selected");
    }
  }
}

// Обёрнутая функция с дебаунсом (300 мс задержка)
const dynamicSearch = debounce(doDynamicSearch, 300);

// Навешиваем обработчик события input на поле поиска
document.getElementById("artist-input-top").addEventListener("input", dynamicSearch);

// Обработка клавиатурной навигации для поля поиска
document.getElementById("artist-input-top").addEventListener("keydown", function(e) {
  const dropdown = document.getElementById("dropdown-results");
  const items = dropdown.getElementsByTagName("li");
  if (dropdown.classList.contains("hidden") || items.length === 0) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    dropdownSelectedIndex = (dropdownSelectedIndex + 1) % items.length;
    updateDropdownSelection();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    dropdownSelectedIndex = (dropdownSelectedIndex - 1 + items.length) % items.length;
    updateDropdownSelection();
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (dropdownSelectedIndex >= 0 && dropdownSelectedIndex < items.length) {
      items[dropdownSelectedIndex].click();
      dropdown.classList.add("hidden");
      dropdown.innerHTML = "";
      dropdownSelectedIndex = -1;
    }
  } else if (e.key === "Escape") {
    dropdown.classList.add("hidden");
    dropdown.innerHTML = "";
    dropdownSelectedIndex = -1;
  }
});


// Функция выбора исполнителя при клике (либо по Enter)
function selectArtist(artist) {
  selectedArtistId = artist.id;
  selectedArtistName = artist.name;
  document.getElementById("artist-input-top").value = artist.name;

  // 1) сразу показываем превью из поиска (мгновенно)
  if (artist.image) setArtistImageUrl(artist.image);

  // 2) параллельно тянем hi-res и заменяем картинку сразу, не дожидаясь дискографии
  fetch("/get_artist_info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ artist_id: artist.id })
  })
  .then(r => r.json())
  .then(info => {
    const big = (info.images && info.images.length) ? info.images[0].url : null; // обычно 0-й — самый большой
    if (big) setArtistImageUrl(big);
  })
  .catch(() => {}); // тихо игнорируем, если вдруг не пришло

  // 3) скрываем дропдаун и продолжаем обычный флоу
  const dropdown = document.getElementById("dropdown-results");
  dropdown.classList.add("hidden");
  dropdown.innerHTML = "";
  dropdownSelectedIndex = -1;

  resetSettingsToDefault();
  loadDiscography(artist.id);   // пусть грузится в фоне
  goToMain();
}



