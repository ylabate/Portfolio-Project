import sys
import os
import requests
import random

# Add the backend directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from app.models import Product, Genre, ProductImage, InventoryItem

# Predefined games, metadata, and static Steam CDN asset fallbacks
GAMES_TO_ADD = [
    {
        "name": "The Witcher 3: Wild Hunt",
        "description": "The Witcher: Wild Hunt is a story-driven, next-generation open world role-playing game set in a visually stunning fantasy universe full of Witcher choices and impactful consequences.",
        "genres": ["RPG", "Adventure"],
        "price": 29.99,
        "steam_appid": 292030,
        "static_thumb": "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/library_600x900_2x.jpg",
        "static_images": [
            "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/ss_5710298af2318afd9aa72449ef29ac4a2ef64d8e.1920x1080.jpg?t=1768303991",
            "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/ss_0901e64e9d4b8ebaea8348c194e7a3644d2d832d.1920x1080.jpg?t=1768303991",
            "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/ss_112b1e176c1bd271d8a565eacb6feaf90f240bb2.1920x1080.jpg?t=1768303991"
        ]
    },
    {
        "name": "Hollow Knight",
        "description": "Forge your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom of insects and heroes.",
        "genres": ["Action", "Adventure"],
        "price": 14.99,
        "steam_appid": 367520,
        "static_thumb": "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/library_600x900_2x.jpg",
        "static_images": [
            "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/ss_925eb39343af78c0b70a7b461872dfca7682fa08.1920x1080.jpg",
            "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/ss_8e27c1b525049cf12999e09968434cc04144497e.1920x1080.jpg",
            "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/ss_e7a5c18a221f7cbf7170a4843b0c367db5cf8590.1920x1080.jpg"
        ]
    },
    {
        "name": "Hades",
        "description": "Defy the god of the dead as you hack and slash out of the Underworld in this rogue-like dungeon crawler from the creators of Bastion and Transistor.",
        "genres": ["Action", "RPG"],
        "price": 24.99,
        "steam_appid": 1145360,
        "static_thumb": "https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/library_600x900_2x.jpg",
        "static_images": [
            "https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/ss_499616d6c2921c56ef0d8b3c66f7f3a8b4be872b.1920x1080.jpg",
            "https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/ss_a5c7f8a7e3d81b9cfb7f6db0a6e3ee215582f34e.1920x1080.jpg",
            "https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/ss_1a0a52dfdb0d45f3c9fe871fb2d8f99e31dcd885.1920x1080.jpg"
        ]
    },
    {
        "name": "Portal 2",
        "description": "The Single Player portion of Portal 2 introduces a cast of dynamic new characters, a host of fresh puzzle elements, and a much larger set of devious test chambers.",
        "genres": ["Strategy", "Adventure"],
        "price": 9.99,
        "steam_appid": 620,
        "static_thumb": "https://cdn.cloudflare.steamstatic.com/steam/apps/620/library_600x900_2x.jpg",
        "static_images": [
            "https://cdn.cloudflare.steamstatic.com/steam/apps/620/ss_02e088a8d11c015b6d5102ff9eb7ba3cf8a28e7e.1920x1080.jpg",
            "https://cdn.cloudflare.steamstatic.com/steam/apps/620/ss_e1e5eb981604a8b79fca19a008c2a3928a6fdf45.1920x1080.jpg"
        ]
    },
    {
        "name": "Red Dead Redemption 2",
        "description": "Winner of over 175 Game of the Year Awards and recipient of over 250 perfect scores, Red Dead Redemption 2 is an epic tale of honor and loyalty at the dawn of the modern age.",
        "genres": ["Action", "Adventure"],
        "price": 59.99,
        "steam_appid": 1174180,
        "static_thumb": "https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/library_600x900_2x.jpg",
        "static_images": [
            "https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/ss_d79f048d06a92cfadcd70e5b7e9f3b5ffbdff31e.1920x1080.jpg",
            "https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/ss_2b9b78dc830c25a072d93e11aa7501a35ccf1002.1920x1080.jpg",
            "https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/ss_1648a07c0883d6a457c3d25abec625295c52c6f1.1920x1080.jpg"
        ]
    },
    {
        "name": "Celeste",
        "description": "Help Madeline survive her inner demons on her journey to the top of Celeste Mountain, in this super-tight, hand-crafted platformer from the creators of TowerFall.",
        "genres": ["Action", "Adventure"],
        "price": 19.99,
        "steam_appid": 504230,
        "static_thumb": "https://cdn.cloudflare.steamstatic.com/steam/apps/504230/library_600x900_2x.jpg",
        "static_images": [
            "https://cdn.cloudflare.steamstatic.com/steam/apps/504230/ss_0fdf01b97ad8949f2b1d3d6e5d9a0d636cd37e0e.1920x1080.jpg",
            "https://cdn.cloudflare.steamstatic.com/steam/apps/504230/ss_16474f8c440d99fae5e6e386e80b2b8fffa261ee.1920x1080.jpg"
        ]
    },
    {
        "name": "Doom Eternal",
        "description": "Hell’s armies have invaded Earth. Become the Slayer in an epic single-player campaign to conquer demons across dimensions and stop the final destruction of humanity.",
        "genres": ["FPS", "Action"],
        "price": 39.99,
        "steam_appid": 782330,
        "static_thumb": "https://cdn.cloudflare.steamstatic.com/steam/apps/782330/library_600x900_2x.jpg",
        "static_images": [
            "https://cdn.cloudflare.steamstatic.com/steam/apps/782330/ss_8e3c66f44d57ea783457a8e7e174b8ff5a3cc2ff.1920x1080.jpg",
            "https://cdn.cloudflare.steamstatic.com/steam/apps/782330/ss_6c008b8b0e87900b73c21aa5cbfcf7fe2ff1fdf3.1920x1080.jpg",
            "https://cdn.cloudflare.steamstatic.com/steam/apps/782330/ss_171542fca1277a06eeeb4f3c73449b4566c1f1ec.1920x1080.jpg"
        ]
    }
]

def fetch_images_from_steamgriddb(api_key, game_name):
    headers = {"Authorization": f"Bearer {api_key}"}

    # Search for game to get its SteamGridDB ID
    search_url = f"https://www.steamgriddb.com/api/v2/search/autocomplete/game/{requests.utils.quote(game_name)}"
    try:
        res = requests.get(search_url, headers=headers)
        res_data = res.json()
        if not res_data.get("success") or not res_data.get("data"):
            print(f"Game '{game_name}' not found on SteamGridDB.")
            return None, []

        game_id = res_data["data"][0]["id"]
        print(f"Found '{game_name}' on SteamGridDB with ID: {game_id}")
    except Exception as e:
        print(f"Error searching for game '{game_name}': {e}")
        return None, []

    thumbnail_url = None
    other_images = []

    # Fetch grids (for thumbnail vertical cover)
    grids_url = f"https://www.steamgriddb.com/api/v2/grids/game/{game_id}"
    try:
        res = requests.get(grids_url, headers=headers)
        res_data = res.json()
        if res_data.get("success") and res_data.get("data"):
            grids = res_data["data"]
            # Sort by vertical grid (aspect ratio 2:3)
            vertical_grids = [g for g in grids if g.get("width") == 600 or g.get("height") == 900 or g.get("aspect_ratio") == "2:3"]
            if vertical_grids:
                thumbnail_url = vertical_grids[0]["url"]
            else:
                thumbnail_url = grids[0]["url"]

            # Add secondary grids as images
            other_grids = [g["url"] for g in grids if g["url"] != thumbnail_url]
            other_images.extend(other_grids[:2])
    except Exception as e:
        print(f"Error fetching grids: {e}")

    # Fetch heroes (for landscape background screenshots)
    heroes_url = f"https://www.steamgriddb.com/api/v2/heroes/game/{game_id}"
    try:
        res = requests.get(heroes_url, headers=headers)
        res_data = res.json()
        if res_data.get("success") and res_data.get("data"):
            heroes = [h["url"] for h in res_data["data"]]
            other_images.extend(heroes[:3])
    except Exception as e:
        print(f"Error fetching heroes: {e}")

    return thumbnail_url, list(set(other_images))

def populate(api_key=None):
    app = create_app()
    with app.app_context():
        # Ensure genres exist
        genres = {}
        for name in ["Action", "RPG", "Adventure", "Strategy", "FPS", "Simulation"]:
            genre = Genre.query.filter_by(name=name).first()
            if not genre:
                genre = Genre(name=name)
                db.session.add(genre)
            genres[name] = genre
        db.session.commit()

        if api_key:
            print("Populating database using SteamGridDB API search...")
        else:
            print("No SteamGridDB API key provided. Using public Steam Store static asset fallbacks...")

        for game_data in GAMES_TO_ADD:
            name = game_data["name"]

            # Check if product already exists
            existing = Product.query.filter_by(name=name).first()
            if existing:
                print(f"Game '{name}' already exists in database. Updating images and metadata...")
                existing.metadata_json = {"steam_appid": game_data.get("steam_appid")}
                # Remove existing images to update them
                ProductImage.query.filter_by(product_id=existing.id).delete()

                thumbnail = game_data["static_thumb"]
                secondary_images = game_data["static_images"]

                # Add thumbnail
                thumb_img = ProductImage(
                    product_id=existing.id,
                    link=thumbnail,
                    alt_text=f"{name} cover",
                    is_thumbnail=True
                )
                db.session.add(thumb_img)

                # Add secondary screenshots
                for idx, img_url in enumerate(secondary_images):
                    sec_img = ProductImage(
                        product_id=existing.id,
                        link=img_url,
                        alt_text=f"{name} asset {idx + 1}",
                        is_thumbnail=False
                    )
                    db.session.add(sec_img)
                db.session.commit()
                continue

            thumbnail = None
            secondary_images = []

            if api_key:
                thumbnail, secondary_images = fetch_images_from_steamgriddb(api_key, name)

            # If not using API or API fetch failed, use static Steam Store assets
            if not thumbnail:
                thumbnail = game_data["static_thumb"]
                secondary_images = game_data["static_images"]

            product = Product(
                name=name,
                type="key",
                price=game_data["price"],
                description=game_data["description"],
                metadata_json={"steam_appid": game_data.get("steam_appid")}
            )
            for g_name in game_data["genres"]:
                product.genres.append(genres[g_name])

            db.session.add(product)
            db.session.flush() # Generate ID

            # Add thumbnail
            thumb_img = ProductImage(
                product_id=product.id,
                link=thumbnail,
                alt_text=f"{name} cover",
                is_thumbnail=True
            )
            db.session.add(thumb_img)

            # Add secondary screenshots
            for idx, img_url in enumerate(secondary_images):
                sec_img = ProductImage(
                    product_id=product.id,
                    link=img_url,
                    alt_text=f"{name} asset {idx + 1}",
                    is_thumbnail=False
                )
                db.session.add(sec_img)

            # Add stock keys
            quantity = 50 if name == "Doom Eternal" else 5
            for i in range(quantity):
                key = InventoryItem(
                    product_id=product.id,
                    activation_code=f"STEAM-{name[:4].replace(' ', '').upper()}-{random.randint(1000, 9999)}-{i:03d}"
                )
                db.session.add(key)

            print(f"Added game: '{name}' with {len(secondary_images)} screenshots and stock keys.")
            db.session.commit()

        print("Database seeding completed successfully!")

if __name__ == "__main__":
    api_key = os.environ.get("STEAMGRIDDB_API_KEY")
    if not api_key and len(sys.argv) > 1:
        api_key = sys.argv[1]

    populate(api_key)
