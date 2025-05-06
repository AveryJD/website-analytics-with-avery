from flask import Flask, render_template
from database.database import get_db, get_all_posts, create_tables
from import_posts import import_posts
import markdown


app = Flask(__name__, template_folder="templates", static_folder="static")


try:
    create_tables()
    if not get_all_posts():
        print("Blog DB empty — importing posts...")
        import_posts()
except Exception as e:
    print(f"Error checking/initializing database: {e}")


@app.route("/")
def home():
    return render_template("index.html")

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
        posts = conn.execute('SELECT * FROM blog_posts ORDER BY id DESC').fetchall()

    converted_posts = []
    for post in posts:
        converted_post = dict(post)
        converted_posts.append(converted_post)

    return render_template("content_blog.html", posts=converted_posts)

@app.route("/blog/<int:post_id>")
def blog_post(post_id):
    with get_db() as conn:
        post = conn.execute('SELECT * FROM blog_posts WHERE id = ?', (post_id,)).fetchone()

    if post is None:
        return "Post not found", 404

    converted_post = dict(post)
    converted_post['content'] = markdown.markdown(post['content'])

    return render_template("blog_post.html", post=converted_post)


if __name__ == '__main__':
    app.run(host="localhost", port=8000, debug=True)
