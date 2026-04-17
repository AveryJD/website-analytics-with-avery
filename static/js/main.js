// Load the footer
fetch("/static/components/footer.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("footer").innerHTML = data;
  });

// Open the hamburger menu
function openMenu() {
  const menu = document.getElementById("hamburgerNav");
  menu.style.display = menu.style.display === "flex" ? "none" : "flex";
}

// Close hamburger menu when resizing to large screens
window.addEventListener("resize", () => {
  const menu = document.getElementById("hamburgerNav");
  if (window.innerWidth > 768 && menu.style.display === "flex") {
    menu.style.display = "none";
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

    const imgSrc = `/player_card_image?season=${selected.dataset.season}&team=${selected.dataset.team}&position=${selected.dataset.position}&player=${encodeURIComponent(selected.value)}&mode=${mode}`;
    card.src = imgSrc + `&t=${Date.now()}`;

    const cardLink = document.getElementById(`card-link-${suffix}`);
    if (cardLink) cardLink.href = imgSrc;
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

    const imgSrc = `/team_card_image?season=${selectedSeason}&team=${encodeURIComponent(selectedTeam)}&mode=${mode}`;
    card.src = imgSrc + `&t=${Date.now()}`;

    const cardLink = document.getElementById(`team-card-link-${suffix}`);
    if (cardLink) cardLink.href = imgSrc;
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

const playerFilters = [];
["0", "1", "2"].forEach(suffix => {
  if (document.getElementById(`filter-form-${suffix}`)) {
    playerFilters.push(setupPlayerFilter(suffix));
  }
});

const teamFilters = [];
["0", "1", "2"].forEach(suffix => {
  if (document.getElementById(`team-filter-form-${suffix}`)) {
    teamFilters.push(setupTeamFilter(suffix));
  }
});

// Load the navbar last so the toggle can refresh cards after theme changes
fetch("/static/components/nav.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("navbar").innerHTML = data;

    const toggleBtn = document.getElementById("theme-toggle");
    if (!toggleBtn) return;

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
      toggleBtn.textContent = theme === "dark" ? "Light mode" : "Dark mode";
      updatePreviewThemeCards();
    }

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme("dark");
    }

    refreshVisibleCards();

    toggleBtn.addEventListener("click", () => {
      const isDark = document.documentElement.classList.contains("dark-mode");
      setTheme(isDark ? "light" : "dark");
      refreshVisibleCards();
    });
  });