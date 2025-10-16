# Tasks for Project

This is a [Mask](https://github.com/jacobdeichert/mask) file for running project tasks.

## backend

> Build and run backend container from Dockerfile

**OPTIONS**

* container_runtime
    * flags: -c --cont
    * type: string
    * desc: Which container runtime to use
    * choices: podman, docker

~~~bash
CONTAINER_RUNTIME=${container_runtime:-docker}
echo "Building backend container using $CONTAINER_RUNTIME..."
$CONTAINER_RUNTIME build -t backend_image $MASKFILE_DIR/backend
echo "Running backend container..."
$CONTAINER_RUNTIME run --rm -it -p 8000:8000 backend_image
~~~

## frontend

> Start frontend dev server

~~~bash
pushd $MASKFILE_DIR/frontend >/dev/null
echo "Starting frontend..."
npm install
npm run start
popd >/dev/null
~~~

## all

> Run both backend and frontend (backend first)

**OPTIONS**

* container_runtime
    * flags: -c --cont
    * type: string
    * desc: Which container runtime to use
    * choices: podman, docker

~~~bash
CONTAINER_RUNTIME=${container_runtime:-docker}

# Start backend in background
echo "Building backend container..."
$CONTAINER_RUNTIME build -t backend_image $MASKFILE_DIR/backend

echo "Starting backend container in background..."
$CONTAINER_RUNTIME run --rm -d -p 8000:8000 --name backend_temp backend_image

# Start frontend
pushd $MASKFILE_DIR/frontend >/dev/null
echo "Starting frontend..."
npm install
npm run start
popd >/dev/null

# Stop backend when frontend exits
echo "Stopping backend container..."
$CONTAINER_RUNTIME stop backend_temp || true
~~~

