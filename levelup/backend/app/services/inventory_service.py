from app.persistence.repository import UserInventoryRepository, UserRepository
from app.models.inventory import UserInventory, InventoryItem
from app import db


class InventoryService:
    def __init__(self):
        self.inventory_repo = UserInventoryRepository()
        self.user_repo = UserRepository()

    def get_inventory(self, user_id, page=1, limit=10):
        if not self.user_repo.get(user_id):
            raise ValueError("user_id not found")

        items = (
            UserInventory.query.filter_by(user_id=user_id)
            .order_by(UserInventory.created_at.desc())
            .paginate(page=page, per_page=limit, error_out=False)
        )
        return items.items

    def get_inventory_item(self, user_id, item_id):
        item = self.inventory_repo.get(item_id)
        if not item or item.user_id != user_id:
            raise ValueError("Inventory item not found")
        return item

    def activate_inventory_item(self, user_id, item_id):
        item = self.get_inventory_item(user_id, item_id)

        if item.state != "in_inventory":
            raise ValueError(f"Item is already '{item.state}', cannot activate")

        # The key was already bound during purchase/payment success
        stock = (
            InventoryItem.query.get(item.inventory_item_id)
            if item.inventory_item_id
            else None
        )
        if not stock:
            # Fallback if no key was linked (e.g. legacy items or resolved stock issues)
            stock = InventoryItem.query.filter_by(
                product_id=item.product_id, is_used=False
            ).first()
            if not stock:
                raise ValueError("No activation key available for this product")

            stock.is_used = True
            from datetime import datetime, timezone

            stock.used_at = datetime.now(timezone.utc)
            item.inventory_item_id = stock.id

        item.state = "activated"
        db.session.commit()

        return stock
