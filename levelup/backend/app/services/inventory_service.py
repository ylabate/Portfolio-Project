from app.persistence.repository import UserRepository


class InventoryService:
    def __init__(self):
        self.user_repo = UserRepository()

    def get_inventory(self, user_id):
        user = self.user_repo.get(user_id)
        if not user:
            raise ValueError("user_id not found")

        return user
