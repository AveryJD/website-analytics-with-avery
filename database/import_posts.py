import os
from database.database import create_tables, create_post, delete_post_by_filename


POSTS_FOLDER = 'posts'

def import_posts():
    for filename in os.listdir(POSTS_FOLDER):
        if filename.endswith('.md') or filename.endswith('.txt'):
            filepath = os.path.join(POSTS_FOLDER, filename)
            with open(filepath, 'r', encoding='utf-8') as file:
                lines = file.readlines()

            filename = filename.rsplit('.', 1)[0]
            title = lines[0].strip()                # First line = title
            date = lines[1].strip()                 # Second line = date
            summary = lines[2].strip()              # Third line = summary
            content = ''.join(lines[3:]).strip()    # Everything after = content

            delete_post_by_filename(filename)
            create_post(filename, title, date, summary, content)
            print(f"Imported: {title}")

if __name__ == '__main__':
    create_tables()
    import_posts()
