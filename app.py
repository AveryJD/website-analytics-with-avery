from flask import Flask, render_template, request, send_file, Response, url_for
from datetime import date, datetime
import markdown
import io
import logging
from database.blog_database import get_blog_db, delete_blog_tables, create_blog_tables, import_blog_posts
from database.card_database import get_card_db, delete_card_tables, create_card_tables, import_card_data
from utils.card_functions import make_player_card


logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')


TEAM_NAMES = {
    'ANA': 'Anaheim Ducks',         'ARI': 'Arizona Coyotes',       'BOS': 'Boston Bruins',
    'BUF': 'Buffalo Sabres',        'CGY': 'Calgary Flames',        'CAR': 'Carolina Hurricanes',
    'CHI': 'Chicago Blackhawks',    'COL': 'Colorado Avalanche',    'CBJ': 'Columbus Blue Jackets',
    'DAL': 'Dallas Stars',          'DET': 'Detroit Red Wings',     'EDM': 'Edmonton Oilers',
    'FLA': 'Florida Panthers',      'LAK': 'Los Angeles Kings',     'MIN': 'Minnesota Wild',
    'MTL': 'Montreal Canadiens',    'NSH': 'Nashville Predators',   'NJD': 'New Jersey Devils',
    'NYI': 'New York Islanders',    'NYR': 'New York Rangers',      'OTT': 'Ottawa Senators',
    'PHI': 'Philadelphia Flyers',   'PIT': 'Pittsburgh Penguins',   'SJS': 'San Jose Sharks',
    'SEA': 'Seattle Kraken',        'STL': 'St. Louis Blues',       'TBL': 'Tampa Bay Lightning',
    'TOR': 'Toronto Maple Leafs',   'VAN': 'Vancouver Canucks',     'UTA': 'Utah Mammoth',
    'VGK': 'Vegas Golden Knights',  'WSH': 'Washington Capitals',   'WPG': 'Winnipeg Jets',
    'ATL': 'Atlanta Thrashers',     'PHX': 'Phoenix Coyotes',
}

POSITION_NAMES = {
    'F': 'Forward',
    'D': 'Defense',
    'G': 'Goalie'
}


app = Flask(__name__, template_folder="templates", static_folder="static")


@app.route("/")
def home():
    with get_blog_db() as conn:
        post = conn.execute('SELECT * FROM blog_posts ORDER BY id DESC LIMIT 1').fetchone()

    most_recent_post = dict(post) if post else None
    return render_template("index.html", post=most_recent_post)


@app.route("/sitemap.xml")
def sitemap():
    pages = [
        "home",
        "portfolio_about",
        "contact",
        "education",
        "experience",
        "resume",
        "content_about",
        "socials",
        "projects",
        "blog",
        "cards",
        "compare_cards",
    ]

    urls = []

    # Static pages
    for page in pages:
        urls.append({
            "loc": url_for(page, _external=True),
            "lastmod": date.today()
        })

    # Blog posts
    with get_blog_db() as conn:
        posts = conn.execute("SELECT id, url, date FROM blog_posts").fetchall()

    for post in posts:
        lastmod = lastmod = datetime.strptime(post["date"], "%B %d, %Y").date().isoformat()
        urls.append({
            "loc": url_for("blog_post", post_url=post["url"], _external=True),
            "lastmod": lastmod
        })

    xml = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

    for url in urls:
        xml.append(f"""
        <url>
          <loc>{url["loc"]}</loc>
          <lastmod>{url["lastmod"]}</lastmod>
        </url>
        """)

    xml.append("</urlset>")
    return Response("".join(xml), mimetype="application/xml")


@app.route("/portfolio_about")
def portfolio_about():
    return render_template("portfolio_about.html")

@app.route("/education")
def education():
    return render_template("portfolio_education.html")

@app.route("/experience")
def experience():
    return render_template("portfolio_experience.html")

@app.route("/resume")
def resume():
    return render_template("portfolio_resume.html")

@app.route("/contact")
def contact():
    return render_template("portfolio_contact.html")

@app.route("/socials")
def socials():
    return render_template("content_socials.html")

@app.route("/content_about")
def content_about():
    return render_template("content_about.html")

@app.route("/projects")
def projects():
    return render_template("content_projects.html")


@app.route("/blog")
def blog():
    with get_blog_db() as conn:
        posts = conn.execute('SELECT * FROM blog_posts ORDER BY id DESC').fetchall()

    converted_posts = []
    for post in posts:
        converted_post = dict(post)
        converted_posts.append(converted_post)

    return render_template("content_blog.html", posts=converted_posts)


@app.route("/blog/<string:post_url>")
def blog_post(post_url):
    with get_blog_db() as conn:
        post = conn.execute('SELECT * FROM blog_posts WHERE url = ?', (post_url,)).fetchone()

    if not post:
        return "Post not found", 404

    converted_post = dict(post)
    converted_post['content'] = markdown.markdown(post['content'], extensions=['tables'])

    logging.info(f"========== Blog post opened: {converted_post['title']} ==========")

    return render_template("blog_post.html", post=converted_post)


@app.route("/player_cards", methods=["GET", "POST"])
def cards():
    with get_card_db() as conn:
        players = conn.execute("SELECT player, season, position, team FROM data_card").fetchall()
        seasons = [row["season"] for row in conn.execute("SELECT DISTINCT season FROM data_card ORDER BY season DESC")]
        positions = [row["position"] for row in conn.execute("SELECT DISTINCT position FROM data_card")]
        teams = [row["team"] for row in conn.execute("SELECT DISTINCT team FROM data_card ORDER BY team ASC")]

    selected_card = None
    if request.method == "POST":
        selected_card = {
            "name": request.form["player"],
            "season": request.form["season"],
            "position": request.form["position"],
            "team": request.form["team"],
            "mode": request.form.get("mode", "light")
        }

    return render_template(
        "card_project.html",
        players_list=players,
        seasons=seasons,
        positions=positions,
        position_names=POSITION_NAMES,
        teams=teams,
        team_names=TEAM_NAMES,
        selected_card=selected_card,
    )

@app.route("/compare_player_cards", methods=["GET", "POST"])
def compare_cards():
    with get_card_db() as conn:
        players = conn.execute("SELECT player, season, position, team FROM data_card").fetchall()
        seasons = [row["season"] for row in conn.execute("SELECT DISTINCT season FROM data_card ORDER BY season DESC")]
        positions = [row["position"] for row in conn.execute("SELECT DISTINCT position FROM data_card")]
        teams = [row["team"] for row in conn.execute("SELECT DISTINCT team FROM data_card ORDER BY team ASC")]

    return render_template(
        "compare_cards.html",
        players_list=players,
        seasons=seasons,
        positions=positions,
        position_names=POSITION_NAMES,
        teams=teams,
        team_names=TEAM_NAMES
    )


@app.route("/card_image")
def card_image():
    player_name = request.args.get("player")
    season = request.args.get("season")
    position = request.args.get("position")
    mode = request.args.get("mode", "light")

    if not (player_name and season and position):
        return "Missing parameters", 400

    img = make_player_card(player_name, season, position, save=False, mode=mode)

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return send_file(buf, mimetype="image/png")


delete_blog_tables()
create_blog_tables()
import_blog_posts()

delete_card_tables()
create_card_tables()
import_card_data()

    
if __name__ == '__main__':

    app.run(host="localhost", port=8000, debug=True)
