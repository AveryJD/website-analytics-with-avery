from flask import Flask, render_template
from database.database import get_db, delete_tables, create_tables, import_posts
import markdown


app = Flask(__name__, template_folder="templates", static_folder="static")


@app.route("/")
def home():
    with get_db() as conn:
        post = conn.execute('SELECT * FROM blog_posts ORDER BY id ASC LIMIT 1').fetchone()

    most_recent_post = dict(post) if post else None
    return render_template("index.html", post=most_recent_post)

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
    with get_db() as conn:
        posts = conn.execute('SELECT * FROM blog_posts ORDER BY id ASC').fetchall()

    converted_posts = []
    for post in posts:
        converted_post = dict(post)
        converted_posts.append(converted_post)

    return render_template("content_blog.html", posts=converted_posts)

@app.route("/blog/<int:post_id>")
def blog_post(post_id):
    with get_db() as conn:
        post = conn.execute('SELECT * FROM blog_posts WHERE id = ?', (post_id,)).fetchone()

    converted_post = dict(post)
    converted_post['content'] = markdown.markdown(post['content'], extensions=['tables'])

    return render_template("blog_post.html", post=converted_post)


delete_tables()
create_tables()
import_posts()


if __name__ == '__main__':
    app.run(host="localhost", port=8000, debug=True)
