import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from werkzeug.exceptions import HTTPException

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()


def create_app():
    load_dotenv()
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///levelup.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-key")

    CORS(app)
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    import app.models as models

    with app.app_context():
        _ = models
        db.create_all()

    from app.api.v1 import v1_bp
    from app.api.v1 import auth  # noqa: F401
    from app.api.v1 import users  # noqa: F401

    app.register_blueprint(v1_bp)

    @app.get("/health")
    def health_check():
        return jsonify({"status": "ok"})

    @app.errorhandler(HTTPException)
    def handle_exception(e):
        return jsonify({
            "message": e.description
        }), e.code

    return app
