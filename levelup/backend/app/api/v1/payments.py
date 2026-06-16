from flask import request, jsonify
from app.services.stripe_service import StripeService
from app.services.payment_service import PaymentService
from app.persistence.repository import ProductRepository
from . import v1_bp
import os

stripe_service = StripeService()
product_repo = ProductRepository()


@v1_bp.route('/payments/create-session', methods=['POST'])
def create_session():
    data = request.json
    items = data.get('items', [])

    line_items = []
    for item in items:
        product = product_repo.get(item['product_id'])
        if product:
            line_items.append({
                'price_data': {
                    'currency': 'eur',
                    'product_data': {'name': product.name},
                    'unit_amount': product.price_cents,
                },
                'quantity': item['quantity'],
            })

    try:
        metadata = {
            "user_id": data.get("user_id"),
            "order_id": data.get("order_id")
        }

        session = stripe_service.create_checkout_session(
            line_items=line_items,
            success_url=os.getenv('FRONTEND_URL', 'http://localhost:3000') +
            '/success',
            cancel_url=os.getenv('FRONTEND_URL', 'http://localhost:3000') +
            '/cancel',
            metadata=metadata
        )
        return jsonify({"url": session.url, "id": session.id})
    except Exception as e:
        return jsonify(error=str(e)), 500


@v1_bp.route('/payments/webhook', methods=['POST'])
def webhook():
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')

    try:
        event = stripe_service.verify_webhook(payload, sig_header)
    except Exception as e:
        return jsonify(error=str(e)), 400

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        PaymentService.handle_payment_success(session)

    return jsonify(success=True), 200
