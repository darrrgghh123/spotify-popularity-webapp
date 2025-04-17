
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

  let scoredResults = data.results.map(artist => {
    const lowerName = artist.name.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const score = lowerName.includes(lowerQuery) ? 0 : levenshtein(lowerName, lowerQuery);
    return { artist, score };
  });

  const threshold = Math.floor(query.length / 2);
  let results = scoredResults.filter(item => item.score <= threshold);
  results.sort((a, b) => a.score - b.score);
  results = results.map(item => item.artist);

  dropdown.innerHTML = "";

  if (results.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No matches found";
    li.classList.add("no-results-message"); // для дополнительной стилизации, если нужно
    dropdown.appendChild(li);
    // Показываем dropdown, чтобы сообщение было видно
    dropdown.classList.remove("hidden");
  } else {
    results.forEach(artist => {
      artistImages[artist.id] = artist.image || null;
      const li = document.createElement("li");
      li.textContent = artist.name;
      li.dataset.id = artist.id;
      li.addEventListener("click", () => {
        selectArtist(artist);
      });
      dropdown.appendChild(li);
    });
    dropdown.classList.remove("hidden");
    dropdownSelectedIndex = -1;
  }
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
  // Обновляем выбранного исполнителя
  selectedArtistId = artist.id;
  selectedArtistName = artist.name;
  updateArtistImage(artist.id);

  // Скрываем выпадающий список
  const dropdown = document.getElementById("dropdown-results");
  dropdown.classList.add("hidden");
  dropdown.innerHTML = "";
  dropdownSelectedIndex = -1;

  // Сбрасываем настройки к значениям по умолчанию и загружаем дискографию
  resetSettingsToDefault();
  loadDiscography(artist.id);

  // Возвращаем пользователя на главный интерфейс (если он находится на Raw Data или Settings)
  goToMain();
}



