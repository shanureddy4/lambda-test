#!/bin/sh

# Create the /tmp/home directory if it doesn't exist
mkdir -p /tmp/home

# Create a symlink for the /home directory
ln -sfn /tmp/home /home

# Ensure you use the absolute path to dist/lambda.js
exec node /var/task/dist/lambda.js
