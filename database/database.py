import sqlite3
from contextlib import contextmanager

DATABASE_NAME = 'database/blog.db'

def create_tables():
    with sqlite3.connect(DATABASE_NAME) as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS blog_posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                title TEXT NOT NULL,
                date TEXT NOT NULL,
                summary TEXT NOT NULL,
                content TEXT NOT NULL
            )
        ''')


@contextmanager
def get_db():
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row 
    try:
        yield conn
    finally:
        conn.commit()
        conn.close()

def get_all_posts():
    with get_db() as conn:
        return conn.execute('SELECT * FROM blog_posts').fetchall()
    
def create_post(filename, title, date, summary, content):
    with get_db() as conn:
        conn.execute(
            'INSERT INTO blog_posts (filename, title, date, summary, content) VALUES (?, ?, ?, ?, ?)', 
            (filename, title, date, summary, content)
        )

def delete_post_by_filename(filename):
    with get_db() as conn:
        conn.execute('DELETE FROM blog_posts WHERE filename = ?', (filename,))
        conn.commit()
