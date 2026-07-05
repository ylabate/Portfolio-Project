from app import db
from app.models.BaseModel import BaseModel


class ProductImage(BaseModel):
    __tablename__ = "product_images"

    product_id = db.Column(db.String(36), db.ForeignKey("products.id"), nullable=False)
    link = db.Column(db.String(512), nullable=False)
    alt_text = db.Column(db.String(255), nullable=True)
    is_thumbnail = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            **super().to_dict(),
            "link": self.link,
            "alt_text": self.alt_text,
            "is_thumbnail": self.is_thumbnail,
        }
