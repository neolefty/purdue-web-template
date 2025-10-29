# copilot-instructions.md

# GitHub Copilot Instructions

include the 'CLAUDE.md' file in the repository root for more information this repository's guidelines for using AI tools.

# When generating code, ensure that:

# 1. The code adheres to the project's coding style and conventions.

# 2. The code is well-documented and includes comments where necessary.

# 3. The code is efficient and optimized for performance.

# 4. The code is thoroughly tested and includes unit tests where applicable.

# 5. For coordinate handling, ensure:

    - DecimalField(max_digits=12, decimal_places=8) for longitude
    - DecimalField(max_digits=11, decimal_places=8) for latitude
    - Added comprehensive validation before using coordinates
    - Checks: isFinite(), proper type, within valid ranges (-90 to 90, -180 to 180)
    - Prevents map.panTo() crashes with invalid data
    - Handles string coordinates from API responses

# 6. When working with user input or external data, ensure proper validation and sanitization to prevent security vulnerabilities.
