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
    user_id = get_jwt_identity()

    try:
        return cart_service.get_cart(user_id).to_dict(), 200
    except ValueError as error:
       return abort(404, error)