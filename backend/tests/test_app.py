"""HTTP contract tests; run with Python's built-in unittest runner."""
import tempfile
import unittest
from pathlib import Path
from backend.app import create_app


class PortfolioTests(unittest.TestCase):
    def setUp(self):
        self.client = create_app().test_client()

    def test_portfolio_has_required_content(self):
        response = self.client.get('/api/portfolio')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('name', data['profile'])
        self.assertEqual(len({p['id'] for p in data['projects']}), len(data['projects']))
        for project in data['projects']:
            self.assertIn(project['art'], ['orbit', 'tiles', 'wave'])
            for field in ['title', 'category', 'question', 'approach', 'reflection', 'tags']:
                self.assertIn(field, project)

    def test_missing_content_returns_json_error(self):
        with tempfile.TemporaryDirectory() as directory:
            client = create_app(content_path=Path(directory) / 'missing.json').test_client()
            response = client.get('/api/portfolio')
            self.assertEqual(response.status_code, 503)
            self.assertIn('error', response.get_json())

    def test_static_serving_and_path_traversal(self):
        with tempfile.TemporaryDirectory() as directory:
            dist = Path(directory) / 'dist'
            dist.mkdir()
            (dist / 'index.html').write_text('<h1>Portfolio</h1>')
            (Path(directory) / 'secret.txt').write_text('private')
            client = create_app(dist_path=dist).test_client()
            with client.get('/') as response:
                self.assertEqual(response.status_code, 200)
            self.assertEqual(client.get('/../secret.txt').status_code, 404)
            self.assertEqual(client.get('/api/unknown').status_code, 404)

    def test_health(self):
        self.assertEqual(self.client.get('/api/health').get_json(), {'status': 'ok'})


if __name__ == '__main__':
    unittest.main()
