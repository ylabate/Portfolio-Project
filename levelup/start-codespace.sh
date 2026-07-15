#!/bin/bash

# Exit on error
set -e

echo "=== Démarrage de l'environnement natif Codespaces ==="

# Se positionner dans le dossier levelup si on est à la racine
cd "$(dirname "$0")"

# 1. Configurer le Backend
echo "--> Configuration du Backend..."
cd backend
pip install -r requirements.txt

# Initialiser la base de données si elle n'existe pas
if [ ! -f "instance/levelup.db" ]; then
    echo "--> Initialisation de la base de données SQLite..."
    python scripts/init_db.py
    python scripts/seed_db.py
fi

# Lancer Flask en arrière-plan
echo "--> Lancement du serveur Backend Flask (port 5000)..."
python run.py > flask.log 2>&1 &

# 2. Configurer le Frontend
echo "--> Configuration du Frontend..."
cd ../frontend
npm install

# Lancer Vite en arrière-plan
echo "--> Lancement du serveur Frontend React (port 5173)..."
npm run dev > vite.log 2>&1 &

echo "=== Tout est lancé avec succès ! ==="
