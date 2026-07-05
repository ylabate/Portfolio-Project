from sqlalchemy.orm import validates
from app import db
from app.models.BaseModel import BaseModel


class Review(BaseModel):
    __tablename__ = "reviews"

    user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_id = db.Column(db.String(36), db.ForeignKey("products.id"), nullable=False)
    text = db.Column(db.Text, nullable=True)
    rating = db.Column(db.Integer, nullable=False)  # 1-10

    @validates("rating")
    def validate_rating(self, key, value):
        if not (1 <= value <= 10):
            raise ValueError("Rating must be between 1 and 10")
        return value

    def to_dict(self):
        return {
            **super().to_dict(),
            "user_id": self.user_id,
            "product_id": self.product_id,
            "text": self.text,
            "rating": self.rating,
        }
