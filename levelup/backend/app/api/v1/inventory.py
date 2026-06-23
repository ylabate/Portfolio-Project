from flask import request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.inventory_service import InventoryService
from . import v1_bp

inventory_service = InventoryService()


@v1_bp.route("/inventory", methods=["GET"])
@jwt_required()
def get_inventory():
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)

    try:
        items = inventory_service.get_inventory(user_id, page=page, limit=limit)
        return jsonify([item.to_dict() for item in items]), 200
    except ValueError as error:
        return abort(404, description=str(error))


@v1_bp.route("/inventory/<string:item_id>", methods=["GET"])
@jwt_required()
def get_inventory_item(item_id):
    user_id = get_jwt_identity()

    try:
        item = inventory_service.get_inventory_item(user_id, item_id)
        return jsonify(item.to_dict()), 200
    except ValueError as error:
        return abort(404, description=str(error))


@v1_bp.route("/inventory/<string:item_id>/activate", methods=["GET"])
@jwt_required()
def activate_inventory_item(item_id):
    user_id = get_jwt_identity()

    try:
        stock = inventory_service.activate_inventory_item(user_id, item_id)
        return jsonify({"metadata": stock.to_dict()}), 200
    except ValueError as error:
        return abort(400, description=str(error))
