from flask import jsonify
from . import v1_bp


@v1_bp.route("/users", methods=["GET"])
def get_users():
    return jsonify({"users": []})


@v1_bp.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    return jsonify({"id": user_id})
