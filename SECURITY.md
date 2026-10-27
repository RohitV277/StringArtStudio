# Security policy

String Art Studio is a static app. It has no server, no accounts and makes no network requests of its own. Designs are stored on the device.

## Reporting a vulnerability

Please do not open a public issue for security-sensitive reports.
Use GitHub's **Report a vulnerability** button on the repository's **Security** tab (private security advisories), or contact the maintainer privately.
Include the steps to reproduce, the device and browser, and what an attacker could do.

## What counts

- Anything that makes the app send design data off the device
- Script injection through text, project files or stored designs
- Weakening the Content Security Policy in `public/_headers` or `functions/_middleware.ts`

## Our promise

Changes must keep the privacy model: offline first, no tracking, no uploads.
