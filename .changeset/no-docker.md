---
'@pmndrs/docs': major
---

Drop Docker. `npx @pmndrs/docs build` does the same build, so the image, the `Dockerfile` and
the publish steps that maintained them are gone. `ghcr.io/pmndrs/docs` stops being pushed —
its existing tags stay in the registry, frozen.

Major because of the git tag, not the inputs: releases force-move `vX`, so anything short of a
major would slide every caller pinning `build.yml@v3` onto the Docker-free workflow. `@v3`
keeps building through the image until its repository moves to `@v4`.

`build.yml` itself keeps every input, every environment variable and the same Pages artifact.
Only the build step changes, and `docker_tag` gives way to `version` — an npm version or range.

The job keeps `id-token: write` — no longer to attest a Docker image, now to sign the npm
publish with trusted publishing.

`preview.sh` builds through the CLI too, and reads its options straight from the environment
rather than forwarding each one into a container.
