import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from app.models import *

def init_db():
    app = create_app()
    with app.app_context():
        print("Creating database tables...")
        db.create_all()
        print("Database initialized successfully!")

if __name__ == "__main__":
    init_db()
