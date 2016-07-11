#!/usr/bin/env bash

node ./bin/api-blueprint-validator $1 2>&1 \
  | grep -Ev "every of its line indented by exactly|response payload \`[0-9]*\` already defined for"

exit 0
