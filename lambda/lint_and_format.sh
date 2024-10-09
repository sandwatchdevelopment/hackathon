#!/bin/bash

# Exit on any error
set -e

# Check if poetry is installed
if ! command -v poetry &> /dev/null; then
    echo "Poetry is not installed. Installing now..."
    curl -sSL https://install.python-poetry.org | python3 -
fi

# Install dependencies including dev dependencies
poetry install

# Run black in check mode
echo "Checking formatting with black..."
poetry run black .

# If black check fails, offer to format the code
if [ $? -ne 0 ]; then
    read -p "Would you like to format the code with black? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Formatting code with black..."
        poetry run black .
    fi
fi

# Run flake8
echo "Running flake8..."
poetry run flake8 .


echo "Linting and formatting check complete!"