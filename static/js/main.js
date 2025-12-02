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

// Close hamburger menu when resizing to large screens
window.addEventListener("resize", () => {
  const menu = document.getElementById("hamburgerNav");
  if (window.innerWidth > 768 && menu.style.display === "flex") {
    menu.style.display = "none";
  }
});

// Setup player filter and card generation for each player
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
  let firstInit = true;

  const allPlayers = Array.from(player.options).map(opt => ({
    name: opt.value,
    text: opt.textContent,
    season: opt.dataset.season,
    team: opt.dataset.team,
    position: opt.dataset.position
  }));

  function filterPlayers() {
    const s = season.value;
    const t = team.value;
    const p = position.value;
  
    const previousValue = player.value; // remember selected player
    player.innerHTML = "";
  
    const filtered = allPlayers.filter(pl =>
      (!s || pl.season === s) &&
      (!t || pl.team.includes(t)) &&
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
  
      // Restore previous selection if it still exists
      if (previousValue && Array.from(player.options).some(o => o.value === previousValue)) {
        player.value = previousValue;
      }
    }
  }
  
  function updateCardImage() {
    const selected = player.selectedOptions[0];
    if (!selected || selected.disabled) return;
  
    // Store selected value for later
    player.dataset.selectedValue = selected.value;
  
    // Hide the card and show the spinner
    card.style.display = "none";
    if (spinner) {
      spinner.style.display = "flex";
    }

    // Set up handlers for when the image finishes loading
    card.onload = () => {
      // Hide the spinner and show the new card
      if (spinner) {
        spinner.style.display = "none";
      }
      card.style.display = "block";
    };

    card.onerror = () => {
      // Handle case where image fails to load (optional)
      if (spinner) {
        spinner.style.display = "none";
      }
      console.error(`Failed to load card image for ${selected.value}`);
    };
  
    // Change the image source, which triggers the fetch
    const imgSrc = `/card_image?season=${selected.dataset.season}&team=${selected.dataset.team}&position=${selected.dataset.position}&player=${selected.value}`;
    card.src = imgSrc + "&t=" + Date.now();
  
    const cardLink = document.getElementById(`card-link-${suffix}`);
    if (cardLink) cardLink.href = imgSrc;
  }

  // Event listeners
  season.addEventListener("change", filterPlayers);
  position.addEventListener("change", filterPlayers);
  team.addEventListener("change", filterPlayers);
  generateBtn.addEventListener("click", updateCardImage);

  // Initialize filters
  filterPlayers();

  // Apply preload if defined
  if (preload) {
    season.value = preload.season;
    position.value = preload.position;
    team.value = preload.team;
    filterPlayers();

    const preloadOption = Array.from(player.options).find(
      opt => opt.value === preload.player &&
             opt.dataset.season === preload.season &&
             opt.dataset.position === preload.position &&
             opt.dataset.team.includes(preload.team)
    );

    if (preloadOption) {
      player.value = preload.player;
      // Show first card immediately
      updateCardImage();
      firstInit = false;
    }
  }
}

const PRELOAD_CARDS = {
  0: { season: "2024-2025", position: "F", team: "EDM", player: "Connor McDavid" },
  1: { season: "2024-2025", position: "D", team: "COL", player: "Cale Makar" },
  2: { season: "2024-2025", position: "D", team: "VAN", player: "Quinn Hughes" }
};

// Initialize filters for all forms that exist
["0", "1", "2"].forEach(suffix => {
  if (document.getElementById(`filter-form-${suffix}`)) {
    setupPlayerFilter(suffix);
  }
});
