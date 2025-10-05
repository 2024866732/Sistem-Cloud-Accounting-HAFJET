#!/usr/bin/env python3
"""
Validate all GitHub workflow YAML files under .github/workflows.
Exits with code 0 when all files parse successfully, otherwise exits with 1.
"""
import glob
import sys
import yaml

files = glob.glob('.github/workflows/*.yml') + glob.glob('.github/workflows/*.yaml')
if not files:
    print('No workflow files found; nothing to validate.')
    sys.exit(0)

had_error = False
for f in files:
    try:
        with open(f, 'r', encoding='utf-8') as fh:
            # Load all documents to catch multi-doc YAML issues
            list(yaml.safe_load_all(fh))
    except Exception as e:
        print(f'ERROR parsing {f}: {e}', file=sys.stderr)
        had_error = True

if had_error:
    sys.exit(1)

print('All workflow YAML files parsed successfully.')
