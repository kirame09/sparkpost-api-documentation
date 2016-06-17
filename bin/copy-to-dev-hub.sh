#!/usr/bin/env bash

# get docs revision
DOCS_REVISION=`git rev-parse --short HEAD`

# check out the dev hub code
[ -d devhub ] && rm -rf devhub
if env | grep -q ^TRAVIS=; then
  git clone --branch develop https://${GIT_NAME}:${GH_TOKEN}@github.com/SparkPost/sparkpost.github.io.git devhub || exit 255
else
  git clone --branch develop git@github.com:SparkPost/sparkpost.github.io.git devhub || exit 255
fi
echo ""

# generate the static files
echo "Generating static files from docs..."
grunt static --output devhub/_api/ || exit 255
echo ""

# output the status
cd devhub
git status --untracked
echo ""

# if this is run in Travis CI, make some magic
if env | grep -q ^TRAVIS=; then
  # no need to proceed if this is a PR build
  if [[ $TRAVIS_PULL_REQUEST -gt 0 ]]; then
    echo "Pull request detected. Not proceeding with deploy."
    exit 255
  fi

  # Configure git
  git config --global user.name ${GIT_NAME} || exit 255
  git config --global user.email ${GIT_EMAIL} || exit 255
  git config --global push.default simple || exit 255

  # commit the code
  git add --all . || exit 255
  git commit -m "API docs build SparkPost/sparkpost-api-documentation@${DOCS_REVISION}" || exit 255
  git push origin develop || exit 255
fi

