[![Build](https://github.com/netlify/submit-build-plugin-action/workflows/Build/badge.svg)](https://github.com/netlify/submit-build-plugin-action/actions)

# @netlify/submit-build-plugin-action

## Usage

1. Create a workflow file under `.github/workflows/submit-netlify-plugin.yml`.

Use this example as a reference:

```yaml
name: Submit plugin
on:
  release:
    types: [published]

jobs:
  submit-plugin:
    runs-on: ubuntu-latest
    steps:
      - name: Git checkout
        uses: actions/checkout@v2
      - uses: netlify/submit-build-plugin-action@v1
        with:
          # GitHub token with `public_repo` scope.
          github-token: ${{ secrets.PERSONAL_ACCESS_TOKEN }}
```

## Contributors

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for instructions on how to set up and work on this repository. Thanks
for contributing!
