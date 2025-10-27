#!/bin/bash

set -e

echo "📚 Building geodrive documentation..."
cd "$(dirname "$0")/../../"
cd "docs"
make html

echo "✅ Documentation built successfully!"
echo "📁 Open: docs/_build/html/index.html"