#!/bin/bash

# Unstage all changes
git reset HEAD -- .

git commit -m "chore: deploy trigger" --allow-empty --no-verify
git push