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

// Card database and generation
document.addEventListener("DOMContentLoaded", function () {
  const seasonFilter = document.getElementById("season");
  const positionFilter = document.getElementById("position");
  const teamFilter = document.getElementById("team");
  const playerSelect = document.getElementById("player");

  // store all players once
  const allPlayers = Array.from(playerSelect.options).map(opt => ({
      name: opt.value,
      text: opt.textContent,
      season: opt.dataset.season,
      position: opt.dataset.position,
      team: opt.dataset.team
  }));

  function filterPlayers() {
      const season = seasonFilter.value;
      const position = positionFilter.value;
      const team = teamFilter.value;

      // clear current list
      playerSelect.innerHTML = "";

      // filter + repopulate
      const filtered = allPlayers.filter(p =>
          (!season || p.season === season) &&
          (!position || p.position === position) &&
          (!team || p.team === team)
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
              playerSelect.add(opt);
          });
      }
  }

  seasonFilter.addEventListener("change", filterPlayers);
  positionFilter.addEventListener("change", filterPlayers);
  teamFilter.addEventListener("change", filterPlayers);

  filterPlayers(); // run once on load
});