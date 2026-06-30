# app/models/password_reset.py
from datetime import datetime, timedelta
import uuid
from app import db


class PasswordReset(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(36), nullable=False, index=True)
    token = db.Column(db.String(36), nullable=False, unique=True,
                      default=lambda: str(uuid.uuid4()))
    expires_at = db.Column(
        db.DateTime,
        default=lambda: datetime.utcnow() + timedelta(minutes=30)
    )
    used = db.Column(db.Boolean, default=False)
