from sqlalchemy.orm import validates
from app import db
from app.models.BaseModel import BaseModel
from app.models.genre import product_genres

class Product(BaseModel):
    __tablename__ = 'products'

    type = db.Column(db.String(20), nullable=False)  # 'key' or 'crate'
    name = db.Column(db.String(255), nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    price_cents = db.Column(db.Integer, nullable=False)
    is_active = db.Column(db.Boolean, default=True)  # Soft delete

    # Metadata as a flexible JSON field for external IDs, extra info
    metadata_json = db.Column(db.JSON, nullable=True)

    # Relationships
    genres = db.relationship('Genre', secondary=product_genres, backref=db.backref('products', lazy='dynamic'))
    images = db.relationship('ProductImage', backref='product', lazy='joined', cascade="all, delete-orphan")
    reviews = db.relationship('Review', backref='product', lazy='dynamic')

    # Stock management through InventoryItem
    stock_items = db.relationship('InventoryItem', backref='product', lazy='dynamic')

    @property
    def price(self):
        return self.price_cents / 100.0

    @price.setter
    def price(self, value):
        if value < 0:
            raise ValueError("Price cannot be negative")
        self.price_cents = int(round(value * 100))

    @property
    def thumbnail_url(self):
        thumb = next((img for img in self.images if img.is_thumbnail), None)
        return thumb.link if thumb else None

    @validates('type')
    def validate_type(self, key, value):
        if value not in ['key', 'crate']:
            raise ValueError("Type must be either 'key' or 'crate'")
        return value

    def __repr__(self):
        return f'<Product {self.name}>'
