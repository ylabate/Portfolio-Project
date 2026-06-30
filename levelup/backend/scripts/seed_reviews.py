import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from app.models import Review

REVIEWS = [
    {"product_id": "4ad65afa-c459-42d8-931f-8815b2b91552", "rating": 9},  # Witcher 3
    {"product_id": "6d93a114-2524-4d0a-804f-2b6986414319", "rating": 10}, # Elden Ring
    {"product_id": "a93953d9-a70e-45a2-ae35-01ac4f5b6641", "rating": 9},  # RDR2
    {"product_id": "9bfaa232-fcc7-487c-9e02-7e6a1e50b18c", "rating": 8},  # GTA V
    {"product_id": "87fb685d-c9b1-483d-b51f-75eec0422406", "rating": 7},  # Hogwarts
    {"product_id": "773f52b3-b6e1-4ee4-999a-d5ce7bb4a415", "rating": 8},  # Cyberpunk
    {"product_id": "b15fa620-cfcc-430a-b432-d83df498bd0f", "rating": 9},  # God of War
    {"product_id": "bb9b27d6-4d40-4763-98cd-fee0ef2771be", "rating": 8},  # Spider-Man
    {"product_id": "ce93365a-cea4-4a5b-a89a-5e99c7e10acd", "rating": 10}, # Baldur's Gate
    {"product_id": "d472b7f2-82a5-4ae6-9608-e6622d0f170a", "rating": 7},  # Death Stranding
]
USER_ID = "2dbc52c9-47b9-43e4-b870-eb79b793d143"


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
