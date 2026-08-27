# The Analytics With Avery Website

### [analyticswithavery.com](https://analyticswithavery.com)

## Description
The Flask app behind my personal website and hockey analytics portfolio. It ties together my NHL player/team card projects and schedule genetic algorithm into one site, alongside a hockey analytics blog, model write-ups, and my professional background.

### Features
* **Hockey Analytics Blog:** Markdown-based blog posts, checked into the repo and imported into SQLite on startup, rendered with syntax-friendly Markdown and lazy-loaded images.
* **NHL Player & Team Cards:** Interactive pages for generating and comparing NHL player and team stat cards on the fly, built on top of my [project-nhl-player-cards](https://github.com/AveryJD/project-nhl-player-cards) and [project-nhl-team-cards](https://github.com/AveryJD/project-nhl-team-cards) packages, with generated card images cached in memory to keep repeat requests instant.
* **NHL Schedule Genetic Algorithm:** A dedicated page showcasing the optimized schedules, fitness curves, and hyperparameter tuning results from my [project-nhl-schedule-genetic-algorithm](https://github.com/AveryJD/project-nhl-schedule-genetic-algorithm) project.
* **Models Explainer:** A page walking through the analytics models behind the player/team cards (xG, RAPM, WAR, Elo, SRS), plus a hockey analytics glossary.
* **Profile Pages:** About Me, Education, Experience, and CV pages, along with contact information and social links.
* **Dark Mode:** Site-wide light/dark theme toggle that persists across visits.
* **Dynamic Sitemap:** Auto-generated XML sitemap covering every static page and blog post, with last-modified dates pulled from git history.


## Acknowledgments
* Player and team card generation, along with their underlying data, come from my [project-nhl-player-cards](https://github.com/AveryJD/project-nhl-player-cards) and [project-nhl-team-cards](https://github.com/AveryJD/project-nhl-team-cards) packages.
* Optimized schedule content comes from my [project-nhl-schedule-genetic-algorithm](https://github.com/AveryJD/project-nhl-schedule-genetic-algorithm) project.


## Disclaimer
This site displays hockey analytics content for educational and analytical purposes and is not affiliated with the NHL.
