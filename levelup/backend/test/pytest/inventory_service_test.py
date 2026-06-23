import pytest
from app.services.inventory_service import InventoryService
from factories.user_factory import UserFactory
from factories.product_factory import ProductFactory
from app.models.inventory import UserInventory

def test_get_inventory(app, db_session):
    test_user = UserFactory()
    test_product = ProductFactory()
    db_session.add(test_user)
    db_session.add(test_product)
    db_session.commit()

    # Add item to inventory
    user_inv = UserInventory(user_id=test_user.id, product_id=test_product.id)
    db_session.add(user_inv)
    db_session.commit()

    service = InventoryService()
    inventory = service.get_inventory(test_user.id)
    
    assert len(inventory) == 1
    assert inventory[0].user_id == test_user.id
    assert inventory[0].product_id == test_product.id

def test_get_inventory_invalid_user(app, db_session):
    service = InventoryService()
    with pytest.raises(ValueError, match="user_id not found"):
        service.get_inventory("invalid_user_id")
