from flask import Flask, render_template, request, send_file, Response, url_for
from datetime import date, datetime
import markdown
import io
import logging
from bs4 import BeautifulSoup

from database.blog_database import get_blog_db, delete_blog_tables, create_blog_tables, import_blog_posts
from database.player_card_database import get_player_card_db, delete_player_card_tables, create_player_card_tables, import_player_card_data
from database.team_card_database import get_team_card_db, delete_team_card_tables, create_team_card_tables, import_team_card_data

from player_card_project.utils.card_functions import make_player_card
from team_card_project.utils.card_functions import make_team_card



logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')


TEAM_NAMES = {
    'ANA': 'Anaheim Ducks',         'BOS': 'Boston Bruins',         'BUF': 'Buffalo Sabres',        'CGY': 'Calgary Flames',
    'CAR': 'Carolina Hurricanes',   'CHI': 'Chicago Blackhawks',    'COL': 'Colorado Avalanche',    'CBJ': 'Columbus Blue Jackets',
    'DAL': 'Dallas Stars',          'DET': 'Detroit Red Wings',     'EDM': 'Edmonton Oilers',       'FLA': 'Florida Panthers',
    'LAK': 'Los Angeles Kings',     'MIN': 'Minnesota Wild',        'MTL': 'Montreal Canadiens',    'NSH': 'Nashville Predators',
    'NJD': 'New Jersey Devils',     'NYI': 'New York Islanders',    'NYR': 'New York Rangers',      'OTT': 'Ottawa Senators',
    'PHI': 'Philadelphia Flyers',   'PIT': 'Pittsburgh Penguins',   'SJS': 'San Jose Sharks',       'SEA': 'Seattle Kraken',
    'STL': 'St. Louis Blues',       'TBL': 'Tampa Bay Lightning',   'TOR': 'Toronto Maple Leafs',   'VAN': 'Vancouver Canucks',
    'UTA': 'Utah Mammoth',          'VGK': 'Vegas Golden Knights',  'WSH': 'Washington Capitals',   'WPG': 'Winnipeg Jets',
    'ARI': 'Arizona Coyotes',       'PHX': 'Phoenix Coyotes',       'ATL': 'Atlanta Thrashers',    
}

POSITION_NAMES = {
    'F': 'Forward',
    'D': 'Defense',
    'G': 'Goalie'
}


app = Flask(__name__, template_folder='templates', static_folder='static')


def optimize_post_images(html):
    soup = BeautifulSoup(html, "html.parser")

    for img in soup.find_all("img"):
        img["loading"] = "lazy"
        img["decoding"] = "async"

        existing_class = img.get("class", [])
        if "blog-image" not in existing_class:
            existing_class.append("blog-image")
        img["class"] = existing_class

    return str(soup)


@app.route('/')
def home():
    with get_blog_db() as conn:
        post = conn.execute('SELECT * FROM blog_posts ORDER BY id DESC LIMIT 1').fetchone()

    most_recent_post = dict(post) if post else None
    return render_template('index.html', post=most_recent_post)


@app.route('/sitemap.xml')
def sitemap():
    pages = [
        'home',
        'profile_about',
        'contact',
        'education',
        'experience',
        'cv',
        'content_about',
        'socials',
        'projects',
        'blog',
        'player_cards',
        'compare_player_cards',
        'team_cards',
        'compare_team_cards'
    ]

    urls = []

    # Static pages
    for page in pages:
        urls.append({
            'loc': url_for(page, _external=True),
            'lastmod': date.today()
        })

    # Blog posts
    with get_blog_db() as conn:
        posts = conn.execute('SELECT id, url, date FROM blog_posts').fetchall()

    for post in posts:
        lastmod = lastmod = datetime.strptime(post['date'], '%B %d, %Y').date().isoformat()
        urls.append({
            'loc': url_for('blog_post', post_url=post['url'], _external=True),
            'lastmod': lastmod
        })

    xml = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

    for url in urls:
        xml.append(f'''
        <url>
          <loc>{url['loc']}</loc>
          <lastmod>{url['lastmod']}</lastmod>
        </url>
        ''')

    xml.append('</urlset>')
    return Response(''.join(xml), mimetype='application/xml')


@app.route('/profile_about')
def profile_about():
    return render_template('profile_about.html')

@app.route('/education')
def education():
    return render_template('profile_education.html')

@app.route('/experience')
def experience():
    return render_template('profile_experience.html')

@app.route('/cv')
def cv():
    return render_template('profile_cv.html')

@app.route('/contact')
def contact():
    return render_template('profile_contact.html')

@app.route('/socials')
def socials():
    return render_template('content_socials.html')

@app.route('/content_about')
def content_about():
    return render_template('content_about.html')

@app.route('/projects')
def projects():
    return render_template('content_projects.html')



@app.route('/blog')
def blog():
    with get_blog_db() as conn:
        posts = conn.execute('SELECT * FROM blog_posts ORDER BY id DESC').fetchall()

    converted_posts = []
    for post in posts:
        converted_post = dict(post)
        converted_posts.append(converted_post)

    return render_template('content_blog.html', posts=converted_posts)

@app.route('/blog/<string:post_url>')
def blog_post(post_url):
    with get_blog_db() as conn:
        post = conn.execute('SELECT * FROM blog_posts WHERE url = ?', (post_url,)).fetchone()

    if not post:
        return 'Post not found', 404

    converted_post = dict(post)

    html_content = markdown.markdown(post['content'], extensions=['tables'])
    converted_post['content'] = optimize_post_images(html_content)

    logging.info(f"========== Blog post opened: {converted_post['title']} ==========")

    return render_template('blog_post.html', post=converted_post)



@app.route('/player_cards', methods=['GET', 'POST'])
def cards():
    with get_player_card_db() as conn:
        players = conn.execute(
            'SELECT player, season, position, team FROM player_card_data'
        ).fetchall()

        player_teams_data = conn.execute(
            'SELECT DISTINCT season, team FROM player_card_data'
        ).fetchall()

        seasons = [row['season'] for row in conn.execute(
            'SELECT DISTINCT season FROM player_card_data ORDER BY season DESC'
        )]
        positions = [row['position'] for row in conn.execute(
            'SELECT DISTINCT position FROM player_card_data'
        )]
        teams = [row['team'] for row in conn.execute(
            'SELECT DISTINCT team FROM player_card_data'
        )]

    selected_card = None
    if request.method == 'POST':
        selected_card = {
            'name': request.form['player'],
            'season': request.form['season'],
            'position': request.form['position'],
            'team': request.form['team'],
            'mode': request.form.get('mode', 'light')
        }

    return render_template(
        'player_cards.html',
        players_list=players,
        player_teams_data=player_teams_data,
        seasons=seasons,
        positions=positions,
        position_names=POSITION_NAMES,
        teams=teams,
        team_names=TEAM_NAMES,
        selected_card=selected_card,
    )

@app.route('/compare_player_cards', methods=['GET', 'POST'])
def compare_cards():
    with get_player_card_db() as conn:
        players = conn.execute(
            'SELECT player, season, position, team FROM player_card_data'
        ).fetchall()

        player_teams_data = conn.execute(
            'SELECT DISTINCT season, team FROM player_card_data'
        ).fetchall()

        seasons = [row['season'] for row in conn.execute(
            'SELECT DISTINCT season FROM player_card_data ORDER BY season DESC'
        )]
        positions = [row['position'] for row in conn.execute(
            'SELECT DISTINCT position FROM player_card_data'
        )]
        teams = [row['team'] for row in conn.execute(
            'SELECT DISTINCT team FROM player_card_data'
        )]

    return render_template(
        'compare_player_cards.html',
        players_list=players,
        player_teams_data=player_teams_data,
        seasons=seasons,
        positions=positions,
        position_names=POSITION_NAMES,
        teams=teams,
        team_names=TEAM_NAMES
    )

@app.route('/player_card_image')
def player_card_image():
    player_name = request.args.get('player')
    season = request.args.get('season')
    position = request.args.get('position')
    mode = request.args.get('mode', 'light')


    img = make_player_card(player_name, season, position, mode=mode, save=False)

    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    return send_file(buf, mimetype='image/png')



@app.route('/team_cards', methods=['GET', 'POST'])
def team_cards():
    with get_team_card_db() as conn:
        team_cards_data = conn.execute(
            'SELECT team, season FROM team_card_data'
        ).fetchall()

        teams = [row['team'] for row in conn.execute(
            'SELECT DISTINCT team FROM team_card_data'
        )]
        seasons = [row['season'] for row in conn.execute(
            'SELECT DISTINCT season FROM team_card_data ORDER BY season DESC'
        )]

    selected_card = None
    if request.method == 'POST':
        selected_card = {
            'team': request.form['team'],
            'season': request.form['season'],
            'mode': request.form.get('mode', 'light')
        }

    return render_template(
        'team_cards.html',
        teams=teams,
        team_cards_data=team_cards_data,
        team_names=TEAM_NAMES,
        seasons=seasons,
        selected_card=selected_card
    )

@app.route('/compare_team_cards', methods=['GET', 'POST'])
def compare_team_cards():
    with get_team_card_db() as conn:
        team_cards_data = conn.execute(
            'SELECT team, season FROM team_card_data'
        ).fetchall()

        teams = [row['team'] for row in conn.execute(
            'SELECT DISTINCT team FROM team_card_data'
        )]
        seasons = [row['season'] for row in conn.execute(
            'SELECT DISTINCT season FROM team_card_data ORDER BY season DESC'
        )]

    return render_template(
        'compare_team_cards.html',
        teams=teams,
        team_cards_data=team_cards_data,
        team_names=TEAM_NAMES,
        seasons=seasons
    )

@app.route('/team_card_image')
def team_card_image():
    team = request.args.get('team')
    season = request.args.get('season')
    mode = request.args.get('mode', 'light')

    img = make_team_card(team, season, mode=mode, save=False)

    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    return send_file(buf, mimetype='image/png')



delete_blog_tables()
create_blog_tables()
import_blog_posts()

delete_player_card_tables()
create_player_card_tables()
import_player_card_data()

delete_team_card_tables()
create_team_card_tables()
import_team_card_data()


if __name__ == '__main__':
    app.run(host='localhost', port=8000, debug=True)
