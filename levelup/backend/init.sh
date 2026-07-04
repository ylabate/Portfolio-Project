#!/bin/sh
set -e

DB="instance/levelup.db"

echo "Vérification du mode d'exécution..."

if [ "$MODE" = "showcase" ] ; then
    echo "Mode showcase"
    rm -rf instance/
    python scripts/init_db.py
    python scripts/seed_db.py
    python scripts/populate_steam_games.py
elif [ "$MODE" = "dev" ] ; then
    echo "Mode dev"
    if [[ -f "$DB" ]]; then
        echo "Existing db nothing changed"
    else
        echo "initialising the db with admin account"
        python scripts/init_db.py
        python scripts/seed_db.py
        python scripts/populate_steam_games.py
    fi
fi

exec "$@"