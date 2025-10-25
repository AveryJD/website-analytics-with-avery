// Load the navbar
fetch("/static/components/nav.html")
  .then(res => res.text())
  .then(data => { document.getElementById("navbar").innerHTML = data; });

// Load the footer
fetch("/static/components/footer.html")
  .then(res => res.text())
  .then(data => { document.getElementById("footer").innerHTML = data; });

// Open the hamburger menu
function openMenu() {
  const menu = document.getElementById("hamburgerNav");
  menu.style.display = (menu.style.display === "flex") ? "none" : "flex";
}

// Setup player filter and card generation for each player
function setupPlayerFilter(suffix) {
  const season = document.getElementById(`season-${suffix}`);
  const position = document.getElementById(`position-${suffix}`);
  const team = document.getElementById(`team-${suffix}`);
  const player = document.getElementById(`player-${suffix}`);
  const form = document.getElementById(`filter-form-${suffix}`);
  const card = document.getElementById(`card-img-${suffix}`);

  const allPlayers = Array.from(player.options).map(opt => ({
    name: opt.value,
    text: opt.textContent,
    season: opt.dataset.season,
    position: opt.dataset.position,
    team: opt.dataset.team
  }));

  function filterPlayers() {
    const s = season.value;
    const p = position.value;
    const t = team.value;

    player.innerHTML = "";
    const filtered = allPlayers.filter(pl =>
      (!s || pl.season === s) &&
      (!p || pl.position === p) &&
      (!t || pl.team.includes(t))
    );

    filtered.forEach(pl => {
      const opt = document.createElement("option");
      opt.value = pl.name;
      opt.text = pl.text;
      opt.dataset.season = pl.season;
      opt.dataset.position = pl.position;
      opt.dataset.team = pl.team;
      player.add(opt);
    });

    if (filtered.length > 0) {
      player.value = filtered[0].name;
      updateCardImage();
    } else {
      card.src = "";
    }
  }

  function updateCardImage() {
    const selected = player.selectedOptions[0];
    if (!selected) return;
    const imgSrc = `/card_image?season=${selected.dataset.season}&position=${selected.dataset.position}&player=${selected.value}${selected.dataset.team ? `&team=${selected.dataset.team}` : ''}`;
    card.src = imgSrc;
  }

  season.addEventListener("change", filterPlayers);
  position.addEventListener("change", filterPlayers);
  team.addEventListener("change", filterPlayers);
  player.addEventListener("change", updateCardImage);

  filterPlayers();
}

if (document.getElementById("filter-form-0")) {
  setupPlayerFilter("0");
}

if (document.getElementById("filter-form-1")) {
  setupPlayerFilter("1");
}

if (document.getElementById("filter-form-2")) {
  setupPlayerFilter("2");
}

