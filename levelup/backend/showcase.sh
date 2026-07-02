#!/bin/sh
set -e

echo "Vérification du mode d'exécution..."

if [ "$MODE" = "showcase" ] ; then
    echo "Mode SHOWCASE détecté : Réinitialisation de la base de données..."
    rm -rf instance/
    python scripts/init_db.py
    python scripts/seed_db.py
    python scripts/populate_steam_games.py
else
    echo "Mode standard : Saut de la phase d'initialisation."
fi

exec "$@"