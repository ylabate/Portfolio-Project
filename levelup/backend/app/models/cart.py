from sqlalchemy.orm import validates
from app import db
from app.models.BaseModel import BaseModel


class Cart(BaseModel):
    __tablename__ = 'carts'

    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    items = db.relationship('CartItem', backref='cart', lazy=True, cascade="all, delete-orphan")


class CartItem(BaseModel):
    __tablename__ = 'cart_items'

    cart_id = db.Column(db.String(36), db.ForeignKey('carts.id'), nullable=False)
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)

    @validates('quantity')
    def validate_quantity(self, key, value):
        if value <= 0:
            raise ValueError("Quantity must be greater than 0")
        return value
