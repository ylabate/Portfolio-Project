from app import db
from app.models.BaseModel import BaseModel

class UserInventory(BaseModel):
    __tablename__ = 'user_inventories'

    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    state = db.Column(db.String(50), nullable=False, default='in_inventory')  # 'in_inventory', 'activated', 'opened'
    
    # Link to the specific item (with the code)
    inventory_item_id = db.Column(db.String(36), db.ForeignKey('inventory_items.id'), nullable=True)

class InventoryItem(BaseModel):
    __tablename__ = 'inventory_items'

    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    activation_code = db.Column(db.String(255), nullable=True)
    is_used = db.Column(db.Boolean, default=False)
    used_at = db.Column(db.DateTime, nullable=True)

    # Backref from UserInventory
    ownership = db.relationship('UserInventory', backref='details', uselist=False)

    def __repr__(self):
        return f'<InventoryItem {self.product_id} - {"Used" if self.is_used else "Available"}>'
