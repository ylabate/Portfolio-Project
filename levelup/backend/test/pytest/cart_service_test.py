from app.services.cart_service import CartService
from factories.product_factory import ProductFactory
from factories.user_factory import UserFactory


def test_add_one_to_card(app, db_session):
    test_user = UserFactory()
    test_product = ProductFactory()
    db_session.add(test_user)
    db_session.commit()

    service = CartService()
    cart = service.add_to_cart(test_user.id, test_product.id, 1)

    cart = service.get_cart(test_user.id)
    assert len(cart.items) == 1
    assert cart.items[0].product_id == test_product.id


def test_multiple_add_and_partial_remove(app, db_session):
    test_user = UserFactory()
    test_product = ProductFactory()
    db_session.add(test_user)
    db_session.commit()

    service = CartService()

    service.add_to_cart(test_user.id, test_product.id, 1)
    service.add_to_cart(test_user.id, test_product.id, 1)

    cart = service.get_cart(test_user.id)
    assert len(cart.items) == 1
    assert cart.items[0].quantity == 2

    service.remove_from_cart(test_user.id, test_product.id, quantity=1)

    cart = service.get_cart(test_user.id)
    assert len(cart.items) == 1
    assert cart.items[0].quantity == 1

    service.remove_from_cart(test_user.id, test_product.id, quantity=1)

    cart = service.get_cart(test_user.id)
    assert len(cart.items) == 0
