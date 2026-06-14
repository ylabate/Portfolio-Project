from flask import jsonify, request
from . import v1_bp
from app.services.cart_service import CartService
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import abort

cart_service = CartService()


@v1_bp.route("/cart", methods=["GET"])
@jwt_required()
def get_cart():
    user_id = get_jwt_identity()

    try:
        return cart_service.get_cart(user_id).to_dict(), 200
    except ValueError as error:
       return abort(404, error)

@v1_bp.route("/cart/items", methods=["POST"])
@jwt_required()
def add_cart():
    data = request.get_json()

    if not data:
        abort(400, description="No JSON data provided")

    quantity = data.get("quantity", 1)
    product_id = data.get("product_id")

    if not product_id:
        abort(400, description="Missing product_id")

    user_id = get_jwt_identity()

    try:
        return cart_service.add_to_cart(user_id, product_id, quantity).to_dict(), 201
    except ValueError as error:
       return abort(404, description=error)