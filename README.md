# spark_local_piano

## Agent skills

This repo uses the [pj SDLC skills](https://github.com/Piotr12/pj-sdlc-skills) (v0.2.0), vendored in [.agents/skills/](.agents/skills/). Agents that read the Agent Skills format (including Pi) discover them from `.agents/skills/` automatically.

The ten skills take a GitHub issue from spec to a merged PR:

| Skill | Does |
|---|---|
| `pj-prep-the-repo` | Prepares the repo once: labels, `attachments` branch, scripts, `AGENTS.md` rules, and configs, through a PR. |
| `pj-grill-for-specs-readiness` | Checks an issue against the Definition of Ready and builds the spec. |
| `pj-implement` | Implements a `spec-ready` issue and opens a PR. |
| `pj-review` | Reviews a PR adversarially. |
| `pj-address-review` | Works through the open review threads on a PR. |
| `pj-doctor` | Suggests next actions or diagnoses the project. Changes nothing. |
| `pj-mock-it-up` | Makes mockup variants for a UI change. |
| `pj-decompose` | Splits an issue that is too big into child issues. |
| `pj-repro` | Reproduces a bug with a failing test before the fix. |
| `pj-healthcheck` | Checks repo setup, `attachments`, and `docs/`. Changes nothing. |

To start using them:

1. Install the prerequisites: `gh` logged in, git 2.42 or later, and `gitleaks`.
2. Ask an agent to "prepare this repo for the pj skills" (the `pj-prep-the-repo` skill). It opens a PR with the setup.
3. Review and merge that PR, then use the skills on issues.

See [skills README](.agents/skills/README.md) for sourcing and updates.
