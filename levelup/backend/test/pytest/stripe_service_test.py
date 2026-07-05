import pytest
from unittest.mock import patch, MagicMock
from app.services.stripe_service import StripeService
import stripe


def test_create_checkout_session(app):
    with patch("stripe.checkout.Session.create") as mock_create:
        mock_session = MagicMock()
        mock_session.id = "cs_test_123"
        mock_session.url = "https://checkout.stripe.com/test"
        mock_create.return_value = mock_session

        service = StripeService()
        session = service.create_checkout_session(
            line_items=[{"price": "price_123", "quantity": 1}],
            success_url="http://success.com",
            cancel_url="http://cancel.com",
        )

        assert session.id == "cs_test_123"
        assert session.url == "https://checkout.stripe.com/test"
        mock_create.assert_called_once()


def test_verify_webhook(app):
    with patch("stripe.Webhook.construct_event") as mock_construct:
        mock_event = {"id": "evt_123", "type": "checkout.session.completed"}
        mock_construct.return_value = mock_event


def test_create_checkout_session_error(app):
    with patch("stripe.checkout.Session.create") as mock_create:
        mock_create.side_effect = stripe.error.StripeError("API Error")

        service = StripeService()
        with pytest.raises(stripe.error.StripeError):
            service.create_checkout_session([], "http://s.com", "http://c.com")


def test_verify_webhook_invalid_sig(app):
    with patch("stripe.Webhook.construct_event") as mock_construct:
        mock_construct.side_effect = stripe.error.SignatureVerificationError(
            "Invalid", "sig"
        )

        service = StripeService()
        with pytest.raises(stripe.error.SignatureVerificationError):
            service.verify_webhook(b"payload", "bad_sig")
