from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.inventory_service import InventoryService
from . import v1_bp
from flask import abort

inventory_service = InventoryService()


@v1_bp.route("/inventory", methods=["GET"])
@jwt_required()
def get_inventory():
    user_id = get_jwt_identity()

    try:
        return inventory_service.get_inventory(user_id).to_dict(True), 200
    except ValueError as error:
        return abort(404, description=str(error))
