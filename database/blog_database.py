import sqlite3
import os
from contextlib import contextmanager

DATABASE_NAME = 'database/blog_posts.db'
POSTS_FOLDER = 'static/posts'


def create_blog_tables():
    with sqlite3.connect(DATABASE_NAME) as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS blog_posts (
                id INTEGER PRIMARY KEY NOT NULL,
                url TEXT NOT NULL UNIQUE,
                filename TEXT NOT NULL,
                title TEXT NOT NULL,
                date TEXT NOT NULL,
                preview TEXT NOT NULL,
                content TEXT NOT NULL
            )
        ''')


def delete_blog_tables():
    with sqlite3.connect(DATABASE_NAME) as conn:
        conn.execute('DROP TABLE IF EXISTS blog_posts')


@contextmanager
def get_blog_db():
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row 
    try:
        yield conn
    finally:
        conn.commit()
        conn.close()

    
def create_blog_post(id, url, filename, title, date, preview, content):
    with get_blog_db() as conn:
        conn.execute(
            'INSERT INTO blog_posts (id, url, filename, title, date, preview, content) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            (id, url, filename, title, date, preview, content)
        )


def import_blog_posts():

    for filename in os.listdir(POSTS_FOLDER):
        if filename.endswith('.md') or filename.endswith('.txt'):
            filepath = os.path.join(POSTS_FOLDER, filename)
            with open(filepath, 'r', encoding='utf-8') as file:
                lines = file.readlines()

            id = int(filename[:3])                  # First three characters in the filename are the post ID
            url = filename[4:-3].replace('_', '-')  # Everything after ID in the filename is the url
            title = lines[0].strip()                # First line = title
            date = lines[1].strip()                 # Second line = date
            preview = lines[2].strip()              # Third line = preview
            content = ''.join(lines[3:]).strip()    # Everything after = content

            create_blog_post(id, url, filename, title, date, preview, content)
            print(f"Imported: {title}")
