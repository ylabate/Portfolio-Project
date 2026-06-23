import sys
import os

# Ajoute le dossier parent au path pour pouvoir importer app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from flask_jwt_extended import create_access_token

def generate_test_token(user_id):
    """Génère un token JWT valide pour un user_id donné"""
    # 1. On crée une instance de l'application Flask
    app = create_app()
    
    # On s'assure qu'une clé secrète est définie pour JWT
    if not app.config.get("JWT_SECRET_KEY"):
        app.config["JWT_SECRET_KEY"] = "clé super secrète"
    
    # 2. On a besoin du "contexte d'application" pour utiliser flask_jwt_extended
    with app.app_context():
        # 4. On génère le token sans expiration pour faciliter les tests
        access_token = create_access_token(identity=user_id, expires_delta=False)

        
        print("\n" + "="*50)
        print(f"Token généré pour user_id : {user_id}")
        print("="*50)
        print(f"Bearer {access_token}")
        print("="*50 + "\n")
        print("Copiez la ligne 'Bearer ...' et mettez-la dans le header Authorization de votre requête.")

if __name__ == "__main__":
    # Si vous passez un argument, il l'utilise, sinon il prend "test-user-123"
    test_user_id = "00000000-0000-0000-0000-000000000001"
    if len(sys.argv) > 1:
        test_user_id = sys.argv[1]
        
    generate_test_token(test_user_id)
