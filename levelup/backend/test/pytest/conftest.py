import sys
import os
import pytest

# Ensure the backend root is in the path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
# Ensure the test directory is in the path so we can import factories
sys.path.append(os.path.dirname(__file__))

from factories.product_factory import ProductFactory
from factories.user_factory import UserFactory
from app import create_app, db


@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
    })

    with app.app_context():
        db.create_all()
        yield app

        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def db_session(app):
    with app.app_context():
        ProductFactory._meta.sqlalchemy_session = db.session
        UserFactory._meta.sqlalchemy_session = db.session
        yield db.session
