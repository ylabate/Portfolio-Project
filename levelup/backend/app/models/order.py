from sqlalchemy.orm import validates
from app import db
from app.models.BaseModel import BaseModel


class Order(BaseModel):
    __tablename__ = 'orders'

    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    total_cents = db.Column(db.Integer, nullable=False)
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade="all, delete-orphan")

    @property
    def total(self):
        return self.total_cents / 100.0

    @total.setter
    def total(self, value):
        self.total_cents = int(round(value * 100))


class OrderItem(BaseModel):
    __tablename__ = 'order_items'

    order_id = db.Column(db.String(36), db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price_at_purchase_cents = db.Column(db.Integer, nullable=False)

    @property
    def price_at_purchase(self):
        return self.price_at_purchase_cents / 100.0

    @price_at_purchase.setter
    def price_at_purchase(self, value):
        self.price_at_purchase_cents = int(round(value * 100))

    @validates('quantity')
    def validate_quantity(self, key, value):
        if value <= 0:
            raise ValueError("Quantity must be greater than 0")
        return value
