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
                season TEXT NOT NULL,
                player TEXT NOT NULL,
                position TEXT NOT NULL,
                team TEXT NOT NULL,
                evo_rank INTEGER,
                evd_rank INTEGER,
                ppl_rank INTEGER,
                pkl_rank INTEGER,
                oio_rank INTEGER,
                oid_rank INTEGER,
                sht_rank INTEGER,
                scr_rank INTEGER,
                zon_rank INTEGER,
                plm_rank INTEGER,
                tra_rank INTEGER,
                pen_rank INTEGER,
                phy_rank INTEGER,
                fof_rank INTEGER,
                fan_rank INTEGER,
                Role TEXT,
                GP INTEGER,
                TOI REAL,
                Goals INTEGER,
                "First Assists" INTEGER,
                Age INTEGER,
                "Date of Birth" TEXT,
                "Birth Country" TEXT,
                Nationality TEXT,
                "Height (in)" REAL,
                "Weight (lbs)" REAL,
                "Draft Year" INTEGER,
                "Draft Round" INTEGER,
                "Round Pick" INTEGER,
                "Overall Draft Position" INTEGER,
                "Contract Years" INTEGER,
                "Cap Hit" REAL,
                UNIQUE(player, season, team)
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
        for folder in ['forwards', 'defensemen']: #, 'goalies']:
            for filename in os.listdir(f'{csv_folder}/{folder}'):

                if filename == '.DS_Store':
                    continue
                
                df = pd.read_csv(os.path.join(csv_folder, folder, filename))

                # Drop rows where "Team" contains a comma. Currently to avoid players who have played for multipl teams in a season as it causes errors in generating cards
                df = df[~df["Team"].astype(str).str.contains(",")]

                for _, row in df.iterrows():
                    conn.execute('''
                        INSERT OR IGNORE INTO data_card (
                            season, player, position, team, evo_rank, evd_rank, ppl_rank, pkl_rank, 
                            oio_rank, oid_rank, sht_rank, scr_rank, zon_rank, plm_rank, tra_rank, pen_rank, phy_rank, fof_rank,
                            fan_rank, Role, GP, TOI, Goals, "First Assists", Age, "Date of Birth", "Birth Country",
                            Nationality, "Height (in)", "Weight (lbs)", "Draft Year", "Draft Round", "Round Pick",
                            "Overall Draft Position", "Contract Years", "Cap Hit"
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        row.get("Season"), row.get("Player"), row.get("Position"), row.get("Team"),
                        row.get("evo_rank"), row.get("evd_rank"), row.get("ppl_rank"), row.get("pkl_rank"),
                        row.get("oio_rank"), row.get("oid_rank"), row.get("sht_rank"), row.get("scr_rank"),
                        row.get("zon_rank"), row.get("plm_rank"), row.get("tra_rank"), row.get("pen_rank"),
                        row.get("phy_rank"), row.get("fof_rank"), row.get("fan_rank"), row.get("Role"),
                        row.get("GP"), row.get("TOI"), row.get("Goals"), row.get("First Assists"),
                        row.get("Age"), row.get("Date of Birth"), row.get("Birth Country"),
                        row.get("Nationality"), row.get("Height (in)"), row.get("Weight (lbs)"),
                        row.get("Draft Year"), row.get("Draft Round"), row.get("Round Pick"),
                        row.get("Overall Draft Position"), row.get("Contract Years"), row.get("Cap Hit")
                    ))
