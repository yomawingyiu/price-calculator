#!/bin/bash
export PATH="/Users/ym/.local/bin:$PATH"
eval "$(fnm env)"
fnm use 24.14.1
cd /Users/ym/projects/price-calculator
npx vite --host
