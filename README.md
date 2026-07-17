# Archbee App

A Make.com custom app (connector) for [Archbee](https://www.archbee.com), covering documents, spaces, space groups, organization export, file upload, OpenAPI sync, and suggested-change review.

## Source of truth

The app is built and lives in Make (`archbee-29shu2-8bgd1w`, v1), authored directly via Make's custom-apps API/MCP tooling rather than the VS Code Apps SDK. The [`make-app/`](make-app) directory in this repo is a version-controlled **snapshot** of that app's configuration — useful for review, diffing, and backup — but Make itself remains authoritative. Changes made in Make won't automatically sync here, and vice versa.

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
    communication.json  # the API request (url, method, body, response) or an array of requests
    parameters.json     # mappable parameters (module inputs)
    interface.json       # output field definitions
    samples.json         # sample output data
  rpcs/<rpcName>/
    metadata.json       # label, connection
    parameters.json     # RPC input parameters (e.g. docId passed in from the calling module)
    api.json            # the API request + response.iterate mapping used to generate dynamic fields
  functions/<functionName>/
    code.js             # custom IML function body
    test.js              # sample invocation used to test the function in the Make editor
```

## Auth

Archbee's public API takes a Bearer token computed as `base64(docSpaceId + '~' + apiKey)`. The connection asks for both values separately and Make computes the token via an IML expression in `base.json`.

## Modules

**Documents** — Get, Create, Update, Delete, Search, Import Content, Update Tags in a Document
**Spaces** — Create, Update, Publish, Clone, Delete Space; Create/Delete Space Group
**Organization & Files** — Export Organization, Get Display Rules, Upload File, Sync/Info OpenAPI Document, Merge/Discard Suggested Change

## Update Tags in a Document

A special module (`updateDocumentTags`) that finds `{{tag}}` placeholders in a document's content and lets you fill in replacement values one field at a time — any field left blank leaves that tag untouched in the document.

- The `documentTagFields` RPC fetches the document (by `docId`, in markdown format) and uses the `extractTags` IML function to scan its content for `{{...}}` placeholders, generating one dynamic text field per unique tag found.
- The module itself runs two chained requests: a GET to fetch the current content, then a POST that calls the `applyTagValues` IML function to substitute only the tags with a non-empty value before saving.
- Assumes tags are simple tokens (e.g. `{{customer_name}}`) written in the document's markdown content — tags containing punctuation other than letters/digits/underscore, or only present in other formats (HTML/JSON/source), aren't covered by this implementation.

## Status

Built and configured in Make; not yet exercised against a live Archbee account. Endpoints where Archbee's own docs didn't expose full response schemas (`organizationDisplayRules`'s nested `rules` field, the binary shape of `organizationExport`) were modeled best-effort and should be verified against real API responses.
