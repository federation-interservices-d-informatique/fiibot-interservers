#!/usr/bin/env bash
DIRNAME="$(dirname $0)"

$DIRNAME/changelog.sh > "${GITHUB_WORKSPACE}/changelog.txt"
