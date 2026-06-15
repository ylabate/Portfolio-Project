import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from app.models import User, Product, Genre, ProductImage, InventoryItem, Cart, CartItem

def seed_db():
    app = create_app()
    with app.app_context():
        print("Seeding database...")

        # 1. Create Genres
        genres = {}
        for name in ["Action", "RPG", "Adventure", "Strategy", "FPS", "Simulation"]:
            genre = Genre.query.filter_by(name=name).first()
            if not genre:
                genre = Genre(name=name)
                db.session.add(genre)
            genres[name] = genre

        db.session.commit()
        print("- Genres created.")

        # 2. Create Admin User
        ADMIN_FIXED_ID = "00000000-0000-0000-0000-000000000001"
        admin = User.query.filter_by(email="admin@levelup.com").first()
        if not admin:
            admin = User(
                id=ADMIN_FIXED_ID,
                username="admin",
                email="admin@levelup.com",
                password="adminpassword123", # Will be hashed automatically by the setter
                is_admin=True
            )
            db.session.add(admin)
            print(f"- Admin user created with FIXED ID: {ADMIN_FIXED_ID}")
        else:
            print(f"- Admin user already exists (ID: {admin.id}).")

        # 3. Create Sample Products
        products_data = [
            {
                "id": "00000000-0000-0000-0000-000000000002",
                "name": "Elden Ring",
                "type": "key",
                "price": 59.99,
                "description": "Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.",
                "genres": ["RPG", "Action"],
                "image": "https://shared.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900_2x.jpg?t=1748630517"
            },
            {
                "id": "00000000-0000-0000-0000-000000000003",
                "name": "Cyberpunk 2077",
                "type": "key",
                "price": 29.99,
                "description": "Cyberpunk 2077 is an open-world, action-adventure RPG set in the megalopolis of Night City.",
                "genres": ["RPG", "FPS", "Action"],
                "image": "https://shared.steamstatic.com/store_item_assets/steam/apps/1091500/fc7064f4a8ee2960eb51f5872d7990d771f26d2e/library_600x900_2x.jpg?t=1753355535"
            },
            {
                "id": "00000000-0000-0000-0000-000000000004",
                "name": "Stardew Valley",
                "type": "key",
                "price": 14.99,
                "description": "You've inherited your grandfather's old farm plot in Stardew Valley.",
                "genres": ["Simulation", "RPG"],
                "image": "https://shared.steamstatic.com/store_item_assets/steam/apps/413150/library_600x900_2x.jpg?t=1754692839"
            }
        ]

        for p_data in products_data:
            product = Product.query.filter_by(id=p_data["id"]).first()
            if not product:
                product = Product(
                    id=p_data["id"],
                    name=p_data["name"],
                    type=p_data["type"],
                    price=p_data["price"], # Uses the decimal setter
                    description=p_data["description"]
                )
                # Add genres
                for g_name in p_data["genres"]:
                    product.genres.append(genres[g_name])

                db.session.add(product)
                db.session.flush() # Get product ID

                # Add image
                image = ProductImage(
                    product_id=product.id,
                    link=p_data["image"],
                    alt_text=f"{product.name} cover",
                    is_thumbnail=True
                )
                db.session.add(image)

                # Add some keys to stock
                for i in range(5):
                    key = InventoryItem(
                        product_id=product.id,
                        activation_code=f"ABCD-{product.name[:3].upper()}-{i:04d}"
                    )
                    db.session.add(key)

        db.session.commit()
        print("- Sample products and stock created.")

        # 4. Create Cart for Admin
        if admin:
            cart = Cart.query.filter_by(user_id=admin.id).first()
            if not cart:
                cart = Cart(user_id=admin.id)
                db.session.add(cart)
                db.session.flush()

                # Add two sample items to the cart
                sample_products = Product.query.limit(2).all()
                for i, product in enumerate(sample_products):
                    cart_item = CartItem(
                        cart_id=cart.id,
                        product_id=product.id,
                        quantity=i + 1 # 1 for the first, 2 for the second
                    )
                    db.session.add(cart_item)
                
                print(f"- Cart created for admin with {len(sample_products)} items.")
            else:
                print("- Admin cart already exists.")

        db.session.commit()
        print("Seeding completed successfully!")

if __name__ == "__main__":
    seed_db()
