COMPOSE := $(shell docker compose version >/dev/null 2>&1 && printf 'docker compose' || printf 'docker-compose')

dev:
	$(COMPOSE) up --build
showcase:
	$(COMPOSE) -f docker-compose-showcase.yml up --build
kill:
	$(COMPOSE) down -v