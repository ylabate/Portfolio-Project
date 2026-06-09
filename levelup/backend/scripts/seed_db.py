import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from app.models import User, Product, Genre, ProductImage, InventoryItem

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
        admin = User.query.filter_by(email="admin@levelup.com").first()
        if not admin:
            admin = User(
                username="admin",
                email="admin@levelup.com",
                password="adminpassword123", # Will be hashed automatically by the setter
                is_admin=True
            )
            db.session.add(admin)
            print("- Admin user created (admin@levelup.com / adminpassword123).")
        else:
            print("- Admin user already exists.")

        # 3. Create Sample Products
        products_data = [
            {
                "name": "Elden Ring",
                "type": "key",
                "price": 59.99,
                "description": "Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.",
                "genres": ["RPG", "Action"],
                "image": "https://shared.akamai.steamstatic.com/store_apps/1091500/header.jpg"
            },
            {
                "name": "Cyberpunk 2077",
                "type": "key",
                "price": 29.99,
                "description": "Cyberpunk 2077 is an open-world, action-adventure RPG set in the megalopolis of Night City.",
                "genres": ["RPG", "FPS", "Action"],
                "image": "https://shared.akamai.steamstatic.com/store_apps/413150/header.jpg"
            },
            {
                "name": "Stardew Valley",
                "type": "key",
                "price": 14.99,
                "description": "You've inherited your grandfather's old farm plot in Stardew Valley.",
                "genres": ["Simulation", "RPG"],
                "image": "https://shared.akamai.steamstatic.com/store_apps/413150/header.jpg"
            }
        ]

        for p_data in products_data:
            product = Product.query.filter_by(name=p_data["name"]).first()
            if not product:
                product = Product(
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
        print("Seeding completed successfully!")

if __name__ == "__main__":
    seed_db()
