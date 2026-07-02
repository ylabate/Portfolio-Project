from flask import request, jsonify
from . import v1_bp
from app.services.cart_service import CartService
from app.services.payment_service import PaymentService
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
        return abort(404, description=str(error))


@v1_bp.route("/cart/checkout", methods=["POST"])
@jwt_required()
def checkout():
    payment_service = PaymentService()
    user_id = get_jwt_identity()

    try:
        session = payment_service.prepare_checkout(user_id)

        return jsonify({
            "checkout_url": session.url,
            "session_id": session.id
        }), 200
    except ValueError as error:
        abort(400, description=str(error))


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
        return cart_service.add_to_cart(
            user_id,
            product_id,
            quantity
        ).to_dict(), 201
    except ValueError as error:
        return abort(400, description=str(error))


@v1_bp.route("/cart/items/<string:product_id>", methods=["DELETE"])
@jwt_required()
def remove_from_cart(product_id):
    user_id = get_jwt_identity()

    quantity_str = request.args.get('quantity')
    quantity = (
        int(quantity_str)
        if quantity_str and quantity_str.isdigit()
        else None
    )

    cart = cart_service.remove_from_cart(user_id, product_id, quantity)
    if cart is None:
        abort(404, description="Product not found in cart")

    return cart.to_dict(), 200
