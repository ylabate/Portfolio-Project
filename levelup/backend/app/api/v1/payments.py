from flask import request, jsonify
from app.services.stripe_service import StripeService
from app.services.payment_service import PaymentService
from . import v1_bp
from flask_jwt_extended import jwt_required
from app.persistence.repository import TransactionRepository

stripe_service = StripeService()


@v1_bp.route("/payments/webhook", methods=["POST"])
def webhook():
    payload = request.data
    sig_header = request.headers.get("Stripe-Signature")

    try:
        event = stripe_service.verify_webhook(payload, sig_header)
    except Exception as e:
        return jsonify(error=str(e)), 400

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        session_id = getattr(session, "id", None)
        metadata = getattr(session, "metadata", None) or {}
        print(f"[WEBHOOK] checkout.session.completed received, session_id={session_id}, metadata={metadata}")
        PaymentService.handle_payment_success(session)

    if event["type"] == "checkout.session.expired":
        session = event["data"]["object"]
        session_id = getattr(session, "id", None)
        metadata = getattr(session, "metadata", None) or {}
        print(f"[WEBHOOK] checkout.session.expired received, session_id={session_id}, metadata={metadata}")
        PaymentService.handle_payment_expired(session)

    return jsonify(success=True), 200


@v1_bp.route("/checkout/<string:session_id>/status", methods=["GET"])
@jwt_required()
def get_checkout_status(session_id):
    transaction_repo = TransactionRepository()
    transaction = transaction_repo.get_by_attribute("reference_id", session_id)

    if transaction:
        return (
            jsonify(
                {
                    "success": True,
                    "payment_status": "paid",
                    "fulfillment": {"items_provisioned": True},
                }
            ),
            200,
        )

    return (
        jsonify(
            {
                "success": False,
                "payment_status": "pending",
                "fulfillment": {"items_provisioned": False},
            }
        ),
        200,
    )
