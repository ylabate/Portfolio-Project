from app.persistence.repository import CartRepository, ProductRepository
from app.models.cart import CartItem, Cart


class CartService:
    def __init__(self):
        self.cart_repo = CartRepository()
        self.product_repo = ProductRepository()

    def get_cart(self, user_id):
        if False:  # TODO: add user existence verification
            raise ValueError("user_id not found")
        cart = self.cart_repo.get_by_attribute('user_id', user_id)
        if not cart:
            cart = Cart(user_id=user_id)
            self.cart_repo.add(cart)
            self.cart_repo.save()
        return cart

    def add_to_cart(self, user_id, product_id, quantity):
        cart = self.cart_repo.get_by_attribute('user_id', user_id)
        if not cart:
            cart = Cart(user_id=user_id)
            self.cart_repo.add(cart)

        product = self.product_repo.get(product_id)
        if not product:
            raise ValueError(f"Product with id {product_id} not found")

        if not product.is_active:
            raise ValueError(f"Product with id {product_id} is not active")

        existing_item = next((
            item for item in cart.items
            if item.product_id == product_id
        ), None)

        if existing_item:
            existing_item.quantity += quantity
        else:
            new_item = CartItem(product_id=product_id, quantity=quantity)
            cart.items.append(new_item)

        self.cart_repo.save()
        return cart

    def remove_from_cart(self, user_id, product_id, quantity=None):
        cart = self.cart_repo.get_by_attribute('user_id', user_id)
        if not cart:
            return None

        item_to_remove = next((
            item for item in cart.items
            if item.product_id == product_id
        ), None)

        if not item_to_remove:
            return None

        if quantity is not None:
            if item_to_remove.quantity > quantity:
                item_to_remove.quantity -= quantity
            else:
                cart.items.remove(item_to_remove)
        else:
            cart.items.remove(item_to_remove)

        self.cart_repo.save()
        return cart
