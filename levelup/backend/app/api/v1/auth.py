import re

from flask import request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity
)
from app import db
from app.models.user import User
from . import v1_bp


@v1_bp.route("/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify(
            {"error": "username, email and password are required"}
        ), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "username already exists"}), 409

    if not re.fullmatch(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"error": "invalid email format"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "email already exists"}), 409

    try:
        user = User(username=username, email=email)
        user.password = password
        db.session.add(user)
        db.session.commit()
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        "message": "user created successfully",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }), 201


@v1_bp.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "invalid credentials"}), 401

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "message": "log with succes",
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }), 200


@v1_bp.route("/auth/logout", methods=["DELETE"])
@jwt_required()
def logout():
    return jsonify({"message": "logged out"}), 200


@v1_bp.route("/auth/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    new_access_token = create_access_token(identity=identity)
    return jsonify({"access_token": new_access_token}), 200
