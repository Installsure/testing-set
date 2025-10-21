
SHELL := /bin/bash

.PHONY: dev up down rebuild test e2e postman

dev: up

up:
	cd shared-iac && docker compose build && docker compose up -d

down:
	cd shared-iac && docker compose down

rebuild:
	cd shared-iac && docker compose build --no-cache && docker compose up -d

test:
	bash -c 'for p in 7010 7020 7030 7040 7050 7060 8010; do curl -fsS http://localhost:$$p/healthz || exit 1; done && echo OK'

e2e:
	# Placeholder for Playwright or integration tests
	@echo "Run e2e suite here"

postman:
	@echo "Import postman/InstallSure.postman_collection.json with postman/Local.postman_environment.json"
