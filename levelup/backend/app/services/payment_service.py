from app.persistence.repository import TransactionRepository, ProductRepository
from app.persistence.repository import UserRepository, OrderRepository
from app.models.transaction import Transaction
from app.models.order import OrderItem, Order
from app.models.inventory import UserInventory
from app.services.stripe_service import StripeService
import os


class PaymentService:
    @staticmethod
    def handle_payment_success(session):
        transaction_repo = TransactionRepository()
        order_repo = OrderRepository()
        user_repo = UserRepository()

        session_data = (
            session.to_dict()
            if hasattr(session, 'to_dict')
            else session
        )

        metadata = session_data.get('metadata', {})
        order_id = metadata.get('order_id')
        user_id = metadata.get('user_id')
        amount_total = session_data.get('amount_total', 0)

        if not order_id or not user_id:
            print("Webhook reçu mais metadata (user_id/order_id) manquantes.")
            return False

        existing_transaction = transaction_repo.get_by_attribute(
            'reference_id', getattr(session, 'id', None)
        )
        if existing_transaction:
            print(f"Paiement déjà traité pour la session {
                getattr(session, 'id', None)
            }")
            return True

        transaction = Transaction(
            user_id=user_id,
            amount_cents=amount_total,
            type='stripe_payment',
            reference_id=getattr(session, 'id', None)
        )
        transaction_repo.add(transaction)

        order = order_repo.get(order_id)
        if order:
            from app import db
            for item in order.items:
                for _ in range(item.quantity):
                    user_inv = UserInventory(
                        user_id=user_id,
                        product_id=item.product_id,
                        state='in_inventory'
                    )
                    db.session.add(user_inv)

            user = user_repo.get(user_id)
            if user and user.cart:
                for cart_item in list(user.cart.items):
                    db.session.delete(cart_item)

        transaction_repo.save()
        return True

    def prepare_checkout(self, user_id, items=None):
        product_repo = ProductRepository()
        user_repo = UserRepository()
        order_repo = OrderRepository()
        stripe_service = StripeService()

        if items is None:
            user = user_repo.get(user_id)
            cart = user.cart if user else None
            if not cart or not cart.items:
                raise ValueError("empty cart")
            items_to_process = [
                {"product_id": item.product_id, "quantity": item.quantity}
                for item in cart.items
            ]
        else:
            items_to_process = items

        if not items_to_process:
            raise ValueError("no items to checkout")

        new_order = Order(user_id=user_id, total_cents=0)
        total_cents = 0
        line_items = []

        for item_data in items_to_process:
            product = product_repo.get(item_data['product_id'])
            if product:
                quantity = item_data['quantity']
                line_items.append({
                    'price_data': {
                        'currency': 'eur',
                        'product_data': {'name': product.name},
                        'unit_amount': product.price_cents,
                    },
                    'quantity': quantity,
                })
                order_item = OrderItem(
                    product_id=product.id,
                    quantity=quantity,
                    price_at_purchase_cents=product.price_cents
                )
                new_order.items.append(order_item)
                total_cents += (product.price_cents * quantity)

        if not line_items:
            raise ValueError("no valid products found")

        new_order.total_cents = total_cents
        order_repo.add(new_order)
        order_repo.save()

        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        return stripe_service.create_checkout_session(
            line_items,
            f"{frontend_url}/success?order_id={new_order.id}",
            f"{frontend_url}/cart",
            {
                "user_id": str(user_id),
                "order_id": str(new_order.id)
            }
        )
