from app import db
from app.models.BaseModel import BaseModel


class UserInventory(BaseModel):
    __tablename__ = 'user_inventories'

    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    state = db.Column(db.String(50), nullable=False, default='in_inventory')  # 'in_inventory', 'activated', 'opened'

    inventory_item_id = db.Column(db.String(36), db.ForeignKey('inventory_items.id'), nullable=True)

    product = db.relationship('Product', lazy='joined')

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "product_details": self.product.to_dict() if self.product else None,
            "state": self.state,
            "details": self.details.to_dict() if self.details else None
        }


class InventoryItem(BaseModel):
    __tablename__ = 'inventory_items'

    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    activation_code = db.Column(db.String(255), nullable=True)
    is_used = db.Column(db.Boolean, default=False)
    used_at = db.Column(db.DateTime, nullable=True)

    ownership = db.relationship('UserInventory', backref='details', uselist=False)

    def to_dict(self):
        return {
            "id": self.id,
            "activation_code": self.activation_code,
            "is_used": self.is_used,
            "used_at": self.used_at.isoformat() if self.used_at else None
        }

