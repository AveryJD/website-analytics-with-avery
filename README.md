# The Analytics With Avery Website

### [analyticswithavery.com](https://analyticswithavery.com)

## Description
The Flask app behind my personal website and hockey analytics portfolio. It ties together my NHL stats collection and player/team card projects and my schedule genetic algorithm into one site, alongside a hockey analytics blog, methodology write-ups, and my professional background.

### Features
* **Hockey Analytics Blog:** Markdown-based blog posts, checked into the repo (in `content/posts/`) and rendered once into memory at startup, with lazy-loaded WebP images and per-post share images.
* **NHL Player & Team Cards:** Interactive pages for generating and comparing NHL player and team stat cards on the fly, built on top of my [project-nhl-player-cards](https://github.com/AveryJD/project-nhl-player-cards) and [project-nhl-team-cards](https://github.com/AveryJD/project-nhl-team-cards) packages, with generated card images cached in memory to keep repeat requests instant.
* **NHL Schedule Genetic Algorithm:** A dedicated page showcasing the optimized schedules, fitness curves, and hyperparameter tuning results from my [project-nhl-schedule-genetic-algorithm](https://github.com/AveryJD/project-nhl-schedule-genetic-algorithm) project.
* **Methodologies:** A page walking through the methodologies behind the player/team cards (xG, RAPM, WAR, Elo, SRS), built from my [project-nhl-stats-collection](https://github.com/AveryJD/project-nhl-stats-collection) models, plus a hockey analytics glossary.
* **Profile Pages:** About Me, Education (degree, honours thesis, courses, and awards), Experience (hockey analytics, research, and technical roles), and a CV page with a timeline and downloadable light and dark versions, plus an About Analytics With Avery page, contact information, and social links.
* **Dark Mode:** Site-wide light/dark theme toggle that persists across visits.


## Setup
```bash
pip install -r requirements.txt
flask --app app init-db
gunicorn app:app
```
On Render, use `pip install -r requirements.txt && flask --app app init-db` as the build command.

To mark a blog post as updated, add an `Updated: Month DD, YYYY` line directly under its preview line.

## Acknowledgments
* NHL data collection and modeling (the xG, RAPM, WAR, Elo, and SRS models behind the methodologies page) come from my [project-nhl-stats-collection](https://github.com/AveryJD/project-nhl-stats-collection) project.
* Player and team card generation, along with their underlying data, come from my [project-nhl-player-cards](https://github.com/AveryJD/project-nhl-player-cards) and [project-nhl-team-cards](https://github.com/AveryJD/project-nhl-team-cards) packages.
* Optimized schedule content comes from my [project-nhl-schedule-genetic-algorithm](https://github.com/AveryJD/project-nhl-schedule-genetic-algorithm) project.


## Disclaimer
This site displays hockey analytics content for educational and analytical purposes and is not affiliated with the NHL.
