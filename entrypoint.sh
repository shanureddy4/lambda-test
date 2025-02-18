#!/bin/sh
mkdir -p /tmp/home
ln -sfn /tmp/home /home  
exec node dist/lambda.js  
