import sys
import os
import requests

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.config import STEAM_API_BASE_URL
from app.models import Product, Genre, ProductImage
from app import create_app, db

STEAM_GAMES = [
    {"appid": 292030, "name": "The Witcher 3: Wild Hunt", "genres": ["RPG", "Action"]},
    {"appid": 1245620, "name": "Elden Ring", "genres": ["RPG", "Action"]},
    {"appid": 1174180, "name": "Red Dead Redemption 2", "genres": ["Action"]},
    {"appid": 271590, "name": "GTA V", "genres": ["Action"]},
    {"appid": 990080, "name": "Hogwarts Legacy", "genres": ["RPG", "Action"]},
    {"appid": 1091500, "name": "Cyberpunk 2077", "genres": ["RPG", "Action"]},
    {"appid": 1593500, "name": "God of War", "genres": ["Action"]},
    {"appid": 1817070, "name": "Marvel's Spider-Man Remastered", "genres": ["Action"]},
    {"appid": 1086940, "name": "Baldur's Gate 3", "genres": ["RPG", "Strategy"]},
    {"appid": 1190460, "name": "Death Stranding", "genres": ["Action", "Indie"]},
]


def fetch_steam_data(appid):
    url = f"{STEAM_API_BASE_URL}/appdetails?appids={appid}&cc=fr&l=french"
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        if data[str(appid)]["success"]:
            return data[str(appid)]["data"]
    except Exception as e:
        print(f"Erreur Steam pour appid {appid}: {e}")
    return None


def seed_steam():
    app = create_app()
    with app.app_context():
        print("Suppression des anciens produits...")
        ProductImage.query.delete()
        Product.query.delete()
        db.session.commit()
        print("- Anciens produits supprimés.")
        print("Seeding produits depuis Steam...")

        for game in STEAM_GAMES:
            appid = game["appid"]
            print(f"  → {game['name']} (appid {appid})")

            # Vérifie si le produit existe déjà
            existing = Product.query.filter_by(name=game["name"]).first()
            if existing:
                print(f"    Déjà en base, on passe.")
                continue

            steam_data = fetch_steam_data(appid)
            if not steam_data:
                print(f"    Impossible de récupérer les données Steam.")
                continue

            # Prix
            price_data = steam_data.get("price_overview")
            price = price_data["final"] / 100.0 if price_data else 19.99
            initial_price = price_data["initial"] / 100.0 if price_data else price
            discount_percent = price_data["discount_percent"] if price_data else 0

            # Description
            description = steam_data.get("short_description", "")

            # Image header
            thumbnail = steam_data.get("header_image", "")

            # Configurations système
            pc_requirements = steam_data.get("pc_requirements", {})

            # Créer le produit
            product = Product(
                name=game["name"],
                type="key",
                price=price,
                description=description,
                is_active=True,
                metadata_json={
                    "steam_appid": appid,
                    "initial_price": initial_price,
                    "discount_percent": discount_percent,
                    "pc_requirements_min": pc_requirements.get("minimum", ""),
                    "pc_requirements_rec": pc_requirements.get("recommended", ""),
                },
            )

            # Genres
            for genre_name in game["genres"]:
                genre = Genre.query.filter_by(name=genre_name).first()
                if not genre:
                    genre = Genre(name=genre_name)
                    db.session.add(genre)
                product.genres.append(genre)

            db.session.add(product)
            db.session.flush()

            # Image thumbnail
            if thumbnail:
                image = ProductImage(
                    product_id=product.id,
                    link=thumbnail,
                    alt_text=f"{game['name']} cover",
                    is_thumbnail=True,
                )
                db.session.add(image)

        db.session.commit()
        print("Seeding Steam terminé !")


if __name__ == "__main__":
    seed_steam()
