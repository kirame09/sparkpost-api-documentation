#!/usr/bin/env bash

node ./bin/api-blueprint-validator $1 2>&1 \
  | grep -v "response payload.*already defined for.*method" \
  | grep -v "every of its line indented by exactly"

exit 0
