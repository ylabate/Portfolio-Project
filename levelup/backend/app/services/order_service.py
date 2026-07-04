from app.persistence.repository import OrderRepository, UserRepository
from app.models.order import Order


class OrderService:
    def __init__(self):
        self.order_repo = OrderRepository()
        self.user_repo = UserRepository()

    def get_orders(self, user_id, page=1, limit=10):
        if not self.user_repo.get(user_id):
            raise ValueError("user_id not found")

        orders = (
            Order.query.filter_by(user_id=user_id)
            .order_by(Order.created_at.desc())
            .paginate(page=page, per_page=limit, error_out=False)
        )

        return orders.items
