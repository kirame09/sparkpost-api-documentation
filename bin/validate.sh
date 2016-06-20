#!/usr/bin/env bash

node ./bin/api-blueprint-validator $1 2>&1 \
  | grep -v "every of its line indented by exactly"

exit 0
