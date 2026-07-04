import stripe
import os


class StripeService:
    def __init__(self):
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

    def create_checkout_session(
        self, line_items, success_url, cancel_url, metadata=None
    ):
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=line_items,
                mode="payment",
                success_url=success_url,
                cancel_url=cancel_url,
                metadata=metadata or {},
            )
            return session
        except stripe.error.StripeError as e:
            raise e

    def verify_webhook(self, payload, sig_header):
        endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
        if not endpoint_secret:
            secret_filepath = "/app/shared/.stripe_webhook_secret"
            if os.path.exists(secret_filepath):
                try:
                    with open(secret_filepath, "r") as f:
                        endpoint_secret = f.read().strip()
                except Exception as e:
                    print(f"Error reading webhook secret file: {e}")
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
            return event
        except (ValueError, stripe.error.SignatureVerificationError) as e:
            raise e
