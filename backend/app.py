"""Small, read-only portfolio API plus production React asset serving.

Edit content.json to personalize the portfolio. No database or credentials are
required. The factory makes the application easy to test and run with Gunicorn.
"""
import json
from pathlib import Path

from flask import Flask, abort, jsonify, send_from_directory

BASE_DIR = Path(__file__).resolve().parent


def create_app(content_path=None, dist_path=None):
    app = Flask(__name__, static_folder=None)
    content_file = Path(content_path) if content_path else BASE_DIR / 'content.json'
    frontend_dist = Path(dist_path) if dist_path else BASE_DIR.parent / 'frontend' / 'dist'

    @app.get('/api/health')
    def health():
        return jsonify(status='ok')

    @app.get('/api/portfolio')
    def portfolio():
        # Read on each request so content edits need no server restart.
        try:
            return jsonify(json.loads(content_file.read_text(encoding='utf-8')))
        except (OSError, ValueError):
            app.logger.exception('Unable to load portfolio content')
            return jsonify(error='Portfolio content is temporarily unavailable.'), 503

    @app.get('/')
    def index():
        if not (frontend_dist / 'index.html').is_file():
            return 'Build the frontend with npm run build, or use Vite on port 5173.', 503
        return send_from_directory(frontend_dist, 'index.html')

    @app.get('/<path:filename>')
    def asset(filename):
        # send_from_directory safely confines requests to the build directory.
        # Unknown API routes must remain 404s rather than returning HTML.
        if filename.startswith('api/'):
            abort(404)
        return send_from_directory(frontend_dist, filename)

    return app


app = create_app()
