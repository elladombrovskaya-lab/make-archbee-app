# Archbee App

A Make.com custom app (connector) for [Archbee](https://www.archbee.com), covering documents, spaces, space groups, organization export, file upload, OpenAPI sync, and suggested-change review.

## Source of truth

The app is built and lives in Make (`archbee-shu4-czcwns`, v1), authored directly via Make's custom-apps API/MCP tooling rather than the VS Code Apps SDK. The [`make-app/`](make-app) directory in this repo is a version-controlled **snapshot** of that app's configuration — useful for review, diffing, and backup — but Make itself remains authoritative. Changes made in Make won't automatically sync here, and vice versa.

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
  webhooks/<webhookName>/
    metadata.json       # label, type ("web" = dedicated, not-attached: user pastes the URL into Archbee manually)
    communication.json  # request parsing/validation for incoming webhook calls (empty: passthrough, no signature check)
    parameters.json     # webhook-specific config fields (none currently)
```

## Auth

Archbee's public API takes a Bearer token computed as `base64(docSpaceId + '~' + apiKey)`. The connection asks for both values separately and Make computes the token via an IML expression in `base.json`.

## Modules

**Documents** — Get, Create, Update, Delete, Search, Import Content, Update Tags in a Document
**Spaces** — Create, Update, Publish, Clone, Delete Space; Create/Delete Space Group
**Organization & Files** — Export Organization, Get Display Rules, Upload File, Sync/Info OpenAPI Document, Merge/Discard Suggested Change
**Webhooks** — Watch Events (instant trigger; paste the generated URL and pick events directly in Archbee's own webhook settings)

## Update Tags in a Document

A special module (`updateDocumentTags`) that finds `{{tag}}` placeholders in a document's content and lets you fill in replacement values one field at a time — any field left blank leaves that tag untouched in the document.

- The `documentTagFields` RPC fetches the document (by `docId`, in markdown format) and uses the `extractTags` IML function to scan its content for `{{...}}` placeholders, generating one dynamic text field per unique tag found.
- The module itself runs two chained requests: a GET to fetch the current content, then a POST that calls the `applyTagValues` IML function to substitute only the tags with a non-empty value before saving.
- Assumes tags are simple tokens (e.g. `{{customer_name}}`) written in the document's markdown content — tags containing punctuation other than letters/digits/underscore, or only present in other formats (HTML/JSON/source), aren't covered by this implementation.

## Webhooks

`archbeeWebhook` is a dedicated, not-attached webhook — Archbee has no API to register/list/delete webhook subscriptions, so the user copies the URL Make generates and pastes it into Archbee's own webhook settings, picking events there too. No signature verification: Archbee's webhook signing key (if any) is account-wide and not required to validate incoming calls. The `watchEvents` instant trigger has a deliberately open/dynamic output (empty `interface`) since payload shape varies by event type and wasn't available from Archbee's docs.

## Status

Deployed to and live-tested against `archbee-shu4-czcwns`. Verifying `getDocument` surfaced two real bugs, both fixed and confirmed against Archbee's public API docs:
- GET requests were passing parameters via `body`, which Make silently drops for GET — moved to `qs` (`getDocument`, `organizationExport`, `infoApiReference`, `organizationDisplayRules`, and the first step of `updateDocumentTags` + the `documentTagFields` RPC).
- `getDocument`'s output mapped the raw response directly instead of wrapping it in the declared `{content, format}` object.
- By pattern-matching against sibling modules with identical response shapes, also fixed `deleteDocument`, `discardSuggestedChange`, `mergeSuggestedChange`, and `importContent`, which used unwrapped `{{body}}` while every structurally identical sibling module uses `{{body.data}}`.

Still unverified: `infoApiReference` and `organizationDisplayRules` show the same bare-`{{body}}`-output pattern as the modules above, but have no sibling GET endpoint to cross-check against — flagged for live testing rather than guessed.

Custom IML functions (`extractTags`, `applyTagValues`) are blocked account-wide with "Access denied" — confirmed across multiple apps and both MCP and the VS Code extension, so it's an account/org-level restriction pending Make support enabling it. `updateDocumentTags` and `documentTagFields` exist as empty stubs on the live app until then.
