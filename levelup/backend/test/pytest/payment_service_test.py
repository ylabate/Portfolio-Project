import pytest
from unittest.mock import patch, MagicMock
from app.services.payment_service import PaymentService
from factories.user_factory import UserFactory
from factories.product_factory import ProductFactory
from app.models.order import Order, OrderItem
from app.models.transaction import Transaction
from app.models.inventory import UserInventory
from app.models.cart import Cart, CartItem

def test_handle_payment_success(app, db_session):
    test_user = UserFactory()
    test_product = ProductFactory()
    db_session.add(test_user)
    db_session.add(test_product)
    db_session.commit()
    
    # Create an order
    order = Order(user_id=test_user.id, total_cents=test_product.price_cents)
    order_item = OrderItem(product_id=test_product.id, quantity=1, price_at_purchase_cents=test_product.price_cents)
    order.items.append(order_item)
    db_session.add(order)
    
    # Create a cart with item to be cleared
    cart = Cart(user_id=test_user.id)
    cart_item = CartItem(product_id=test_product.id, quantity=1)
    cart.items.append(cart_item)
    db_session.add(cart)
    
    db_session.commit()

    # Mock Stripe session
    mock_session = MagicMock()
    mock_session.to_dict.return_value = {
        "id": "cs_test_success",
        "amount_total": test_product.price_cents,
        "metadata": {
            "user_id": test_user.id,
            "order_id": order.id
        }
    }
    mock_session.id = "cs_test_success"

    service = PaymentService()
    result = service.handle_payment_success(mock_session)

    assert result is True
    
    # Check transaction created
    transaction = Transaction.query.filter_by(reference_id="cs_test_success").first()
    assert transaction is not None
    assert transaction.user_id == test_user.id
    
    # Check inventory updated
    inventory = UserInventory.query.filter_by(user_id=test_user.id).all()
    assert len(inventory) == 1
    assert inventory[0].product_id == test_product.id
    
    # Check cart cleared
    assert len(cart.items) == 0

def test_prepare_checkout_from_cart(app, db_session):
    test_user = UserFactory()
    test_product = ProductFactory()
    db_session.add(test_user)
    db_session.add(test_product)
    db_session.commit()
    
    cart = Cart(user_id=test_user.id)
    cart_item = CartItem(product_id=test_product.id, quantity=2)
    cart.items.append(cart_item)
    db_session.add(cart)
    
    # Add stock
    from app.models.inventory import InventoryItem
    for _ in range(5):
        db_session.add(InventoryItem(product_id=test_product.id))
        
    db_session.commit()

    with patch('app.services.stripe_service.StripeService.create_checkout_session') as mock_stripe:
        mock_session = MagicMock()
        mock_session.id = "cs_test_prepare"
        mock_session.url = "http://stripe.com"
        mock_stripe.return_value = mock_session

        service = PaymentService()
        session = service.prepare_checkout(test_user.id)

        assert session.id == "cs_test_prepare"
        mock_stripe.assert_called_once()
        
def test_handle_payment_success_missing_metadata(app, db_session):
    mock_session = MagicMock()
    mock_session.to_dict.return_value = {"id": "cs_test", "metadata": {}}
    
    service = PaymentService()
    assert service.handle_payment_success(mock_session) is False

def test_handle_payment_success_order_not_found(app, db_session):
    test_user = UserFactory()
    db_session.add(test_user)
    db_session.commit()

    mock_session = MagicMock()
    mock_session.to_dict.return_value = {
        "id": "cs_test",
        "amount_total": 1000,
        "metadata": {"user_id": test_user.id, "order_id": "non_existent_order"}
    }
    mock_session.id = "cs_test"

    service = PaymentService()
    # Should still create transaction but not inventory
    assert service.handle_payment_success(mock_session) is True
    
    transaction = Transaction.query.filter_by(reference_id="cs_test").first()
    assert transaction is not None
    inventory = UserInventory.query.filter_by(user_id=test_user.id).all()
    assert len(inventory) == 0

def test_handle_payment_success_idempotency(app, db_session):
    test_user = UserFactory()
    test_product = ProductFactory()
    db_session.add(test_user)
    db_session.add(test_product)
    db_session.commit()
    
    order = Order(user_id=test_user.id, total_cents=test_product.price_cents)
    db_session.add(order)
    db_session.commit()

    mock_session = MagicMock()
    mock_session.to_dict.return_value = {
        "id": "cs_test_idempotency",
        "amount_total": test_product.price_cents,
        "metadata": {"user_id": test_user.id, "order_id": order.id}
    }
    mock_session.id = "cs_test_idempotency"

    service = PaymentService()
    
    # First call
    assert service.handle_payment_success(mock_session) is True
    assert Transaction.query.filter_by(reference_id="cs_test_idempotency").count() == 1
    
    # Second call with same session ID
    assert service.handle_payment_success(mock_session) is True
    # Should NOT create a second transaction
    assert Transaction.query.filter_by(reference_id="cs_test_idempotency").count() == 1
