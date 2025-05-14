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
