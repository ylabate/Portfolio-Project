import sys
import os
import random

# Add the backend directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app, db
from app.models import User, Product, Genre, ProductImage, InventoryItem, Cart, Review

DEMO_USERS = [
    {
        "username": "mika.stone",
        "email": "mika.stone@example.com",
        "password": "password123",
        "is_active": True,
    },
    {
        "username": "noah.river",
        "email": "noah.river@example.com",
        "password": "password123",
        "is_active": True,
    },
    {
        "username": "lina.arc",
        "email": "lina.arc@example.com",
        "password": "password123",
        "is_active": True,
    },
    {
        "username": "jules.nova",
        "email": "jules.nova@example.com",
        "password": "password123",
        "is_active": True,
    },
    {
        "username": "aya.pixel",
        "email": "aya.pixel@example.com",
        "password": "password123",
        "is_active": False,
    },
    {
        "username": "leo.bits",
        "email": "leo.bits@example.com",
        "password": "password123",
        "is_active": True,
    },
    {
        "username": "sara.drift",
        "email": "sara.drift@example.com",
        "password": "password123",
        "is_active": False,
    },
    {
        "username": "tom.ember",
        "email": "tom.ember@example.com",
        "password": "password123",
        "is_active": True,
    },
    {
        "username": "maya.synth",
        "email": "maya.synth@example.com",
        "password": "password123",
        "is_active": True,
    },
    {
        "username": "kai.wisp",
        "email": "kai.wisp@example.com",
        "password": "password123",
        "is_active": False,
    },
]

STATIC_GAMES = [
    {
        "appid": 292030,
        "name": "The Witcher 3: Wild Hunt",
        "genres": [
            "RPG",
            "Action",
            "Adventure"
        ],
        "price": 2.99,
        "description": "Vous incarnez Geralt de Riv, un tueur de monstres. Devant vous s'étend un continent en guerre, infesté de monstres, à explorer à votre guise. Votre contrat actuel ? Retrouver Ciri, l'enfant de la prophétie, une arme vivante capable de changer le monde.",
        "thumbnail": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/ad9240e088f953a84aee814034c50a6a92bf4516/header.jpg?t=1768303991",
        "metadata": {
            "steam_appid": 292030
        }
    },
    {
        "appid": 1245620,
        "name": "Elden Ring",
        "genres": [
            "RPG",
            "Action"
        ],
        "price": 59.99,
        "description": "LE RPG D'ACTION FANTASTIQUE ACCLAMÉ PAR LA CRITIQUE. Levez-vous, Sans-éclat, et puisse la grâce guider vos pas. Brandissez la puissance du Cercle d'Elden. Devenez Seigneur de l'Entre-terre.",
        "thumbnail": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg?t=1767883716",
        "metadata": {
            "steam_appid": 1245620
        }
    },
    {
        "appid": 1174180,
        "name": "Red Dead Redemption 2",
        "genres": [
            "Action",
            "Adventure"
        ],
        "price": 14.99,
        "description": "Arthur Morgan et la bande de Van der Linde sont des hors-la-loi fugitifs. Les agents fédéraux et les chasseurs de primes sont à leurs trousses et la bande commet méfaits sur méfaits dans les terres sauvages pour survivre.",
        "thumbnail": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg?t=1759502961",
        "metadata": {
            "steam_appid": 1174180
        }
    },
    {
        "appid": 271590,
        "name": "GTA V",
        "genres": [
            "Action"
        ],
        "price": 19.99,
        "description": "Grand Theft Auto V sur PC offre aux joueurs la possibilité d'explorer le monde de Los Santos et Blaine County en haute résolution (jusqu'à 4K) et à 60 images par seconde.",
        "thumbnail": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg?t=1765387725",
        "metadata": {
            "steam_appid": 271590
        }
    },
    {
        "appid": 990080,
        "name": "Hogwarts Legacy",
        "genres": [
            "RPG",
            "Action"
        ],
        "price": 8.99,
        "description": "Hogwarts Legacy : L'Héritage de Poudlard est un RPG d'action-aventure immersif en monde ouvert. Vous pouvez prendre le contrôle et vous retrouver au centre de votre propre aventure dans le Monde des sorciers.",
        "thumbnail": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/990080/a3cdc6f40d97df8ac993679c2dd1edeb5222421e/header.jpg?t=1778797474",
        "metadata": {
            "steam_appid": 990080
        }
    },
    {
        "appid": 1091500,
        "name": "Cyberpunk 2077",
        "genres": [
            "RPG",
            "Action"
        ],
        "price": 17.99,
        "description": "Cyberpunk 2077 est un JDR d'action-aventure en monde ouvert, qui se déroule à Night City, une mégalopole futuriste et sombre, obsédée par le pouvoir, la séduction et les modifications corporelles.",
        "thumbnail": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/e9047d8ec47ae3d94bb8b464fb0fc9e9972b4ac7/header.jpg?t=1769690377",
        "metadata": {
            "steam_appid": 1091500
        }
    },
    {
        "appid": 1593500,
        "name": "God of War",
        "genres": [
            "Action"
        ],
        "price": 19.99,
        "description": "Sa vengeance contre les dieux de l'Olympe étant bien derrière lui, Kratos vit désormais comme un simple habitant du royaume des dieux (et des monstres) nordiques. C'est dans ce monde inhospitalier et cruel qu'il doit combattre pour sa survie... et apprendre à son fils à en faire de même.",
        "thumbnail": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1593500/header.jpg?t=1763059412",
        "metadata": {
            "steam_appid": 1593500
        }
    },
    {
        "appid": 1817070,
        "name": "Marvel's Spider-Man Remastered",
        "genres": [
            "Action"
        ],
        "price": 23.99,
        "description": "Dans Marvel’s Spider-Man Remastered, les mondes de Peter Parker et de Spider-Man entrent en collision dans une histoire originale et riche en action. Incarnez un Peter Parker aguerri combattant le crime contre des ennemis emblématiques dans le New York de Marvel.",
        "thumbnail": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1817070/header.jpg?t=1763569047",
        "metadata": {
            "steam_appid": 1817070
        }
    },
    {
        "appid": 1086940,
        "name": "Baldur's Gate 3",
        "genres": [
            "RPG",
            "Strategy"
        ],
        "price": 44.99,
        "description": "Constituez votre groupe et retournez aux Royaumes Oubliés dans une histoire d'amitié, de trahison, de sacrifice et de survie, sur fond d'attrait du pouvoir absolu.",
        "thumbnail": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/48a2fcbda8565bb45025e98fd8ebde8a7203f6a0/header.jpg?t=1777363040",
        "metadata": {
            "steam_appid": 1086940
        }
    },
    {
        "appid": 1190460,
        "name": "Death Stranding",
        "genres": [
            "Action",
            "Indie"
        ],
        "price": 19.99,
        "description": "Le légendaire créateur de jeu vidéo Hideo Kojima revient avec une nouvelle expérience unique en son genre. Sam Bridges affronte un monde totalement transformé par le Death Stranding.",
        "thumbnail": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1190460/header.jpg?t=1766014863",
        "metadata": {
            "steam_appid": 1190460
        }
    },
    {
        "appid": 367520,
        "name": "Hollow Knight",
        "genres": [
            "Action",
            "Adventure"
        ],
        "price": 7.39,
        "description": "Choisissez votre destin dans Hollow Knight ! Une aventure épique et pleine d’action, qui vous plongera dans un vaste royaume en ruine peuplé d’insectes et de héros. Dans un monde en 2D classique, dessiné à la main.",
        "thumbnail": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/3c3489495136b26b34f8a9543c7f5645b99d388c/header.jpg?t=1776125684",
        "metadata": {
            "steam_appid": 367520
        }
    },
    {
        "appid": 1145360,
        "name": "Hades",
        "genres": [
            "Action",
            "RPG"
        ],
        "price": 6.12,
        "description": "Défiez le dieu des morts et frayez-vous un chemin hors des Enfers dans ce rogue-like en mode dungeon crawler développé par les créateurs de Bastion, Transistor et Pyre.",
        "thumbnail": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/header.jpg?t=1758127023",
        "metadata": {
            "steam_appid": 1145360
        }
    },
    {
        "appid": 620,
        "name": "Portal 2",
        "genres": [
            "Strategy",
            "Adventure"
        ],
        "price": 1.95,
        "description": "L'« initiative de tests perpétuels » a été étendue pour vous permettre de concevoir des casse-têtes coopératifs pour vous et vos contacts !",
        "thumbnail": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/620/header.jpg?t=1745363004",
        "metadata": {
            "steam_appid": 620
        }
    },
    {
        "appid": 504230,
        "name": "Celeste",
        "genres": [
            "Action",
            "Adventure"
        ],
        "price": 4.74,
        "description": "Aidez Madeline à survivre à ses démons intérieurs au mont Celeste, dans ce jeu de plateformes ultra relevé, réalisé par les créateurs du classique TowerFall. Relevez des centaines de défis faits à la main, découvrez tous les secrets et dévoilez le mystère de la montagne.",
        "thumbnail": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/504230/header.jpg?t=1714089525",
        "metadata": {
            "steam_appid": 504230
        }
    },
    {
        "appid": 782330,
        "name": "Doom Eternal",
        "genres": [
            "FPS",
            "Action"
        ],
        "price": 9.89,
        "description": "Les armées de l'enfer ont envahi la Terre. Incarnez le Slayer dans une campagne en solo où vous terrasserez des démons et arrêterez la destruction de l'humanité. La seule chose qui les effraie... c'est vous.",
        "thumbnail": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/782330/feaf8293bcd2d078422faa547bc0d707c08f606e/header.jpg?t=1781283783",
        "metadata": {
            "steam_appid": 782330
        }
    }
]

REVIEWS_SEED_DATA = [
    {"game_name": "The Witcher 3: Wild Hunt", "rating": 9},
    {"game_name": "Elden Ring", "rating": 10},
    {"game_name": "Red Dead Redemption 2", "rating": 9},
    {"game_name": "GTA V", "rating": 8},
    {"game_name": "Hogwarts Legacy", "rating": 7},
    {"game_name": "Cyberpunk 2077", "rating": 8},
    {"game_name": "God of War", "rating": 9},
    {"game_name": "Marvel's Spider-Man Remastered", "rating": 8},
    {"game_name": "Baldur's Gate 3", "rating": 10},
    {"game_name": "Death Stranding", "rating": 7},
]

def seed_db():
    app = create_app()
    with app.app_context():
        print("Seeding database (consolidated process)...")

        # 1. Clean previous data
        print("- Clearing existing reviews, key stocks, images, and products...")
        Review.query.delete()
        InventoryItem.query.delete()
        ProductImage.query.delete()
        Product.query.delete()
        db.session.commit()

        # 2. Create Genres
        genres = {}
        for name in ["Action", "RPG", "Adventure", "Strategy", "FPS", "Simulation", "Indie"]:
            genre = Genre.query.filter_by(name=name).first()
            if not genre:
                genre = Genre(name=name)
                db.session.add(genre)
            genres[name] = genre
        db.session.commit()
        print("- Genres initialized.")

        # 3. Create Admin User
        ADMIN_FIXED_ID = "00000000-0000-0000-0000-000000000001"
        admin = User.query.filter_by(email="admin@levelup.com").first()
        if not admin:
            admin = User(
                id=ADMIN_FIXED_ID,
                username="admin",
                email="admin@levelup.com",
                password="adminpassword123",
                is_admin=True,
            )
            db.session.add(admin)
            print(f"- Admin user created with FIXED ID: {ADMIN_FIXED_ID}")
        else:
            print("- Admin user already exists.")

        # 4. Create Demo Users
        DEMO_FIXED_USER_ID = "2dbc52c9-47b9-43e4-b870-eb79b793d143"
        existing_demo_reviewer = User.query.filter_by(id=DEMO_FIXED_USER_ID).first()
        if not existing_demo_reviewer:
            reviewer = User(
                id=DEMO_FIXED_USER_ID,
                username="mika.stone",
                email="mika.stone@example.com",
                password="password123",
                is_active=True
            )
            db.session.add(reviewer)
            print(f"- Reviewer demo user created with ID: {DEMO_FIXED_USER_ID}")

        for demo_user in DEMO_USERS:
            if demo_user["email"] == "mika.stone@example.com":
                continue
            existing_user = User.query.filter_by(email=demo_user["email"]).first()
            if not existing_user:
                user = User(
                    username=demo_user["username"],
                    email=demo_user["email"],
                    password=demo_user["password"],
                    is_active=demo_user["is_active"],
                )
                db.session.add(user)
        db.session.commit()
        print("- Demo users created.")

        # 5. Populate products from local Static games data
        products_map = {}
        print("- Populating catalog from static games list...")
        for game in STATIC_GAMES:
            name = game["name"]
            price = game["price"]
            description = game["description"]
            thumbnail = game["thumbnail"]
            metadata = game["metadata"]

            product = Product(
                name=name,
                type="key",
                price=price,
                description=description,
                is_active=True,
                metadata_json=metadata,
            )
            for g_name in game["genres"]:
                product.genres.append(genres[g_name])

            db.session.add(product)
            db.session.flush()
            products_map[name] = product

            if thumbnail:
                db.session.add(ProductImage(product_id=product.id, link=thumbnail, alt_text=f"{name} cover", is_thumbnail=True))

            # Inject stock keys
            quantity = 50 if name == "Doom Eternal" else 5
            for i in range(quantity):
                db.session.add(InventoryItem(
                    product_id=product.id,
                    activation_code=f"STEAM-{name[:4].replace(' ', '').upper()}-{random.randint(1000, 9999)}-{i:03d}"
                ))
            print(f"  → Added product: '{name}'")

        db.session.commit()

        # 6. Seed Reviews
        print("- Seeding reviews...")
        for r_seed in REVIEWS_SEED_DATA:
            game_name = r_seed["game_name"]
            product = products_map.get(game_name)
            if product:
                review = Review(
                    product_id=product.id,
                    user_id=DEMO_FIXED_USER_ID,
                    rating=r_seed["rating"],
                    text="Incredible experience! The delivery was instant and the gameplay is outstanding.",
                )
                db.session.add(review)
        db.session.commit()
        print("- Reviews seeded.")

        # 7. Create Cart for Admin
        if admin:
            cart = Cart.query.filter_by(user_id=admin.id).first()
            if not cart:
                cart = Cart(user_id=admin.id)
                db.session.add(cart)
                db.session.flush()

                # Add two sample items to the cart
                sample_products = Product.query.limit(2).all()
                for i, product in enumerate(sample_products):
                    from app.models import CartItem
                    cart_item = CartItem(
                        cart_id=cart.id,
                        product_id=product.id,
                        quantity=i + 1,
                    )
                    db.session.add(cart_item)
                print(f"- Cart created for admin with {len(sample_products)} items.")
            else:
                print("- Admin cart already exists.")

        db.session.commit()
        print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_db()
