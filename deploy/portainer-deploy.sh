#!/bin/sh
# Create or update a Portainer standalone (compose) stack, then wait until it runs.
#
# Usage: portainer-deploy.sh <stack-name> <compose-file>
# Env:   PORTAINER_URL, PORTAINER_TOKEN, IMAGE_TAG, PORTAINER_ENDPOINT_ID (default 3)
set -eu

STACK_NAME="$1"
COMPOSE_FILE="$2"
ENDPOINT_ID="${PORTAINER_ENDPOINT_ID:-3}"
API="$PORTAINER_URL/api"

api() {
  # -k: Portainer uses a self-signed certificate
  curl --fail-with-body -sSk -H "X-API-Key: $PORTAINER_TOKEN" -H "Content-Type: application/json" "$@"
}

payload() {
  jq -n --rawfile compose "$COMPOSE_FILE" --arg tag "$IMAGE_TAG" --arg name "$STACK_NAME" \
    '{name: $name, stackFileContent: $compose, env: [{name: "IMAGE_TAG", value: $tag}],
      prune: true, pullImage: true}'
}

STACK_ID=$(api "$API/stacks" | jq -r --arg n "$STACK_NAME" --argjson e "$ENDPOINT_ID" \
  '.[] | select(.Name == $n and .EndpointId == $e) | .Id' | head -n1)

if [ -z "$STACK_ID" ]; then
  echo "Stack '$STACK_NAME' not found: creating it with IMAGE_TAG=$IMAGE_TAG"
  STACK_ID=$(payload | api -X POST --data @- \
    "$API/stacks/create/standalone/string?endpointId=$ENDPOINT_ID" | jq -r '.Id')
else
  echo "Stack '$STACK_NAME' (id $STACK_ID) found: updating to IMAGE_TAG=$IMAGE_TAG"
  payload | api -X PUT --data @- "$API/stacks/$STACK_ID?endpointId=$ENDPOINT_ID" > /dev/null
fi

# Portainer deploys asynchronously: 3 = deploying, 1 = active, 4 = error
echo "Waiting for stack $STACK_ID to be deployed..."
i=0
while :; do
  STATUS=$(api "$API/stacks/$STACK_ID" | jq -c '.DeploymentStatus[-1] // {Status: 0}')
  case $(echo "$STATUS" | jq -r '.Status') in
    1) echo "Stack is active."; break ;;
    4) echo "Deployment failed: $(echo "$STATUS" | jq -r '.Message')"; exit 1 ;;
  esac
  i=$((i + 1))
  [ "$i" -ge 60 ] && { echo "Timeout waiting for deployment: $STATUS"; exit 1; }
  sleep 5
done

# Check that the stack's containers run the expected image tag
CONTAINERS=$(api "$API/endpoints/$ENDPOINT_ID/docker/containers/json?all=1" | jq -c --arg n "$STACK_NAME" \
  '[.[] | select(.Labels["com.docker.compose.project"] == $n) | {name: .Names[0], image: .Image, state: .State}]')
echo "Containers: $CONTAINERS"
echo "$CONTAINERS" | jq -e --arg t ":$IMAGE_TAG" \
  'length > 0 and all(.[]; .state == "running" and (.image | endswith($t)))' > /dev/null \
  || { echo "Containers are not all running the expected tag"; exit 1; }
echo "Deployed $STACK_NAME with tag $IMAGE_TAG."
