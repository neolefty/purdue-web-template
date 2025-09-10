# Test environment for gitops-lite.sh
#
# PURPOSE: This Dockerfile creates a controlled environment to test the gitops-lite.sh
# deployment script. It simulates a production-like server environment to ensure the
# deployment process works correctly before pushing changes to actual servers.
#
# WHEN TO USE: Run this test when making significant changes to:
#   - gitops-lite.sh script logic
#   - Python version handling
#   - Dependency management
#   - Deployment directory structure
#   - First-time setup logic
#
# The test takes ~5 minutes to run but provides confidence that deployments will work.

FROM python:3.11-slim-bookworm

# Install system dependencies (similar to production server)
# These packages match what's typically available on Purdue production servers
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

# Note: Testing multiple Python versions is optional
# The base image (python:3.11-slim-bookworm) already includes Python 3.11
# If you need to test with different Python versions, you can:
# 1. Change the base image (e.g., python:3.12-slim-bookworm)
# 2. Or use pyenv to install multiple versions
# For now, we'll test with the single Python version from the base image

# Create directory structure similar to production
# /opt/apps is the standard deployment directory on production servers
# /home/deployer simulates the deployer user's home directory
RUN mkdir -p /opt/apps /home/deployer/source

# Set working directory
WORKDIR /home/deployer

# Copy the test script
COPY test-in-container.sh /home/deployer/

# Make it executable
RUN chmod +x /home/deployer/test-in-container.sh

# Run the test
CMD ["/home/deployer/test-in-container.sh"]
