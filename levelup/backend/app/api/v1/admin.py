import re

from flask import request, abort, jsonify
from flask_jwt_extended import jwt_required
from app import db
import secrets
from app.models.user import User
from app.utils.decorators import admin_required
from app.models.inventory import InventoryItem
from app.models.product import Product
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
        existing_user = User.query.filter_by(username=data["username"]).first()
        if existing_user and existing_user.id != user.id:
            abort(409, description="username already exists")
        user.username = data["username"]

    if "email" in data:
        email = data["email"].strip().lower()
        if not re.fullmatch(r"[^@]+@[^@]+\.[^@]+", email):
            abort(400, description="invalid email format")

        existing_user = User.query.filter_by(email=email).first()
        if existing_user and existing_user.id != user.id:
            abort(409, description="email already exists")
        user.email = email

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
        "total_inactive:": User.query.filter_by(is_active=False).count(),
    }, 200


@v1_bp.route(
    "/admin/products/<uuid:product_id>/activation-keys",
    methods=["POST"],
)
@jwt_required()
@admin_required
def add_activation_key_to_product(product_id):
    product = Product.query.get(str(product_id))
    if not product:
        abort(404, description="product not found")

    data = request.get_json() or {}
    quantity = data.get("quantity", 1)
    activation_code = data.get("activation_code")

    print(f"[ADMIN_ACTIVATION] product_id={product_id} quantity={quantity} activation_code={activation_code}")

    try:
        quantity = int(quantity)
    except (TypeError, ValueError):
        abort(400, description="quantity must be a valid integer")

    if quantity < 1:
        abort(400, description="quantity must be at least 1")

    if activation_code and quantity > 1:
        abort(
            400,
            description="activation_code can only be used when quantity is 1",
        )

    activation_items = []

    for index in range(quantity):
        if activation_code and index == 0:
            candidate_code = activation_code
            if InventoryItem.query.filter_by(
                activation_code=candidate_code
            ).first():
                abort(409, description="activation_code already exists")
        else:
            for _ in range(20):
                candidate_code = secrets.token_urlsafe(16)
                if not InventoryItem.query.filter_by(
                    activation_code=candidate_code
                ).first():
                    break
            else:
                abort(500, description="unable to generate unique activation code")

        activation_item = InventoryItem(
            product_id=product.id,
            activation_code=candidate_code,
            is_used=False,
        )
        db.session.add(activation_item)
        activation_items.append(activation_item)

    db.session.commit()

    return (
        jsonify(
            {"activation_items": [item.to_dict() for item in activation_items]}
        ),
        201,
    )
