
// Close a single Content/Profile nav dropdown
function closeNavGroup(group) {
  const panel = document.getElementById(`${group}Dropdown`);
  const toggle = document.querySelector(`.nav-group-toggle--${group}`);

  if (panel) panel.classList.remove("open");
  if (toggle) toggle.setAttribute("aria-expanded", "false");
}

// Toggle the Content or Profile nav dropdown (left/right half of the nav bar)
function toggleNavGroup(group) {
  const panel = document.getElementById(`${group}Dropdown`);
  const toggle = document.querySelector(`.nav-group-toggle--${group}`);
  if (!panel) return;

  const willOpen = !panel.classList.contains("open");

  // only one nav dropdown open at a time
  ["content", "profile"].forEach(closeNavGroup);

  if (willOpen) {
    panel.classList.add("open");
    if (toggle) toggle.setAttribute("aria-expanded", "true");
  }
}

// Close nav dropdowns when resizing to a large screen where the full nav shows
window.addEventListener("resize", () => {
  if (window.innerWidth > 1024) {
    ["content", "profile"].forEach(closeNavGroup);
  }
});

// Close an open nav dropdown when clicking outside of it or its toggle button
document.addEventListener("click", (event) => {
  ["content", "profile"].forEach(group => {
    const panel = document.getElementById(`${group}Dropdown`);
    const toggle = document.querySelector(`.nav-group-toggle--${group}`);
    if (!panel || !panel.classList.contains("open")) return;

    const clickedInsidePanel = panel.contains(event.target);
    const clickedToggle = toggle && toggle.contains(event.target);

    if (!clickedInsidePanel && !clickedToggle) {
      closeNavGroup(group);
    }
  });
});

// Close any open nav dropdown on Escape
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    ["content", "profile"].forEach(closeNavGroup);
  }
});

function getSiteMode() {
  return document.documentElement.classList.contains("dark-mode") ? "dark" : "light";
}

function updatePreviewThemeCards() {
  const isDark = document.documentElement.classList.contains("dark-mode");
  const themedImages = document.querySelectorAll(".preview-theme-card, .cv-image");

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

// Show the skater explanation section when a Forward/Defense is selected,
// and the goalie explanation section when a Goalie is selected. Supports
// pages with more than one position select (e.g. compare cards) by showing
// each section if any of the *visible* selected positions call for it.
// Hidden selects (e.g. the compare view's forms while the single view is
// active) are ignored, otherwise their default value would force a section
// to stay visible regardless of what's actually selected on screen.
// Returns the updateVisibility function so callers can re-run it after
// something else (like switching views) changes which selects are visible.
function setupPositionExplanationToggle() {
  const skaterSection = document.getElementById("skater-explanation");
  const goalieSection = document.getElementById("goalie-explanation");
  if (!skaterSection && !goalieSection) return null;

  const positionSelects = Array.from(document.querySelectorAll('select[name="position"]'));
  if (positionSelects.length === 0) return null;

  function updateVisibility() {
    const visibleSelects = positionSelects.filter(sel => sel.offsetParent !== null);
    const values = visibleSelects.map(sel => sel.value);
    const hasSkater = values.some(v => v === "F" || v === "D");
    const hasGoalie = values.some(v => v === "G");

    if (skaterSection) skaterSection.style.display = hasSkater ? "" : "none";
    if (goalieSection) goalieSection.style.display = hasGoalie ? "" : "none";
  }

  positionSelects.forEach(sel => sel.addEventListener("change", updateVisibility));
  updateVisibility();

  return updateVisibility;
}

// Toggle between the single-card view and the compare-cards view on a
// card page using a pair of buttons marked with data-view="single"/"compare".
// onChange, if given, runs after every switch (used to refresh the
// skater/goalie explanation visibility once hidden selects change).
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

const playerFilters = [];
["0", "1", "2"].forEach(suffix => {
  if (document.getElementById(`filter-form-${suffix}`)) {
    playerFilters.push(setupPlayerFilter(suffix));
  }
});

const refreshExplanationVisibility = setupPositionExplanationToggle();
setupViewToggle("player-view-toggle", "player-single-view", "player-compare-view", refreshExplanationVisibility);
setupViewToggle("team-view-toggle", "team-single-view", "team-compare-view", refreshExplanationVisibility);

const teamFilters = [];
["0", "1", "2"].forEach(suffix => {
  if (document.getElementById(`team-filter-form-${suffix}`)) {
    teamFilters.push(setupTeamFilter(suffix));
  }
});

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