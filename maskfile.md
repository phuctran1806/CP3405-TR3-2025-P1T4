# Tasks for Project

This is a [Mask](https://github.com/jacobdeichert/mask) file for running project tasks.

---

## backend

> Build and run backend + nginx containers from backend/docker-compose.yml

**OPTIONS**

* container_runtime
    * flags: -c --cont
    * type: string
    * desc: Which container runtime to use
    * choices: podman, docker
* detached
    * flags: -d --detached
    * type: bool
    * desc: Run containers in detached mode (for "mask all")

~~~bash
CONTAINER_RUNTIME=${container_runtime:-docker}
BACKEND_DIR="$MASKFILE_DIR/backend"
COMPOSE_FILE="$BACKEND_DIR/docker-compose.yaml"

echo "🔍 Checking if $CONTAINER_RUNTIME is running..."
if ! $CONTAINER_RUNTIME info >/dev/null 2>&1; then
  echo "❌ $CONTAINER_RUNTIME is not running. Please start it first."
  exit 1
fi

echo "✅ $CONTAINER_RUNTIME is running."
echo "🏗️  Building backend + nginx containers..."

if [ "${detached}" = "true" ]; then
  echo "🚀 Starting in detached mode..."
  $CONTAINER_RUNTIME compose -f $COMPOSE_FILE up --build -d
  echo "✅ Backend and Nginx are running in the background."
else
  echo "🚀 Starting interactively (logs visible)..."
  $CONTAINER_RUNTIME compose -f $COMPOSE_FILE up --build
fi

~~~

---

## stop

> Stop and remove all running containers (backend + nginx)

**OPTIONS**

* container_runtime
    * flags: -c --cont
    * type: string
    * desc: Which container runtime to use
    * choices: podman, docker

~~~bash
CONTAINER_RUNTIME=${container_runtime:-docker}
BACKEND_DIR="$MASKFILE_DIR/backend"
COMPOSE_FILE="$BACKEND_DIR/docker-compose.yaml"

echo "🧹 Stopping all containers..."
$CONTAINER_RUNTIME compose -f $COMPOSE_FILE down
echo "✅ All containers stopped and cleaned up."
~~~

---

## frontend

> Start frontend dev server

~~~bash
echo "Starting frontend..."

pushd "$MASKFILE_DIR/frontend" >/dev/null
npm install
npm run start
popd >/dev/null
~~~

---

## all

> Run backend (with Nginx) + frontend together, safe parallel mode + cleanup on exit

**OPTIONS**

* container_runtime
    * flags: -c --cont
    * type: string
    * desc: Which container runtime to use
    * choices: podman, docker

~~~bash
CONTAINER_RUNTIME=${container_runtime:-docker}

cleanup() {
  echo ""
  echo "🧹 Cleaning up..."
  mask stop -c $CONTAINER_RUNTIME
  echo "✅ Cleanup complete."
  exit 0
}

trap cleanup SIGINT SIGTERM

echo "=== 🐳 Starting backend + nginx (detached mode) ==="
mask backend -c $CONTAINER_RUNTIME -d

echo "=== 💻 Starting frontend ==="
mask frontend &

FRONTEND_PID=$!
wait $FRONTEND_PID
cleanup
~~~

