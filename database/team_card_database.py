import sqlite3
import pandas as pd
import os
from contextlib import contextmanager

DATABASE_NAME = 'database/team_card_data.db'


def create_team_card_tables():
    with sqlite3.connect(DATABASE_NAME) as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS team_card_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                team_id INTEGER,
                season TEXT NOT NULL,
                team TEXT NOT NULL,
                UNIQUE(team_id, season, team)
            )
        ''')


def delete_team_card_tables():
    with sqlite3.connect(DATABASE_NAME) as conn:
        conn.execute('DROP TABLE IF EXISTS team_card_data')


@contextmanager
def get_team_card_db():
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.commit()
        conn.close()


def import_team_card_data(csv_folder='data/team_card_data/card_data'):
    with get_team_card_db() as conn:
        for filename in os.listdir(csv_folder):
            if filename == '.DS_Store':
                continue

            file_path = os.path.join(csv_folder, filename)
            df = pd.read_csv(file_path)

            for _, row in df.iterrows():
                conn.execute('''
                    INSERT OR IGNORE INTO team_card_data (team_id, season, team)
                    VALUES (?, ?, ?)
                ''', (
                    row.get('Team ID'),
                    row.get('Season'),
                    row.get('Team')
                ))