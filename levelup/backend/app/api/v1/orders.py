from flask import request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.order_service import OrderService
from . import v1_bp

order_service = OrderService()


@v1_bp.route('/orders', methods=['GET'])
@jwt_required()
def get_orders():
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)

    try:
        orders = order_service.get_orders(user_id, page=page, limit=limit)
        return jsonify([order.to_dict() for order in orders]), 200
    except ValueError as error:
        return abort(404, description=str(error))
