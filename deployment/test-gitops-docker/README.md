# GitOps Lite Docker Test Suite

This directory contains a comprehensive test suite for the `gitops-lite.sh` deployment script. The test runs in a Docker container that simulates a production-like environment.

## Purpose

This test suite validates that the gitops-lite.sh deployment script works correctly without requiring access to actual servers. It's particularly important for testing major changes before deploying to production.

## When to Run This Test

Run this test when:
- **Making significant changes to gitops-lite.sh** - Ensures your changes don't break the deployment process
- **Changing Python version handling** - Validates that GITOPS_PYTHON and deploy.conf work correctly
- **Modifying dependency management** - Confirms that requirements.txt changes are detected and applied
- **Updating deployment directory structure** - Verifies files are copied to the right locations
- **Before first production deployment** - Gives confidence the script will work on real servers
- **Debugging deployment issues** - Helps isolate problems in a controlled environment

## How to Run

```bash
# Navigate to the test directory
cd deployment/test-gitops-docker

# Run the test (takes ~5 minutes)
docker-compose -f docker-compose.test.yml up --build

# To run with a specific Python version:
GITOPS_PYTHON=python3.12 docker-compose -f docker-compose.test.yml up --build
```

## What Gets Tested

The test suite validates:

1. **First-time deployment**
   - Virtual environment creation
   - Dependency installation (Django, Gunicorn, etc.)
   - File synchronization to deployment directory
   - Static directory creation

2. **No-change deployments**
   - Should complete in <2 seconds
   - Verifies the script efficiently detects when no updates are needed

3. **Dependency updates**
   - Detects changes to requirements.txt
   - Updates packages in the virtual environment

4. **Python version configuration**
   - Tests reading Python version from deploy.conf
   - Tests GITOPS_PYTHON environment variable override
   - Validates that env var takes precedence over config file

## Test Output

The test provides clear pass/fail indicators:
- ✅ Green checkmarks for passed tests
- ❌ Red X marks for failed tests
- Summary at the end showing total passed/failed

## Troubleshooting

If tests fail:
1. Check the deployment log shown at the end
2. Review the specific test that failed
3. The container environment matches production servers, so failures here likely indicate real issues

## Why This Test Exists

While the gitops-lite.sh script is designed to be robust, deployment scripts are critical infrastructure. This test suite:
- Provides confidence before pushing to production
- Catches issues early in development
- Documents expected behavior
- Serves as a regression test for future changes

## Implementation Notes

- The test creates a fake git repository to simulate the source code
- Frontend building is disabled to speed up tests (set GITOPS_BUILD_FRONTEND=false)
- Email notifications are disabled during testing
- The container includes multiple Python versions to test version selection
