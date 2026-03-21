# Running tests

Tests must be run in `.cjs`, so the `test` directory sources are all `.cts` files.

Any updates to `lib` or `test` requires running the `build:test` script.

```shell
pnpm build:test && pnpm test
```

## Running a subcategory of tests

The `vscode-test` runner can run roups of tests with the `--label` param matching the test group labels in `.vscode-test.js`.

```shell
pnpm test --label checkDependency
```
