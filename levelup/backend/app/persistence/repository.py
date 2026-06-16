from app import db
from app.models.cart import Cart
from app.models.product import Product
from app.models.transaction import Transaction
from app.models.order import Order
from app.models.user import User


class Repository:
    def __init__(self, model):
        self.model = model

    def add(self, obj):
        db.session.add(obj)
        return obj

    def get(self, obj_id):
        return db.session.get(self.model, obj_id)

    def get_all(self):
        return self.model.query.all()

    def get_page(self, page_id, page_limit):
        return self.model.query.paginate(
            page=page_id,
            per_page=page_limit).items

    def update(self, obj, data):
        for key, value in data.items():
            if hasattr(obj, key):
                setattr(obj, key, value)
        return obj

    def delete(self, obj):
        db.session.delete(obj)

    def save(self):
        db.session.commit()

    def rollback(self):
        db.session.rollback()

    def get_by_attribute(self, attr_name, attr_value):
        return self.model.query.filter_by(**{attr_name: attr_value}).first()


class CartRepository(Repository):
    def __init__(self):
        super().__init__(Cart)


class ProductRepository(Repository):
    def __init__(self):
        super().__init__(Product)


class TransactionRepository(Repository):
    def __init__(self):
        super().__init__(Transaction)


class OrderRepository(Repository):
    def __init__(self):
        super().__init__(Order)


class UserRepository(Repository):
    def __init__(self):
        super().__init__(User)
