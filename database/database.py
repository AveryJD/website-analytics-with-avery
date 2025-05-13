import sqlite3
import os
from contextlib import contextmanager

DATABASE_NAME = 'database/blog_posts.db'
POSTS_FOLDER = 'static/posts'


def create_tables():
    with sqlite3.connect(DATABASE_NAME) as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS blog_posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                title TEXT NOT NULL,
                date TEXT NOT NULL,
                preview TEXT NOT NULL,
                content TEXT NOT NULL
            )
        ''')

def delete_tables():
    with sqlite3.connect(DATABASE_NAME) as conn:
        conn.execute('DROP TABLE IF EXISTS blog_posts')



@contextmanager
def get_db():
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row 
    try:
        yield conn
    finally:
        conn.commit()
        conn.close()

    
def create_post(filename, title, date, preview, content):
    with get_db() as conn:
        conn.execute(
            'INSERT INTO blog_posts (filename, title, date, preview, content) VALUES (?, ?, ?, ?, ?)', 
            (filename, title, date, preview, content)
        )

def delete_all_posts():
    with get_db() as conn:
        conn.execute('DELETE FROM blog_posts')
        conn.commit()



def import_posts():

    # Reset posts table
    delete_all_posts()

    for filename in os.listdir(POSTS_FOLDER):
        if filename.endswith('.md') or filename.endswith('.txt'):
            filepath = os.path.join(POSTS_FOLDER, filename)
            with open(filepath, 'r', encoding='utf-8') as file:
                lines = file.readlines()

            filename = filename.rsplit('.', 1)[0]
            title = lines[0].strip()                # First line = title
            date = lines[1].strip()                 # Second line = date
            preview = lines[2].strip()              # Third line = preview
            content = ''.join(lines[3:]).strip()    # Everything after = content

            create_post(filename, title, date, preview, content)
            print(f"Imported: {title}")
