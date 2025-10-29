"""
Script to create turf research app structure
Run this from the repository root: python setup_turf_research.py
"""
import os
import re
from pathlib import Path

# Define the base path
BASE_DIR = Path(__file__).parent / "backend" / "apps" / "turf_research"

print("=" * 80)
print("Turf Research App Setup")
print("=" * 80)
print()

# Create directory structure
print("Step 1: Creating directory structure...")
directories = [
    BASE_DIR,
    BASE_DIR / "migrations",
]

for directory in directories:
    directory.mkdir(parents=True, exist_ok=True)
    print(f"  ✅ Created: {directory}")

print()
print("Step 2: Creating Python files from implementation file...")

# Read the implementation file
impl_file = Path(__file__).parent / "TURF_RESEARCH_IMPLEMENTATION.txt"
if not impl_file.exists():
    print(f"  ❌ ERROR: {impl_file} not found!")
    print("     Please ensure TURF_RESEARCH_IMPLEMENTATION.txt exists.")
    exit(1)

with open(impl_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract file sections using regex
file_pattern = r'={79,}\nFILE: (backend/apps/turf_research/[^\n]+)\n={79,}\n(.*?)(?=\n={79,}\n(?:FILE:|MODIFICATIONS)|\Z)'
matches = re.findall(file_pattern, content, re.DOTALL)

files_created = []
for filepath, file_content in matches:
    # Convert to Windows path
    full_path = Path(__file__).parent / filepath.replace('/', os.sep)
    
    # Clean up content (remove leading/trailing whitespace from each line)
    lines = file_content.strip().split('\n')
    cleaned_content = '\n'.join(line.rstrip() for line in lines)
    
    # Handle empty files
    if "(empty file)" in cleaned_content or not cleaned_content.strip():
        cleaned_content = ""
    
    # Write the file
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(cleaned_content)
    
    files_created.append(full_path)
    print(f"  ✅ Created: {full_path}")

print()
print("=" * 80)
print("✅ Setup Complete!")
print("=" * 80)
print()
print("Files created:")
for f in files_created:
    print(f"  • {f}")
print()
print("Next steps:")
print("  1. Run: docker compose exec backend python manage.py makemigrations turf_research")
print("  2. Run: docker compose exec backend python manage.py migrate")
print("  3. Restart: docker compose restart backend")
print()
print("Access the application:")
print("  • Django Admin: http://localhost:8000/admin/")
print("  • REST API: http://localhost:8000/api/turf-research/")
print("  • API Docs: http://localhost:8000/api/swagger/")
print()

