# Use official Python 3.10.5 image
FROM python:3.10.5-slim

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Copy only dependency files first to leverage Docker layer caching
COPY requirements.txt /app/requirements.txt

# Create virtual environment and install dependencies
RUN python -m venv /opt/venv \
 && /opt/venv/bin/pip install --upgrade pip \
 && /opt/venv/bin/pip install -r requirements.txt

# Add venv to PATH so all subsequent commands use it
ENV PATH="/opt/venv/bin:$PATH"

# Now copy the rest of your project
COPY . /app

# Ensure your script has execute permissions
RUN chmod +x scripts/quickstart.sh

CMD ["./scripts/quickstart.sh"]

