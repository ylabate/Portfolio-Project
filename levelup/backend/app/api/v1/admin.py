from flask import request, abort, jsonify
from flask_jwt_extended import jwt_required
import secrets
from app import db
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


@v1_bp.route("/admin/products/activation-keys", methods=["POST"])
@jwt_required()
@admin_required
def create_placeholder_product_with_key():
    data = request.get_json() or {}

    product_name = data.get("product_name")
    if not product_name:
        abort(400, description="product_name is required")

    activation_code = data.get("activation_code") or secrets.token_urlsafe(16)
    if InventoryItem.query.filter_by(activation_code=activation_code).first():
        abort(409, description="activation_code already exists")

    product = Product(
        name=product_name,
        description=data.get("description"),
        price=data.get("price", 0),
        type=data.get("type", "key"),
        is_active=data.get("is_active", False),
        metadata_json=data.get("metadata_json")
    )
    db.session.add(product)
    db.session.flush()

    activation_item = InventoryItem(
        product_id=product.id,
        activation_code=activation_code,
        is_used=False
    )
    db.session.add(activation_item)
    db.session.commit()

    return jsonify({
        "product": product.to_dict(),
        "activation_item": activation_item.to_dict(),
    }), 201


@v1_bp.route(
    "/admin/products/<uuid:product_id>/activation-keys",
    methods=["POST"]
)
@jwt_required()
@admin_required
def add_activation_key_to_product(product_id):
    product = Product.query.get(str(product_id))
    if not product:
        abort(404, description="product not found")

    data = request.get_json() or {}
    activation_code = data.get("activation_code")
    if not activation_code:
        abort(400, description="activation_code is required")

    if InventoryItem.query.filter_by(activation_code=activation_code).first():
        abort(409, description="activation_code already exists")

    activation_item = InventoryItem(
        product_id=product.id,
        activation_code=activation_code,
        is_used=False
    )
    db.session.add(activation_item)
    db.session.commit()

    return jsonify({"activation_item": activation_item.to_dict()}), 201
