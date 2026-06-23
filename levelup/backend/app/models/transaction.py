from app import db
from app.models.BaseModel import BaseModel


class Transaction(BaseModel):
    __tablename__ = 'transactions'

    user_id = db.Column(
        db.String(36), db.ForeignKey('users.id'), nullable=False)
    amount_cents = db.Column(db.Integer, nullable=False)
    type = db.Column(db.String(50), nullable=False)
    reference_id = db.Column(db.String(36), nullable=True)

    def __setattr__(self, name, value):
        if 'id' in self.__dict__ and self.__dict__['id'] is not None:
            if not name.startswith('_'):
                raise AttributeError(
                    "Transactions are immutable and cannot be modified.")
        super().__setattr__(name, value)

    @property
    def amount(self):
        return self.amount_cents / 100.0

    @amount.setter
    def amount(self, value):
        if 'id' in self.__dict__ and self.__dict__['id'] is not None:
            raise AttributeError("Transactions are immutable.")
        self.amount_cents = int(round(value * 100))
