#!/bin/bash
echo "=== Preloader Deployment Status ==="
echo ""
echo "✅ Local Commits:"
git log --oneline -1
echo ""
echo "✅ Files Modified:"
git diff 7b0159d e615410 --name-only
echo ""
echo "✅ Preloader Component Status:"
if [ -f "src/components/Preloader.tsx" ]; then
  echo "  - Preloader.tsx: EXISTS"
  wc -l src/components/Preloader.tsx | awk '{print "  - Lines: " $1}'
fi
echo ""
echo "✅ Build Artifacts:"
ls -lh build/index.html build/assets/*.js 2>/dev/null | head -5
echo ""
echo "📋 To manually deploy to server:"
echo "  ssh u728583244@167.172.158.92 'cd /home/u728583244/animedropzone && git pull origin main && npm run build && cp -r build/* .'"
