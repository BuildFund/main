#!/usr/bin/env bash

###############################################################################
# Setup script for BuildFund with MongoDB
#
# This script assumes you have created a virtual environment, installed
# dependencies (including Djongo) and configured your `.env` file with
# DB_ENGINE=djongo and appropriate connection settings.  Running this
# script will generate and apply database migrations against the
# MongoDB database.  It does not drop any existing data.
#
# Usage:
#   ./scripts/setup_mongo.sh
#
# Before running, ensure the following:
#   - You have a running MongoDB instance accessible via DB_HOST and DB_PORT.
#   - Your virtual environment is activated (so `python` points to the
#     correct interpreter with Django and Djongo installed).
#   - The `.env` file contains DB_NAME, DB_USER, DB_PASSWORD if needed.

set -euo pipefail

echo "Applying migrations for MongoDB…"

python manage.py makemigrations
python manage.py migrate

echo "Database setup complete."