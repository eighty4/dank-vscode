#!/bin/bash

TAG=$(npm version patch --no-git-tag-version)

npx -y @eighty4/changelog rollover "$TAG"

git add .
git commit -m "patch release $TAG"
git tag "$TAG"
git push --atomic origin main "$TAG"

sed -i '' '3,6d' CHANGELOG.md

vsce package
vsce publish

rm dank-vscode-*.vsix
git restore CHANGELOG.md
