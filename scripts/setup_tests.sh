#!/bin/bash

set -e

# Ask for database repo path
default_path=$(realpath "../fomoed-db")
read -p "Enter the path to your database repository (default: $default_path): " db
db=${db:-$default_path}

# Check if the database repository directory exists
if [ ! -d "$db" ]; then
    echo "Error: Database repository directory '$db' does not exist or is not a directory."
    exit 1
fi

echo "Using database repo path: $db"

# Create a symlink to fomoed-db repo in apps/dashboard
ln -sfn $db ./apps/dashboard/fomoed-db

echo "Symlink created from $db to ./apps/dashboard/fomoed-db"