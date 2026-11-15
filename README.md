# WikiPulseAngular

This project is a reimplementation of [WikiPulse](https://wikipulse.com/) using the angular framework.
I discovered the usage of a spiral to represent periodic date thanks to this hackernews post :
I liked very much the idea and decided to study it by reimplementing it with a familiar framework. 

## Demo

A demo is available on [spiral.apps.jonathanpastor.fr](https://spiral.apps.jonathanpastor.fr) (short URL: [spiral.jonathanpastor.fr](https://spiral.jonathanpastor.fr)).

## Run the project

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Deployment

The app is a static site: page views come straight from the [Wikimedia REST API](https://wikimedia.org/api/rest_v1/), no backend needed.

On every push to `master`, GitLab CI builds a Docker image (Angular build + `nginx:alpine`, see `Dockerfile`),
pushes it to `registry.gitlab.com/homelab-group/wikipulse_angular` and creates/updates the Portainer stack `spiral`
(`deploy/spiral/docker-compose.yml`, via `deploy/portainer-deploy.sh`). Traefik routes `spiral.apps.jonathanpastor.fr` to it.

Required CI/CD variables: `PORTAINER_URL`, `PORTAINER_TOKEN` (masked, protected).

Local test: `docker build -t spiral . && docker run --rm -p 8080:80 spiral`.

## Contributions

Contributions are welcome!
Do not hesitate to fork this project or to open an issue!
