// Load the navbar
fetch("/static/components/nav.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("navbar").innerHTML = data;
  });

// Load the footer
fetch("/static/components/footer.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("footer").innerHTML = data;
  });

// Open the hamburger menu
function openMenu() {
  const menu = document.getElementById("hamburgerNav");
  if (menu.style.display === "flex") {
    menu.style.display = "none";
  } else {
    menu.style.display = "flex";
  }
}

// Player card generation
// Load filters
const seasonFilter = document.getElementById("season");
const positionFilter = document.getElementById("position");
const teamFilter = document.getElementById("team");
const playerSelect = document.getElementById("player");
const filterForm = document.getElementById("filter-form");
const generateButton = filterForm.querySelector("button[type='submit']");

// Save all players
const allPlayers = Array.from(playerSelect.options).map(opt => ({
  name: opt.value,
  text: opt.textContent,
  season: opt.dataset.season,
  position: opt.dataset.position,
  team: opt.dataset.team
}));

// Card container
let cardContainer = document.querySelector(".player-card img");
if (!cardContainer) {
    cardContainer = document.createElement("img");
    cardContainer.alt = "Player card";
    document.querySelector(".player-card").appendChild(cardContainer);
}

// Function to filter players based on selected filters
function filterPlayers() {
  const season = seasonFilter.value;
  const position = positionFilter.value;
  const team = teamFilter.value;
  const selectedPlayer = playerSelect.value;

  // Clear current options
  playerSelect.innerHTML = "";

  const filtered = allPlayers.filter(p =>
    (!season || p.season === season) &&
    (!position || p.position === position) &&
    (!team || p.team.includes(team))
  );

  if (filtered.length === 0) {
    const opt = document.createElement("option");
    opt.text = "No players found";
    opt.disabled = true;
    opt.selected = true;
    playerSelect.add(opt);
  } else {
    filtered.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.name;
      opt.text = p.text;
      opt.dataset.season = p.season;
      opt.dataset.position = p.position;
      opt.dataset.team = p.team;
      if (p.name === selectedPlayer) opt.selected = true;
      playerSelect.add(opt);
    });
  }
}

// Event listeners for filter changes
seasonFilter.addEventListener("change", filterPlayers);
positionFilter.addEventListener("change", filterPlayers);
teamFilter.addEventListener("change", filterPlayers);

// Generate card only when button clicked
generateButton.addEventListener("click", (e) => {
  e.preventDefault();

  const selected = playerSelect.selectedOptions[0];
  if (!selected) return;

  const season = selected.dataset.season;
  const position = selected.dataset.position;
  const player = selected.value;
  const team = selected.dataset.team;

  cardContainer.src = `/card_image?season=${season}&position=${position}&player=${player}${team ? `&team=${team}` : ''}`;
});

// Initial filter to populate players based on default filters
filterPlayers();

// Show the first available player's card on page load
if (playerSelect.selectedOptions[0]) {
  const first = playerSelect.selectedOptions[0];
  const season = first.dataset.season;
  const position = first.dataset.position;
  const player = first.value;
  const team = first.dataset.team;

  cardContainer.src = `/card_image?season=${season}&position=${position}&player=${player}${team ? `&team=${team}` : ''}`;
}

