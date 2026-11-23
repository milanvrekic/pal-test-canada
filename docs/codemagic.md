# Building the Play release on Codemagic

`codemagic.yaml` (repository root) builds the signed Android App Bundle in the cloud and uploads it to Google Play's
internal testing track. It's set up the same way as Huntable's. GitHub Actions keeps checking that every push to main
still builds; Codemagic is for releases.

## Set up once

1. **Add the app.** Codemagic → Apps → Add application → GitHub → `milanvrekic/pal-test-canada`. Choose
   "codemagic.yaml" as the configuration (not the Workflow Editor).
2. **Upload keystore.** Team settings → codemagic.yaml settings → Code signing identities → Android keystores → upload
   `pal-test-upload.jks` (from `pal-test-android-upload-key.zip`). Reference name: `paltest_upload`. The keystore
   password, key alias (`pal-test-upload`) and key password are in that zip's `README.txt`.
3. **Google Play access.** The `google_play` group (`GCLOUD_SERVICE_ACCOUNT_CREDENTIALS`) already exists for Huntable;
   if it's a team-level group, PAL Test uses it as is. If it was added to the Huntable app only, add the same group to
   this app too. Then give the same service account access to PAL Test: Play Console → Users and permissions → the
   service account → App permissions → add PAL Test Canada → Release to testing tracks (and View app information).
4. **First upload by hand.** Google Play only accepts uploads through its API once the app has one build. Start
   `paltest-android-bundle-only` by hand (branch `main`): it builds and signs the bundle without uploading it, and
   doesn't need the Play key. Download the `.aab` from the build's Artifacts. Upload that file yourself in Play Console → Test and release → Testing → Internal testing → Create new
   release, and accept Play App Signing when asked. Every build after that uploads by itself.
5. **Check access (optional).** Start `paltest-play-access-check` by hand: it shows which service account is loaded and
   whether it can see `ca.paltest.app`.

## Each release

Push a version tag from `main`; Codemagic starts by itself:

```
git tag v1.0.1 && git push origin v1.0.1
```

(Or on GitHub: Releases → Draft a new release → tag `v1.0.1` → target `main` → Publish.) The tag sets the version
name. A hand-started build uses the `version` in `app/app.json`.

It compiles the approved content, generates the Android project, sets the version code to the higher of Google Play's
latest + 1 and Codemagic's build number + 10, signs with the upload key, sends the bundle to Internal testing and emails
the result.

Uploads go in as drafts (`submit_as_draft: true`) because Google Play only accepts drafts until the app is published.
After the first production release, change it to `false` so each build goes straight out to internal testers.
