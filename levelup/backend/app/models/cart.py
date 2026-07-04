from sqlalchemy.orm import validates
from app import db
from app.models.BaseModel import BaseModel


class Cart(BaseModel):
    __tablename__ = "carts"

    user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    items = db.relationship(
        "CartItem", backref="cart", lazy=True, cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "items": [item.to_dict() for item in self.items],  # type: ignore
        }


class CartItem(BaseModel):
    __tablename__ = "cart_items"

    cart_id = db.Column(db.String(36), db.ForeignKey("carts.id"), nullable=False)
    product_id = db.Column(db.String(36), db.ForeignKey("products.id"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    product = db.relationship("Product", lazy="joined")

    @validates("quantity")
    def validate_quantity(self, key, value):
        if value <= 0:
            raise ValueError("Quantity must be greater than 0")
        return value

    def to_dict(self):
        thumbnail = None
        genres = None
        stock = 0
        if self.product:
            if self.product.images:
                thumbnail = next(
                    (img for img in self.product.images if img.is_thumbnail),
                    self.product.images[0],
                )
            if self.product.genres:
                genres = [{"id": g.id, "name": g.name} for g in self.product.genres]
            from app.models.inventory import InventoryItem

            stock = InventoryItem.query.filter_by(
                product_id=self.product.id, is_used=False
            ).count()

        return {
            "id": self.id,
            "product_id": self.product_id,
            "quantity": self.quantity,
            "product_name": self.product.name if self.product else "Unknown Product",
            "price": float(self.product.price) if self.product else 0.0,
            "product_thumbnail_link": thumbnail.link if thumbnail else None,
            "product_thumbnail_alt": thumbnail.alt_text if thumbnail else None,
            "product_genres": genres if genres else None,
            "stock": stock,
            "steam_appid": (
                self.product.metadata_json.get("steam_appid")
                if (self.product and self.product.metadata_json)
                else None
            ),
        }
