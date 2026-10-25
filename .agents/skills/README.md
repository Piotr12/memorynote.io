# pj SDLC skills

The skills in this folder come from [Piotr12/pj-sdlc-skills](https://github.com/Piotr12/pj-sdlc-skills) (MIT license), vendored from commit `189a062438a44334a941f0a37b5a070100e2ee1a` (v0.2.0).

They are installed together as one set. All of them follow one protocol: `pj-prep-the-repo/reference/protocol.md`.

| Skill | Does |
|---|---|
| `pj-prep-the-repo` | Prepares the repo: labels, the `attachments` branch, scripts in `.pj/scripts/`, `AGENTS.md` rules, and configs, through a PR. Run it once per repo before using the other skills. |
| `pj-grill-for-specs-readiness` | Checks an issue against the Definition of Ready and builds the spec. |
| `pj-implement` | Implements a `spec-ready` issue and opens a PR. |
| `pj-review` | Reviews a PR adversarially. |
| `pj-address-review` | Works through the open review threads on a PR. |
| `pj-doctor` | Suggests next actions or diagnoses project structure. Changes nothing. |
| `pj-mock-it-up` | Makes mockup variants for a UI change. |
| `pj-decompose` | Splits an issue that is too big into child issues. |
| `pj-repro` | Reproduces a bug with a failing test before the fix. |
| `pj-healthcheck` | Checks the repo setup, `attachments`, and `docs/`. Changes nothing. |

To update them, re-copy the `skills/pj-*` folders from the upstream repo into this directory. Keep the set complete; the skills reference each other.
