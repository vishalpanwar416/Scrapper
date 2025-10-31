#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        SCRAPPER APPLICATION - DIAGNOSTIC TOOL                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check 1: Backend Server
echo -e "${YELLOW}[1/6]${NC} Checking Backend Server (Port 5000)..."
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo -e "${GREEN}✓${NC} Backend is running"
else
    echo -e "${RED}✗${NC} Backend is NOT running"
    echo "  Fix: Run 'cd backend && npm run dev'"
fi
echo ""

# Check 2: Frontend Server
echo -e "${YELLOW}[2/6]${NC} Checking Frontend Server (Port 3001)..."
if curl -s http://localhost:3001 > /dev/null; then
    echo -e "${GREEN}✓${NC} Frontend is running"
else
    echo -e "${RED}✗${NC} Frontend is NOT running"
    echo "  Fix: Run 'cd frontend && npm run dev'"
fi
echo ""

# Check 3: API Connectivity
echo -e "${YELLOW}[3/6]${NC} Checking API Websites Endpoint..."
WEBSITES=$(curl -s http://localhost:5000/api/websites 2>/dev/null | head -c 50)
if [[ ! -z "$WEBSITES" ]]; then
    echo -e "${GREEN}✓${NC} Websites API is responding"
    WEBSITE_COUNT=$(curl -s http://localhost:5000/api/websites 2>/dev/null | grep -o '"name"' | wc -l)
    echo "  Found $WEBSITE_COUNT websites"
else
    echo -e "${RED}✗${NC} Websites API is not responding"
fi
echo ""

# Check 4: Products Data
echo -e "${YELLOW}[4/6]${NC} Checking Products Endpoint..."
PRODUCTS_RESPONSE=$(curl -s http://localhost:5000/api/products?limit=1 2>/dev/null)
if [[ ! -z "$PRODUCTS_RESPONSE" ]]; then
    echo -e "${GREEN}✓${NC} Products API is responding"
    TOTAL_PRODUCTS=$(echo $PRODUCTS_RESPONSE | grep -o '"total":[0-9]*' | head -1 | cut -d: -f2)
    echo "  Total products in database: $TOTAL_PRODUCTS"

    if [ "$TOTAL_PRODUCTS" == "0" ]; then
        echo -e "${YELLOW}!${NC} Warning: No products in database. You may need to run scraping."
    fi
else
    echo -e "${RED}✗${NC} Products API is not responding"
fi
echo ""

# Check 5: Scraper Status
echo -e "${YELLOW}[5/6]${NC} Checking Last Scrape Status..."
LAST_SCRAPE=$(curl -s http://localhost:5000/api/websites 2>/dev/null | grep -o '"lastScrapedAt":"[^"]*"' | head -1)
if [[ ! -z "$LAST_SCRAPE" ]]; then
    echo -e "${GREEN}✓${NC} Websites have been scraped"
    echo "  $LAST_SCRAPE"
else
    echo -e "${YELLOW}!${NC} No scrape history found"
fi
echo ""

# Check 6: Frontend API Configuration
echo -e "${YELLOW}[6/6]${NC} Checking Frontend API Configuration..."
if [ -f "frontend/.env.local" ]; then
    echo -e "${GREEN}✓${NC} .env.local file exists"
    cat frontend/.env.local | sed 's/^/  /'
else
    echo -e "${YELLOW}!${NC} .env.local file not found"
    echo "  Expected: frontend/.env.local with NEXT_PUBLIC_API_URL"
fi
echo ""

# Summary
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}DIAGNOSTIC SUMMARY${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "To fix common issues:"
echo ""
echo "1. If Backend is not running:"
echo "   ${YELLOW}cd /home/vishal/Development/Scrapper/backend${NC}"
echo "   ${YELLOW}npm run dev${NC}"
echo ""
echo "2. If Frontend is not running:"
echo "   ${YELLOW}cd /home/vishal/Development/Scrapper/frontend${NC}"
echo "   ${YELLOW}npm run dev${NC}"
echo ""
echo "3. If no products are showing:"
echo "   - Open http://localhost:3001 in browser"
echo "   - Go to Websites page"
echo "   - Click the green Play button to scrape"
echo "   - Wait for scraping to complete"
echo "   - Check Products page"
echo ""
echo "4. For detailed troubleshooting:"
echo "   ${YELLOW}cat /home/vishal/Development/Scrapper/TROUBLESHOOTING_GUIDE.md${NC}"
echo ""
