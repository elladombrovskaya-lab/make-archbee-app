# Archbee App

A Make.com custom app (connector) for [Archbee](https://www.archbee.com), covering documents, spaces, space groups, organization export, file upload, OpenAPI sync, and suggested-change review.

## Source of truth

The app is built and lives in Make (`archbee-29shu1`, v1), authored directly via Make's custom-apps API/MCP tooling rather than the VS Code Apps SDK. The [`make-app/`](make-app) directory in this repo is a version-controlled **snapshot** of that app's configuration — useful for review, diffing, and backup — but Make itself remains authoritative. Changes made in Make won't automatically sync here, and vice versa.

## Layout

```
make-app/
  app.json            # app metadata (name, label, theme)
  base.json           # shared baseUrl/headers/error handling, inherited by all modules
  groups.json         # module groupings shown in the scenario builder
  connections/archbee/
    metadata.json      # connection type/label
    parameters.json     # connection form fields (docSpaceId, apiKey)
    api.json            # connection test request
  modules/<moduleName>/
    metadata.json       # label, typeId, description, connection
    communication.json  # the API request (url, method, body, response)
    parameters.json     # mappable parameters (module inputs)
    interface.json       # output field definitions
    samples.json         # sample output data
```

## Auth

Archbee's public API takes a Bearer token computed as `base64(docSpaceId + '~' + apiKey)`. The connection asks for both values separately and Make computes the token via an IML expression in `base.json`.

## Modules

**Documents** — Get, Create, Update, Delete, Search, Import Content
**Spaces** — Create, Update, Publish, Clone, Delete Space; Create/Delete Space Group
**Organization & Files** — Export Organization, Get Display Rules, Upload File, Sync/Info OpenAPI Document, Merge/Discard Suggested Change

## Status

Built and configured in Make; not yet exercised against a live Archbee account. Endpoints where Archbee's own docs didn't expose full response schemas (`organizationDisplayRules`'s nested `rules` field, the binary shape of `organizationExport`) were modeled best-effort and should be verified against real API responses.
