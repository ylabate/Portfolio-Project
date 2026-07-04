import os
import re
from datetime import datetime

from flask import request, jsonify, abort
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
)
from flask_mail import Message
from app import db, mail
from app.models.user import User
from app.models.token_blocklist import TokenBlocklist
from app.models.password_reset import PasswordReset
from . import v1_bp


@v1_bp.route("/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        abort(400, description="username, email and password are required")

    if User.query.filter_by(username=username).first():
        abort(409, description="username already exists")

    if not re.fullmatch(r"[^@]+@[^@]+\.[^@]+", email):
        abort(400, description="invalid email format")

    if User.query.filter_by(email=email).first():
        abort(409, description="email already exists")

    try:
        user = User(username=username, email=email)
        user.password = password
        db.session.add(user)
        db.session.commit()
    except ValueError as exc:
        abort(400, description=str(exc))

    access_token = create_access_token(
        identity=str(user.id), additional_claims={"is_admin": user.is_admin}
    )
    refresh_token = create_refresh_token(identity=str(user.id))

    return (
        jsonify(
            {
                "message": "user created successfully",
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },
            }
        ),
        201,
    )


@v1_bp.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        abort(400, description="email and password are required")

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        abort(401, description="invalid credentials")

    access_token = create_access_token(
        identity=str(user.id), additional_claims={"is_admin": user.is_admin}
    )
    refresh_token = create_refresh_token(identity=str(user.id))

    return (
        jsonify(
            {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user": {
                    "message": "log with succes",
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },
            }
        ),
        200,
    )


@v1_bp.route("/auth/logout", methods=["DELETE"])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    db.session.add(TokenBlocklist(jti=jti))
    db.session.commit()
    return jsonify({"message": "logged out"}), 200


@v1_bp.route("/auth/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    user = User.query.get(identity)
    new_access_token = create_access_token(
        identity=identity,
        additional_claims={"is_admin": user.is_admin if user else False},
    )
    return jsonify({"access_token": new_access_token}), 200


@v1_bp.route("/auth/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()

    if not email:
        abort(400, description="email is required")

    user = User.query.filter_by(email=email).first()

    if not user:
        return (
            jsonify(
                {"message": "if this email exists, a reset link has been sent"}
            ),
            200,
        )

    reset = PasswordReset(user_id=user.id)
    db.session.add(reset)
    db.session.commit()

    reset_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/reset-password?token={reset.token}"
    message = Message(
        subject="Reset your password",
        recipients=[user.email],
        html=(
            f"<p>Click <a href='{reset_url}'>here</a> to reset your "
            "password. This link expires in 30 minutes.</p>"
        ),
    )
    try:
        mail.send(message)
    except Exception as exc:
        print(f"[MAIL ERROR] {exc}", flush=True)
        abort(500, description="unable to send reset email")

    return (
        jsonify(
            {"message": "if this email exists, a reset link has been sent"}
        ),
        200,
    )


@v1_bp.route("/auth/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json() or {}
    token = data.get("token")
    new_password = data.get("password")

    if not token or not new_password:
        abort(400, description="token and password are required")

    reset = PasswordReset.query.filter_by(token=token, used=False).first()

    if not reset:
        abort(400, description="invalid or expired token")

    if reset.expires_at < datetime.utcnow():
        abort(400, description="invalid or expired token")

    user = User.query.get(reset.user_id)
    if not user:
        abort(400, description="invalid or expired token")

    try:
        user.password = new_password
    except ValueError as exc:
        abort(400, description=str(exc))

    reset.used = True
    db.session.commit()

    return jsonify({"message": "password reset successfully"}), 200
