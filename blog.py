import os
from datetime import datetime

import markdown
from bs4 import BeautifulSoup

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
POSTS_FOLDER = os.path.join(BASE_DIR, 'static', 'posts')

SITE_URL = 'https://analyticswithavery.com'
DEFAULT_SHARE_IMAGE = f'{SITE_URL}/static/assets/analytics_with_avery_logos/analyticswithavery_logo.png'

DATE_FORMAT = '%B %d, %Y'
UPDATED_PREFIX = 'Updated:'


def optimize_post_images(soup):
    for img in soup.find_all('img'):
        img['loading'] = 'lazy'
        img['decoding'] = 'async'

        existing_class = img.get('class', [])
        if 'blog-image' not in existing_class:
            existing_class.append('blog-image')
        img['class'] = existing_class


def parse_date(date_str):
    return datetime.strptime(date_str, DATE_FORMAT).date().isoformat()


def share_image_url(soup):
    """Absolute URL of the first image in a post, or the site logo if it has none."""
    first_image = soup.find('img', src=True)
    if first_image is None:
        return DEFAULT_SHARE_IMAGE

    src = first_image['src']
    if src.startswith(('http://', 'https://')):
        return src
    return SITE_URL + '/' + src.lstrip('/')


def load_post(filename):
    """Parse a post file. Format:

        line 1: title
        line 2: date (e.g. September 29, 2026)
        line 3: preview
        line 4 (optional): 'Updated: <date>' (shown to search engines as dateModified)
        rest:   markdown content
    """
    with open(os.path.join(POSTS_FOLDER, filename), 'r', encoding='utf-8') as file:
        lines = file.readlines()

    try:
        post_id = int(filename[:3])                 # First three characters in the filename are the post ID
        url = filename[4:-3].replace('_', '-')      # Everything after ID in the filename is the url
        title = lines[0].strip()
        date = lines[1].strip()
        preview = lines[2].strip()

        content_start = 3
        if len(lines) > 3 and lines[3].startswith(UPDATED_PREFIX):
            modified = parse_date(lines[3][len(UPDATED_PREFIX):].strip())
            content_start = 4
        else:
            modified = None

        iso_date = parse_date(date)
    except (ValueError, IndexError) as e:
        raise ValueError(f'Could not parse blog post {filename}: {e}') from e

    soup = BeautifulSoup(
        markdown.markdown(''.join(lines[content_start:]).strip(), extensions=['tables']),
        'html.parser',
    )
    optimize_post_images(soup)

    return {
        'id': post_id,
        'url': url,
        'filename': filename,
        'title': title,
        'date': date,
        'iso_date': iso_date,
        'modified_iso_date': modified or iso_date,
        'preview': preview,
        'content': str(soup),
        'share_image': share_image_url(soup),
    }


def load_posts():
    filenames = sorted(f for f in os.listdir(POSTS_FOLDER) if f.endswith('.md'))
    posts = [load_post(filename) for filename in filenames]
    return sorted(posts, key=lambda post: post['id'], reverse=True)


# Posts are read and rendered once at startup; they only change when the app is redeployed.
POSTS = load_posts()
POSTS_BY_URL = {post['url']: post for post in POSTS}
