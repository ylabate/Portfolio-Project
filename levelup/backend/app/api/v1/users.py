import re
from flask import request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from . import v1_bp


@v1_bp.route("/users/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        abort(404, description="user not found")
    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email
    }), 200


@v1_bp.route("/users/me", methods=["PUT"])
@jwt_required()
def update_me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json() or {}

    username = data.get("username")
    email = data.get("email")

    if username:
        if User.query.filter_by(username=username).first():
            abort(409, description="username already exists")
        user.username = username

    if email:
        if not re.fullmatch(r"[^@]+@[^@]+\.[^@]+", email):
            abort(400, description="invalid email format")
        if User.query.filter_by(email=email).first():
            abort(409, description="email already exists")
        user.email = email

    db.session.commit()
    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email
    }), 200


@v1_bp.route("/users/me", methods=["DELETE"])
@jwt_required()
def delete_me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        abort(404, description="user not found")
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "user deleted"}), 200
