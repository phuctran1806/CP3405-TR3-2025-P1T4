# Tasks for Project

This is a [Mask](https://github.com/jacobdeichert/mask) file for running project tasks.

## backend

> Build and run backend container from Dockerfile (checks Docker/Podman availability)

**OPTIONS**

* container_runtime
    * flags: -c --cont
    * type: string
    * desc: Which container runtime to use
    * choices: podman, docker
* detached
    * flags: -d --detached
    * type: bool
    * desc: Run backend container in detached mode (for "mask all")

~~~bash
CONTAINER_RUNTIME=${container_runtime:-docker}
CONTAINER_NAME="smartback"

echo "🔍 Checking if $CONTAINER_RUNTIME is running..."
if ! $CONTAINER_RUNTIME info >/dev/null 2>&1; then
  echo "❌ $CONTAINER_RUNTIME is not running. Please start it first."
  exit 1
fi

echo "✅ $CONTAINER_RUNTIME is running."
echo "🏗️  Building backend container..."
$CONTAINER_RUNTIME build -t $CONTAINER_NAME $MASKFILE_DIR/backend

# --- If detached mode, ensure no old container with same name exists ---
if [ "${detached}" = "true" ]; then
  if $CONTAINER_RUNTIME ps -a --format '{{.Names}}' | grep -w "$CONTAINER_NAME" >/dev/null 2>&1; then
    echo "🧹 Removing old container named '$CONTAINER_NAME'..."
    $CONTAINER_RUNTIME rm -f $CONTAINER_NAME >/dev/null 2>&1 || true
  fi

  echo "🚀 Running backend container in detached mode..."
  $CONTAINER_RUNTIME run -d -p 8000:8000 --name $CONTAINER_NAME $CONTAINER_NAME
  echo "✅ Backend container started in background."
else
  echo "🚀 Running backend container interactively..."
  $CONTAINER_RUNTIME run --rm -it -p 8000:8000 --name $CONTAINER_NAME $CONTAINER_NAME
fi
~~~

---

## frontend

> Start frontend dev server (waits for backend readiness)

~~~bash
echo "Starting frontend..."

pushd $MASKFILE_DIR/frontend >/dev/null
npm install
npm run start
popd >/dev/null
~~~

---

## all

> Run both backend and frontend (safe parallel mode + cleanup on exit)

**OPTIONS**

* container_runtime
    * flags: -c --cont
    * type: string
    * desc: Which container runtime to use
    * choices: podman, docker

~~~bash
CONTAINER_RUNTIME=${container_runtime:-docker}
CONTAINER_NAME="smartback"

cleanup() {
  echo ""
  echo "🧹 Cleaning up..."
  echo "Stopping backend container..."
  $CONTAINER_RUNTIME stop $CONTAINER_NAME >/dev/null 2>&1 || true
  echo "✅ Cleanup complete."
  exit 0
}

# --- Trap for SIGINT/SIGTERM ---
trap cleanup SIGINT SIGTERM

echo "=== 🐳 Starting backend (detached mode) ==="
mask backend -c $CONTAINER_RUNTIME -d

echo "=== 💻 Starting frontend (after backend readiness) ==="
mask frontend &

FRONTEND_PID=$!

# Wait for frontend to exit or be interrupted
wait $FRONTEND_PID

# Cleanup when frontend exits
cleanup
~~~
---
