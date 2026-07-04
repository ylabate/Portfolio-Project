from sqlalchemy.orm import validates
from app import db
from app.models.BaseModel import BaseModel


class Order(BaseModel):
    __tablename__ = "orders"

    user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    total_cents = db.Column(db.Integer, nullable=False)
    payment_status = db.Column(db.String(32), nullable=False, default="pending")
    items = db.relationship(
        "OrderItem", backref="order", lazy=True, cascade="all, delete-orphan"
    )

    @property
    def total(self):
        return self.total_cents / 100.0

    @total.setter
    def total(self, value):
        self.total_cents = int(round(value * 100))

    def to_dict(self):
        return {
            **super().to_dict(),
            "user_id": self.user_id,
            "total_cents": self.total_cents,
            "total": self.total,
            "payment_status": self.payment_status,
            "items": [item.to_dict() for item in self.items],
        }


class OrderItem(BaseModel):
    __tablename__ = "order_items"

    order_id = db.Column(db.String(36), db.ForeignKey("orders.id"), nullable=False)
    product_id = db.Column(db.String(36), db.ForeignKey("products.id"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price_at_purchase_cents = db.Column(db.Integer, nullable=False)
    product = db.relationship("Product", lazy="joined")

    @property
    def price_at_purchase(self):
        return self.price_at_purchase_cents / 100.0

    @price_at_purchase.setter
    def price_at_purchase(self, value):
        self.price_at_purchase_cents = int(round(value * 100))

    @validates("quantity")
    def validate_quantity(self, key, value):
        if value <= 0:
            raise ValueError("Quantity must be greater than 0")
        return value

    def to_dict(self):
        thumbnail = None
        genres = None
        if self.product:
            if self.product.images:
                thumbnail = next(
                    (img for img in self.product.images if img.is_thumbnail),
                    self.product.images[0],
                )
            if self.product.genres:
                genres = [{"id": g.id, "name": g.name} for g in self.product.genres]

        return {
            "id": self.id,
            "product_id": self.product_id,
            "product_name": self.product.name if self.product else "Unknown Product",
            "quantity": self.quantity,
            "price_at_purchase": self.price_at_purchase,
            "product_thumbnail_link": thumbnail.link if thumbnail else None,
            "product_genres": genres,
            "steam_appid": (
                self.product.metadata_json.get("steam_appid")
                if (self.product and self.product.metadata_json)
                else None
            ),
        }
