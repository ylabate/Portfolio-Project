from functools import wraps
from flask import abort
from flask_jwt_extended import get_jwt


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        claims = get_jwt()
        if not claims.get("is_admin"):
            abort(403, description="admin access required")
        return f(*args, **kwargs)
    return decorated
