
// ----- Navigation: About dropdown (desktop) and hamburger menu (mobile) -----
const navBar = document.querySelector(".nav-bar");
const navMenuToggle = document.querySelector(".nav-menu-toggle");
const navDropdown = document.querySelector(".nav-dropdown");
const navDropdownToggle = document.querySelector(".nav-dropdown-toggle");

function setAboutMenuOpen(open) {
  if (!navDropdown || !navDropdownToggle) return;
  navDropdown.classList.toggle("open", open);
  navDropdownToggle.setAttribute("aria-expanded", String(open));
}

function setMobileMenuOpen(open) {
  if (!navBar || !navMenuToggle) return;
  navBar.classList.toggle("menu-open", open);
  navMenuToggle.setAttribute("aria-expanded", String(open));
  if (!open) setAboutMenuOpen(false);
}

function closeNavMenus() {
  setAboutMenuOpen(false);
  setMobileMenuOpen(false);
}

if (navDropdownToggle) {
  navDropdownToggle.addEventListener("click", () => {
    setAboutMenuOpen(!navDropdown.classList.contains("open"));
  });
}

if (navMenuToggle) {
  navMenuToggle.addEventListener("click", () => {
    setMobileMenuOpen(!navBar.classList.contains("menu-open"));
  });
}

// Close menus when clicking outside of the nav
document.addEventListener("click", (event) => {
  if (navBar && !navBar.contains(event.target)) closeNavMenus();
});

// Close menus on Escape
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeNavMenus();
});

// Close menus when the viewport width changes (ignores the height-only resizes mobile browsers fire while scrolling)
let lastViewportWidth = window.innerWidth;
window.addEventListener("resize", () => {
  if (window.innerWidth !== lastViewportWidth) {
    lastViewportWidth = window.innerWidth;
    closeNavMenus();
  }
});

function getSiteMode() {
  return document.documentElement.classList.contains("dark-mode") ? "dark" : "light";
}

function updatePreviewThemeCards() {
  const isDark = document.documentElement.classList.contains("dark-mode");
  const themedImages = document.querySelectorAll(".preview-theme-card, .cv-image, .download-image, .model-figure-img");

  themedImages.forEach(img => {
    img.src = isDark ? img.dataset.dark : img.dataset.light;
  });
}

function whenTwitterWidgetsReady(callback, attemptsLeft = 50) {
  if (window.twttr && window.twttr.widgets) {
    callback();
    return;
  }

  if (attemptsLeft <= 0) return;

  setTimeout(() => whenTwitterWidgetsReady(callback, attemptsLeft - 1), 100);
}

// Re-render the embedded X/Twitter post using the site's current light/dark theme.
function renderTweetEmbed(theme) {
  const container = document.getElementById("x-tweet-embed");
  if (!container) return;

  const tweetId = container.dataset.tweetId;
  if (!tweetId) return;

  whenTwitterWidgetsReady(() => {
    container.innerHTML = "";
    twttr.widgets.createTweet(tweetId, container, { theme, dnt: true });
  });
}

function setupPlayerFilter(suffix) {
  const season = document.getElementById(`season-${suffix}`);
  const team = document.getElementById(`team-${suffix}`);
  const position = document.getElementById(`position-${suffix}`);
  const player = document.getElementById(`player-${suffix}`);
  const form = document.getElementById(`filter-form-${suffix}`);
  const card = document.getElementById(`card-img-${suffix}`);
  const spinner = document.getElementById(`loading-spinner-${suffix}`);
  const generateBtn = form.querySelector(".generate-button");

  const preload = PRELOAD_CARDS[suffix];

  const allPlayers = Array.from(player.options).map(opt => ({
    name: opt.value,
    text: opt.textContent,
    season: opt.dataset.season,
    team: opt.dataset.team,
    position: opt.dataset.position
  }));

  const allTeams = Array.from(team.options).map(opt => ({
    value: opt.value,
    text: opt.textContent,
    season: opt.dataset.season
  }));

  function applyCardMode() {
    const cardContainer = form.querySelector(".player-card");
    if (!cardContainer) return;

    const mode = getSiteMode();
    cardContainer.style.setProperty(
      "--player-card-background",
      mode === "dark" ? "rgb(39, 39, 39)" : "#ffffff"
    );
  }

  function filterPlayers() {
    const s = season.value;
    const t = team.value;
    const p = position.value;

    const previousValue = player.value;
    player.innerHTML = "";

    const filtered = allPlayers.filter(pl =>
      (!s || pl.season === s) &&
      (!t || pl.team === t) &&
      (!p || pl.position === p)
    );

    if (filtered.length === 0) {
      const opt = document.createElement("option");
      opt.text = "No Players Available";
      opt.disabled = true;
      opt.selected = true;
      player.add(opt);
    } else {
      filtered.forEach(pl => {
        const opt = document.createElement("option");
        opt.value = pl.name;
        opt.text = pl.text;
        opt.dataset.season = pl.season;
        opt.dataset.team = pl.team;
        opt.dataset.position = pl.position;
        player.add(opt);
      });

      if (previousValue && Array.from(player.options).some(o => o.value === previousValue)) {
        player.value = previousValue;
      }
    }
  }

  function filterPlayerTeams() {
    const selectedSeason = season.value;
    const previousValue = team.value;

    team.innerHTML = "";

    const filteredTeams = allTeams
      .filter(t => !selectedSeason || t.season === selectedSeason)
      .sort((a, b) => a.text.localeCompare(b.text));

    if (filteredTeams.length === 0) {
      const opt = document.createElement("option");
      opt.text = "No Teams Available";
      opt.disabled = true;
      opt.selected = true;
      team.add(opt);
    } else {
      filteredTeams.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t.value;
        opt.text = t.text;
        opt.dataset.season = t.season;
        team.add(opt);
      });

      if (previousValue && Array.from(team.options).some(o => o.value === previousValue)) {
        team.value = previousValue;
      }
    }
  }

  function updateCardImage() {
    const selected = player.selectedOptions[0];
    if (!selected || selected.disabled) return;

    const mode = getSiteMode();
    applyCardMode();

    const imgSrc = `/player_card_image?season=${selected.dataset.season}&team=${selected.dataset.team}&position=${selected.dataset.position}&player=${encodeURIComponent(selected.value)}&mode=${mode}`;

    const cardLink = document.getElementById(`card-link-${suffix}`);
    if (cardLink) cardLink.href = imgSrc;

    // If this exact card is already showing, the browser won't fire a new
    // load event for an unchanged src, so just make sure it's visible.
    if (card.src === new URL(imgSrc, window.location.href).href) {
      if (spinner) spinner.style.display = "none";
      card.style.display = "block";
      return;
    }

    card.style.display = "none";
    if (spinner) spinner.style.display = "flex";

    card.onload = () => {
      if (spinner) spinner.style.display = "none";
      card.style.display = "block";
    };

    card.onerror = () => {
      if (spinner) spinner.style.display = "none";
      console.error(`Failed to load card image for ${selected.value}`);
    };

    card.src = imgSrc;
  }

  season.addEventListener("change", () => {
    filterPlayerTeams();
    filterPlayers();
  });
  position.addEventListener("change", filterPlayers);
  team.addEventListener("change", filterPlayers);
  generateBtn.addEventListener("click", updateCardImage);

  filterPlayerTeams();
  filterPlayers();
  applyCardMode();

  if (preload) {
    season.value = preload.season;
    position.value = preload.position;
    filterPlayerTeams();
    team.value = preload.team;
    filterPlayers();

    const preloadOption = Array.from(player.options).find(
      opt =>
        opt.value === preload.player &&
        opt.dataset.season === preload.season &&
        opt.dataset.position === preload.position &&
        opt.dataset.team === preload.team
    );

    if (preloadOption) {
      player.value = preload.player;
      updateCardImage();
    }
  }

  return { updateCardImage, applyCardMode };
}

function setupTeamFilter(suffix) {
  const season = document.getElementById(`team-season-${suffix}`);
  const team = document.getElementById(`team-select-${suffix}`);
  const form = document.getElementById(`team-filter-form-${suffix}`);
  const card = document.getElementById(`team-card-img-${suffix}`);
  const spinner = document.getElementById(`team-loading-spinner-${suffix}`);
  const generateBtn = form.querySelector(".generate-button");

  const preload = PRELOAD_TEAM_CARDS[suffix];

  const allTeams = Array.from(team.options).map(opt => ({
    value: opt.value,
    text: opt.textContent,
    season: opt.dataset.season
  }));

  function applyCardMode() {
    const cardContainer = form.querySelector(".player-card");
    if (!cardContainer) return;

    const mode = getSiteMode();
    cardContainer.style.setProperty(
      "--player-card-background",
      mode === "dark" ? "rgb(39, 39, 39)" : "#ffffff"
    );
  }

  function filterTeams() {
    const selectedSeason = season.value;
    const previousValue = team.value;

    team.innerHTML = "";

    const filtered = allTeams
      .filter(t => !selectedSeason || t.season === selectedSeason)
      .sort((a, b) => a.text.localeCompare(b.text));

    if (filtered.length === 0) {
      const opt = document.createElement("option");
      opt.text = "No Teams Available";
      opt.disabled = true;
      opt.selected = true;
      team.add(opt);
    } else {
      filtered.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t.value;
        opt.text = t.text;
        opt.dataset.season = t.season;
        team.add(opt);
      });

      if (previousValue && Array.from(team.options).some(o => o.value === previousValue)) {
        team.value = previousValue;
      }
    }
  }

  function updateTeamCardImage() {
    const selectedTeam = team.value;
    const selectedSeason = season.value;
    const mode = getSiteMode();

    if (!selectedTeam || !selectedSeason) return;
    if (team.selectedOptions[0] && team.selectedOptions[0].disabled) return;

    applyCardMode();

    const imgSrc = `/team_card_image?season=${selectedSeason}&team=${encodeURIComponent(selectedTeam)}&mode=${mode}`;

    const cardLink = document.getElementById(`team-card-link-${suffix}`);
    if (cardLink) cardLink.href = imgSrc;

    // If this exact card is already showing, the browser won't fire a new
    // load event for an unchanged src, so just make sure it's visible.
    if (card.src === new URL(imgSrc, window.location.href).href) {
      if (spinner) spinner.style.display = "none";
      card.style.display = "block";
      return;
    }

    card.style.display = "none";
    if (spinner) spinner.style.display = "flex";

    card.onload = () => {
      if (spinner) spinner.style.display = "none";
      card.style.display = "block";
    };

    card.onerror = () => {
      if (spinner) spinner.style.display = "none";
      console.error(`Failed to load team card image for ${selectedTeam}`);
    };

    card.src = imgSrc;
  }

  season.addEventListener("change", filterTeams);
  generateBtn.addEventListener("click", updateTeamCardImage);

  filterTeams();
  applyCardMode();

  if (preload) {
    season.value = preload.season;
    filterTeams();
    team.value = preload.team;

    if (Array.from(team.options).some(o => o.value === preload.team)) {
      updateTeamCardImage();
    }
  }

  return { updateTeamCardImage, applyCardMode };
}

const PRELOAD_CARDS = {
  0: { season: "2025-2026", position: "F", team: "EDM", player: "Connor McDavid" },
  1: { season: "2025-2026", position: "D", team: "COL", player: "Cale Makar" },
  2: { season: "2025-2026", position: "D", team: "MIN", player: "Quinn Hughes" }
};

const PRELOAD_TEAM_CARDS = {
  0: { season: "2025-2026", team: "Buffalo Sabres" },
  1: { season: "2025-2026", team: "Toronto Maple Leafs" },
  2: { season: "2025-2026", team: "Montreal Canadiens" }
};

// Toggle between the single-card view and the compare-cards view on a
// card page using a pair of buttons marked with data-view="single"/"compare".
// onChange, if given, runs after every switch.
function setupViewToggle(toggleId, singleId, compareId, onChange) {
  const toggle = document.getElementById(toggleId);
  const singleView = document.getElementById(singleId);
  const compareView = document.getElementById(compareId);
  if (!toggle || !singleView || !compareView) return;

  const buttons = Array.from(toggle.querySelectorAll("button"));

  function setView(view) {
    singleView.style.display = view === "single" ? "" : "none";
    compareView.style.display = view === "compare" ? "" : "none";
    buttons.forEach(btn => btn.classList.toggle("active", btn.dataset.view === view));
    if (typeof onChange === "function") onChange();
  }

  buttons.forEach(btn => {
    btn.addEventListener("click", () => setView(btn.dataset.view));
  });

  setView("single");
}

// Schedule GA page: swap the calendar image between the full league view and each team's individual schedule. 
// File names and alt text are derived directly from the selected option, so this needs no page-specific data.
function setupScheduleFilter() {
  const select = document.getElementById("schedule-select");
  const img = document.getElementById("schedule-calendar-img");
  if (!select || !img) return;

  select.addEventListener("change", () => {
    const selected = select.selectedOptions[0];
    if (!selected) return;

    const value = selected.value;
    const isLeague = value === "league";
    const fileTeam = isLeague ? "entire" : value.toLowerCase();

    img.src = `/static/assets/other_projects/schedule_ga/calendars/${fileTeam}_schedule.webp`;
    img.alt = isLeague
      ? "Entire 2026-2027 NHL season schedule generated by the genetic algorithm"
      : `${selected.textContent.trim()} 2026-2027 season schedule generated by the genetic algorithm`;
  });
}

const playerFilters = [];
["0", "1", "2"].forEach(suffix => {
  if (document.getElementById(`filter-form-${suffix}`)) {
    playerFilters.push(setupPlayerFilter(suffix));
  }
});

setupViewToggle("player-view-toggle", "player-single-view", "player-compare-view");
setupViewToggle("team-view-toggle", "team-single-view", "team-compare-view");

const teamFilters = [];
["0", "1", "2"].forEach(suffix => {
  if (document.getElementById(`team-filter-form-${suffix}`)) {
    teamFilters.push(setupTeamFilter(suffix));
  }
});

setupScheduleFilter();

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("theme-toggle");

  function refreshVisibleCards() {
    playerFilters.forEach(filter => {
      filter.applyCardMode();
      filter.updateCardImage();
    });

    teamFilters.forEach(filter => {
      filter.applyCardMode();
      filter.updateTeamCardImage();
    });
  }

  function setTheme(theme) {
    document.documentElement.classList.toggle("dark-mode", theme === "dark");
    localStorage.setItem("theme", theme);

    if (toggleBtn) {
      toggleBtn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    }

    updatePreviewThemeCards();
    renderTweetEmbed(theme);
  }

  const savedTheme = localStorage.getItem("theme");
  setTheme(savedTheme ? savedTheme : "dark");

  refreshVisibleCards();

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const isDark = document.documentElement.classList.contains("dark-mode");
      setTheme(isDark ? "light" : "dark");
      refreshVisibleCards();
    });
  }
});

// ----- Methodologies page: open whatever a link points to (page load, hash change, or in-page link) -----
// Handles a whole section (e.g. #war-model) or a single glossary term (e.g. #term-gsax), which lives inside
// the glossary section and one of its group dropdowns.
function openModelWriteup(hash) {
  if (!hash || hash.length < 2) return;
  let target = null;
  try {
    target = document.querySelector(hash);
  } catch (e) {
    return;
  }
  if (!target) return;

  let opened = false;
  const openDetails = (details) => {
    if (!details.open) {
      details.open = true;
      opened = true;
    }
  };

  const own = target.querySelector(":scope > details.model-details");
  if (own) openDetails(own);
  for (let el = target.parentElement; el; el = el.parentElement) {
    if (el.tagName === "DETAILS") openDetails(el);
  }

  // The browser's own jump happened while the target was hidden, so scroll again now that it's open
  if (opened) target.scrollIntoView({ block: "start" });
}

openModelWriteup(window.location.hash);
window.addEventListener("hashchange", () => openModelWriteup(window.location.hash));
document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (link) openModelWriteup(link.getAttribute("href"));
});

// ----- Glossary search: filter terms, open the groups that have matches, and restore the groups afterward -----
(function setupGlossarySearch() {
  const input = document.getElementById("glossary-search");
  if (!input) return;

  const groups = Array.from(document.querySelectorAll(".glossary-group"));
  const emptyMessage = document.getElementById("glossary-empty");
  let savedOpenStates = null;

  function normalize(text) {
    return text.toLowerCase().replace(/\s+/g, " ");
  }

  input.addEventListener("input", () => {
    const query = normalize(input.value.trim());

    if (!query) {
      groups.forEach((group, i) => {
        group.hidden = false;
        group.querySelectorAll(".glossary-term").forEach(term => { term.hidden = false; });
        if (savedOpenStates) group.open = savedOpenStates[i];
      });
      savedOpenStates = null;
      if (emptyMessage) emptyMessage.hidden = true;
      return;
    }

    if (!savedOpenStates) savedOpenStates = groups.map(group => group.open);

    let anyMatch = false;
    groups.forEach(group => {
      let groupMatches = 0;
      group.querySelectorAll(".glossary-term").forEach(term => {
        const matches = normalize(term.textContent).includes(query);
        term.hidden = !matches;
        if (matches) groupMatches += 1;
      });
      group.hidden = groupMatches === 0;
      group.open = groupMatches > 0;
      if (groupMatches > 0) anyMatch = true;
    });
    if (emptyMessage) emptyMessage.hidden = anyMatch;
  });
})();

// ----- Toggles on the Methodologies page (e.g. AUC / Log Loss / Calibration): one panel visible at a time -----
document.querySelectorAll("[data-tabs]").forEach((group) => {
  const tabs = Array.from(group.querySelectorAll('[role="tab"]'));
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));

  function select(index) {
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.classList.toggle("active", selected);
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (panels[i]) panels[i].hidden = !selected;
    });
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(i));
    tab.addEventListener("keydown", (event) => {
      const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (!step) return;
      const next = (i + step + tabs.length) % tabs.length;
      select(next);
      tabs[next].focus();
      event.preventDefault();
    });
  });
});
