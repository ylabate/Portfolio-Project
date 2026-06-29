import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from app.models import Review

REVIEWS = [
    {"product_id": "5927f7d6-34f8-4654-b3ca-f92d13d3fdde", "rating": 9},  # Witcher 3
    {"product_id": "03329978-4583-4f48-b6f8-555125a524e6", "rating": 10}, # Elden Ring
    {"product_id": "c7ea12b4-459a-4122-995c-2e6d90d4e611", "rating": 9},  # RDR2
    {"product_id": "2648cb18-9997-49aa-a483-6a9df5e0ca98", "rating": 8},  # GTA V
    {"product_id": "22cf459b-0db4-4a43-b8ee-5e96640e0d3c", "rating": 7},  # Hogwarts
    {"product_id": "33c9bc4f-39d6-480a-a829-5236d3749aa5", "rating": 8},  # Cyberpunk
    {"product_id": "80c57239-2eca-468d-9b00-ff217f0e61b7", "rating": 9},  # God of War
    {"product_id": "b4553abb-a860-45b9-a502-bbec1ab849fe", "rating": 8},  # Spider-Man
    {"product_id": "34e1bf78-233b-4aa2-a0c9-e609d40a7ae8", "rating": 10}, # Baldur's Gate
    {"product_id": "1112d2c8-be4b-42d5-a03a-8a7f3102b011", "rating": 7},  # Death Stranding
]

USER_ID = "2dbc52c9-47b9-43e4-b870-eb79b793d143"  # theo2


def seed_reviews():
    app = create_app()
    with app.app_context():
        print("Ajout des reviews...")
        for r in REVIEWS:
            review = Review(
                product_id=r["product_id"],
                user_id=USER_ID,
                rating=r["rating"],
                text="Super jeu !"
            )
            db.session.add(review)
        db.session.commit()
        print("Reviews ajoutées !")


if __name__ == "__main__":
    seed_reviews()
