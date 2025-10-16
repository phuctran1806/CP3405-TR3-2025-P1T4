# Use official Python 3.10.5 image
FROM python:3.10.5-slim

# Set working directory
WORKDIR /app

# Copy your project files
COPY . /app

# Ensure your script has execute permissions
RUN chmod +x scripts/quickstart.sh

# Run your script
CMD ["./scripts/quickstart.sh"]

