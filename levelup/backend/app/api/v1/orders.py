from flask import request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.order_service import OrderService
from . import v1_bp

order_service = OrderService()


@v1_bp.route("/orders", methods=["GET"])
@jwt_required()
def get_orders():
    user_id = get_jwt_identity()
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 10, type=int)

    try:
        orders = order_service.get_orders(user_id, page=page, limit=limit)
        return jsonify([order.to_dict() for order in orders]), 200
    except ValueError as error:
        return abort(404, description=str(error))


@v1_bp.route("/orders/<string:order_id>", methods=["PATCH"])
@jwt_required()
def update_order(order_id):
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    if "payment_status" not in data:
        return abort(400, description="Missing payment_status")

    status = data["payment_status"]
    if status != "cancelled":
        return abort(400, description="Only cancellation is allowed from this endpoint")

    order = order_service.order_repo.get(order_id)
    if not order or order.user_id != user_id:
        return abort(404, description="Order not found")

    if order.payment_status != "pending":
        return abort(400, description="Only pending orders can be cancelled")

    order.payment_status = "cancelled"
    order_service.order_repo.save()

    return jsonify(order.to_dict()), 200
