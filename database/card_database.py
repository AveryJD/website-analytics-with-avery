import sqlite3
import pandas as pd
import os
from contextlib import contextmanager

DATABASE_NAME = 'database/data_card.db'

def create_card_tables():
    with sqlite3.connect(DATABASE_NAME) as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS data_card (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id INTEGER,
                season TEXT NOT NULL,
                player TEXT NOT NULL,
                position TEXT NOT NULL,
                team TEXT NOT NULL,
                UNIQUE(player_id, player, season, team)
            )
        ''')


def delete_card_tables():
    with sqlite3.connect(DATABASE_NAME) as conn:
        conn.execute('DROP TABLE IF EXISTS data_card')


@contextmanager
def get_card_db():
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row 
    try:
        yield conn
    finally:
        conn.commit()
        conn.close()


def import_card_data(csv_folder='data_card'):
    with get_card_db() as conn:
        for folder in ['forwards', 'defensemen', 'goalies']:
            for filename in os.listdir(f'{csv_folder}/{folder}'):

                if filename == '.DS_Store':
                    continue

                df = pd.read_csv(os.path.join(csv_folder, folder, filename))

                for _, row in df.iterrows():
                    conn.execute('''
                        INSERT OR IGNORE INTO data_card (player_id, season, player, position, team)
                        VALUES (?, ?, ?, ?, ?)
                    ''', (
                        row.get("Player ID"),
                        row.get("Season"),
                        row.get("Player"),
                        row.get("Position"),
                        row.get("Team")
                    ))

