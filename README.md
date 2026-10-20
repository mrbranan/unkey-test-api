# unkey-test-api

A tiny, dependency-free Node.js API for trying out deploys on [Unkey Compute](https://www.unkey.com/docs/compute/get-started/deploy-from-github).

## Endpoints

| Method | Path | Response |
| --- | --- | --- |
| GET | `/` | Lists the endpoints |
| GET | `/healthz` | `{"status":"ok"}`, for health checks |
| GET | `/hello?name=you` | `{"message":"Hello, you!"}` |
| POST | `/echo` | Echoes the JSON body back |
| GET | `/info` | Uptime and Node version |

The server listens on `$PORT` (Unkey sets this; it defaults to 8080) and exits cleanly on `SIGTERM`.

## Run locally

```bash
npm start
curl localhost:8080/hello?name=Unkey
```

Or with Docker:

```bash
docker build -t unkey-test-api .
docker run -p 8080:8080 unkey-test-api
```

## Deploy on Unkey (from GitHub)

1. In the Unkey dashboard, open **Projects** and choose **Create project**.
2. On **Deploy a new app**, choose **GitHub repository**. If the Unkey GitHub App isn't installed yet, choose **Connect GitHub** and give it access to this repo.
3. Pick `unkey-test-api`. Under build settings, make sure the root `Dockerfile` is selected (Unkey auto-detects it).
4. Choose **Deploy**. When the status reaches `ready`, the app is live at `{project}-{app}-{workspace}.unkey.app`.
5. Optional: under **App settings > Runtime > Health check**, set method `GET` and path `/healthz`.

Pushes to the default branch create production deployments; pushes to other branches create preview deployments.

You need a Compute plan in your Unkey workspace; the dashboard prompts a workspace admin to choose one on first deploy.

## Deploy on Unkey (CLI, prebuilt image)

`unkey deploy` doesn't build; it deploys an image from a public registry:

```bash
docker build -t ghcr.io/<you>/unkey-test-api:latest .
docker push ghcr.io/<you>/unkey-test-api:latest   # package must be public

unkey deploy ghcr.io/<you>/unkey-test-api:latest \
  --project=<project-slug> \
  --root-key=$UNKEY_ROOT_KEY \
  --env=production
```
