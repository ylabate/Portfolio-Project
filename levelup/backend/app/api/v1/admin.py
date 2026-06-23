from flask import request, abort
from flask_jwt_extended import jwt_required
from app import db
from app.models.user import User
from app.utils.decorators import admin_required
from . import v1_bp


@v1_bp.route("/admin/users", methods=["GET"])
@jwt_required()
@admin_required
def get_all_users():
    users = User.query.all()
    return [user.to_dict() for user in users], 200


@v1_bp.route("/admin/users/<uuid:user_id>", methods=["GET"])
@jwt_required()
@admin_required
def get_user(user_id):
    user = User.query.get(str(user_id))
    if not user:
        abort(404, description="user not found")
    return user.to_dict(), 200


@v1_bp.route("/admin/users/<uuid:user_id>", methods=["PUT"])
@jwt_required()
@admin_required
def update_user(user_id):
    user = User.query.get(str(user_id))
    if not user:
        abort(404, description="user not found")

    data = request.get_json() or {}

    if "username" in data:
        if User.query.filter_by(username=data["username"]).first():
            abort(409, description="username already exists")
        user.username = data["username"]

    if "email" in data:
        if User.query.filter_by(email=data["email"]).first():
            abort(409, description="email already exists")
        user.email = data["email"]

    if "is_admin" in data:
        user.is_admin = data["is_admin"]

    if "is_active" in data:
        user.is_active = data["is_active"]

    db.session.commit()
    return user.to_dict(), 200


@v1_bp.route("/admin/users/<uuid:user_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_user(user_id):
    user = User.query.get(str(user_id))
    if not user:
        abort(404, description="user not found")
    db.session.delete(user)
    db.session.commit()
    return {"message": "user deleted"}, 200


@v1_bp.route("/admin/stats", methods=["GET"])
@jwt_required()
@admin_required
def get_stats():
    return {
        "total_users": User.query.count(),
        "total_admins": User.query.filter_by(is_admin=True).count(),
        "total_active": User.query.filter_by(is_active=True).count(),
        "total_inactive:": User.query.filter_by(is_active=False).count()
    }, 200
