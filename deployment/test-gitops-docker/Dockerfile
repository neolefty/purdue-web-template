# Test environment for gitops-lite.sh
FROM python:3.11-slim-bookworm

# Install system dependencies (similar to production server)
RUN apt-get update && apt-get install -y \
    git \
    rsync \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    nodejs \
    npm \
    postgresql-client \
    sendmail \
    && rm -rf /var/lib/apt/lists/*

# Create directory structure similar to production
RUN mkdir -p /opt/apps /home/deployer/source

# Set working directory
WORKDIR /home/deployer

# Copy the test script
COPY test-in-container.sh /home/deployer/

# Make it executable
RUN chmod +x /home/deployer/test-in-container.sh

# Run the test
CMD ["/home/deployer/test-in-container.sh"]
