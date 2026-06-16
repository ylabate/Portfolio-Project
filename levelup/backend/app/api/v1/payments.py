from flask import request, jsonify
from app.services.stripe_service import StripeService
from app.services.payment_service import PaymentService
from . import v1_bp

stripe_service = StripeService()


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
