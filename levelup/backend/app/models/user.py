from app import db, bcrypt
from app.models.BaseModel import BaseModel

class User(BaseModel):
    __tablename__ = 'users'

    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column('password', db.String(255), nullable=False)
    profile_picture_url = db.Column(db.String(255), nullable=True)
    is_admin = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)

    reviews = db.relationship('Review', backref='user', lazy='dynamic')
    transactions = db.relationship('Transaction', backref='user', lazy='dynamic')
    orders = db.relationship('Order', backref='user', lazy='dynamic')
    inventory_items = db.relationship('UserInventory', backref='user', lazy='dynamic')
    cart = db.relationship('Cart', backref='user', uselist=False, lazy='joined')

    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')

    @password.setter
    def password(self, password):
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long")
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        if not self.is_active:
            return False
        return bcrypt.check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'
