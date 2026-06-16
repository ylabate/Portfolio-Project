from app.persistence.repository import TransactionRepository
from app.models.transaction import Transaction


class PaymentService:
    @staticmethod
    def handle_payment_success(session):
        """
        Logique métier : ce qu'on fait quand le paiement est validé.
        """
        transaction_repo = TransactionRepository()

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

        transaction = Transaction(
            user_id=user_id,
            amount_cents=amount_total,
            type='stripe_payment',
            reference_id=getattr(session, 'id', None)
        )
        transaction_repo.add(transaction)
        transaction_repo.save()
        return True
