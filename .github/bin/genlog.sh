#!/usr/bin/env bash
DIRNAME="$(dirname $0)"

$DIRNAME/changelog.sh > "/home/runner/changelog.txt"
