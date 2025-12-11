#!/bin/bash

# Put .env from root and symlink to server/.env
if [ ! -f .env ]; then
  echo "No .env file found"
  exit 1
fi

if [ ! -f server/.env ]; then
  ln -s .env server/.env
  echo "Linked .env to server/.env"

  ln -s .env bot/.env
  echo "Linked .env to bot/.env"
fi
