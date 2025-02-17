#!/usr/bin/bash

IPINFO_TOKEN_SECRET_FILE="/run/secrets/ipinfo_token_file"
if [ ! -f $IPINFO_TOKEN_SECRET_FILE ]; then
  echo "Error: $IPINFO_TOKEN_SECRET_FILE does not exist!" >&2
  exit 1  # Exit with an error code
elif [ ! -s $IPINFO_TOKEN_SECRET_FILE ]; then
  echo "Error: $IPINFO_TOKEN_SECRET_FILE is empty!" >&2
  exit 1  # Exit with an error code
else
  # File exists and is not empty, read the content into the variable
  export IPINFO_TOKEN=$(cat $IPINFO_TOKEN_SECRET_FILE)
fi

echo "Launching wrench-daemon..."
wrench-daemon --num-commports 50000 &

echo "Launching uvicorn..."
uvicorn src.main:app --host 0.0.0.0 --port 8081  --reload




