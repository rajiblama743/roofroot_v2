#!/bin/bash

# 🚀 Deployment Testing Script
# This script helps test your deployed RoofRoot application

echo "🔍 RoofRoot Deployment Test Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "success")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "error")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "warning")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "info")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

# Check if backend URL is provided
if [ -z "$1" ]; then
    print_status "error" "Please provide your backend URL as an argument"
    echo "Usage: ./test-deployment.sh https://your-backend-url.com"
    exit 1
fi

BACKEND_URL=$1
FRONTEND_URL=${2:-"https://your-frontend-url.com"}

echo ""
print_status "info" "Testing backend: $BACKEND_URL"
print_status "info" "Testing frontend: $FRONTEND_URL"
echo ""

# Test 1: Backend Health Check
print_status "info" "Testing backend health endpoint..."
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" "$BACKEND_URL/api/health" -o /tmp/health_response)

if [ "$HEALTH_RESPONSE" = "200" ]; then
    print_status "success" "Backend health check passed"
    echo "Response: $(cat /tmp/health_response)"
else
    print_status "error" "Backend health check failed (HTTP $HEALTH_RESPONSE)"
    echo "Response: $(cat /tmp/health_response)"
fi

echo ""

# Test 2: CORS Preflight Check
print_status "info" "Testing CORS configuration..."
CORS_RESPONSE=$(curl -s -w "%{http_code}" \
    -H "Origin: $FRONTEND_URL" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -X OPTIONS \
    "$BACKEND_URL/api/auth/login" \
    -o /tmp/cors_response)

if [ "$CORS_RESPONSE" = "200" ] || [ "$CORS_RESPONSE" = "204" ]; then
    print_status "success" "CORS preflight check passed"
else
    print_status "error" "CORS preflight check failed (HTTP $CORS_RESPONSE)"
fi

echo ""

# Test 3: Login Endpoint (without credentials)
print_status "info" "Testing login endpoint structure..."
LOGIN_RESPONSE=$(curl -s -w "%{http_code}" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test"}' \
    "$BACKEND_URL/api/auth/login" \
    -o /tmp/login_response)

if [ "$LOGIN_RESPONSE" = "401" ]; then
    print_status "success" "Login endpoint is working (401 expected for invalid credentials)"
    echo "Response: $(cat /tmp/login_response)"
elif [ "$LOGIN_RESPONSE" = "400" ]; then
    print_status "warning" "Login endpoint responded with 400 (validation error)"
    echo "Response: $(cat /tmp/login_response)"
else
    print_status "error" "Login endpoint failed (HTTP $LOGIN_RESPONSE)"
    echo "Response: $(cat /tmp/login_response)"
fi

echo ""

# Test 4: Environment Variables Check
print_status "info" "Checking for common environment variable issues..."

# Check if JWT_SECRET is properly set (this would be visible in error messages)
JWT_ERROR=$(curl -s "$BACKEND_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test"}' | grep -i "jwt\|secret\|token")

if [ -n "$JWT_ERROR" ]; then
    print_status "warning" "Possible JWT configuration issue detected"
    echo "Error message: $JWT_ERROR"
else
    print_status "success" "No JWT configuration errors detected"
fi

echo ""

# Test 5: Database Connection Check
print_status "info" "Checking database connection..."
DB_ERROR=$(curl -s "$BACKEND_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test"}' | grep -i "database\|mongo\|connection")

if [ -n "$DB_ERROR" ]; then
    print_status "error" "Database connection issue detected"
    echo "Error message: $DB_ERROR"
else
    print_status "success" "No database connection errors detected"
fi

echo ""

# Summary and Recommendations
print_status "info" "=== DEPLOYMENT TEST SUMMARY ==="

echo ""
print_status "info" "Next steps to fix login issues:"
echo "1. Check your deployment platform logs for detailed error messages"
echo "2. Verify environment variables are set correctly:"
echo "   - MONGO_URI"
echo "   - JWT_SECRET (32+ characters)"
echo "   - JWT_REFRESH_SECRET (32+ characters)"
echo "   - FRONTEND_URLS"
echo "3. Ensure your frontend has NEXT_PUBLIC_API_URL set"
echo "4. Check that agency users exist in your database"
echo "5. Verify CORS is configured for your frontend domain"

echo ""
print_status "info" "To create a test agency user, use:"
echo "curl -X POST $BACKEND_URL/api/auth/register \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"name\":\"Test Agency\",\"email\":\"agency@test.com\",\"password\":\"password123\",\"agencyName\":\"Test Agency\"}'"

echo ""
print_status "info" "For more detailed troubleshooting, see TROUBLESHOOTING_LOGIN.md"

# Cleanup
rm -f /tmp/health_response /tmp/cors_response /tmp/login_response
