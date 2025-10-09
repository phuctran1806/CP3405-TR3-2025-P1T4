#!/bin/bash

# API Testing Script for JCU Library Backend
# This script tests all major API endpoints

BASE_URL="http://localhost:8000"

echo "🧪 JCU Library Backend API Test Suite"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    local token=$5
    
    echo -n "Testing: $description... "
    
    if [ -n "$token" ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -X $method "$BASE_URL$endpoint" \
                -H "Authorization: Bearer $token" \
                -H "Content-Type: application/json" \
                -d "$data")
        else
            response=$(curl -s -X $method "$BASE_URL$endpoint" \
                -H "Authorization: Bearer $token")
        fi
    else
        if [ -n "$data" ]; then
            response=$(curl -s -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data")
        else
            response=$(curl -s -X $method "$BASE_URL$endpoint")
        fi
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((TESTS_FAILED++))
    fi
}

# Test 1: Health Check
echo "1️⃣  Basic Endpoints"
echo "-------------------"
test_endpoint "GET" "/health" "Health check"
test_endpoint "GET" "/" "Root endpoint"
echo ""

# Test 2: Authentication
echo "2️⃣  Authentication"
echo "------------------"

# Login as admin
echo -n "Logging in as admin... "
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=admin@jcu.edu.au&password=admin123")

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    echo "   Token obtained: ${TOKEN:0:20}..."
else
    echo -e "${RED}✗ FAIL${NC}"
    ((TESTS_FAILED++))
    echo "   Response: $LOGIN_RESPONSE"
fi

# Test get current user
if [ -n "$TOKEN" ]; then
    test_endpoint "GET" "/api/auth/me" "Get current user" "" "$TOKEN"
fi
echo ""

# Test 3: Floors
echo "3️⃣  Floor Endpoints"
echo "------------------"
test_endpoint "GET" "/api/floors/" "Get all floors"

# Get first floor ID
FLOOR_RESPONSE=$(curl -s "$BASE_URL/api/floors/")
FLOOR_ID=$(echo $FLOOR_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$FLOOR_ID" ]; then
    echo "   Using floor ID: $FLOOR_ID"
    test_endpoint "GET" "/api/floors/$FLOOR_ID" "Get floor details"
    test_endpoint "GET" "/api/floors/$FLOOR_ID/seats" "Get floor with seats"
fi
echo ""

# Test 4: Seats
echo "4️⃣  Seat Endpoints"
echo "-----------------"
test_endpoint "GET" "/api/seats/" "Get all seats"
test_endpoint "GET" "/api/seats/available" "Get available seats"

# Get first seat ID
SEAT_RESPONSE=$(curl -s "$BASE_URL/api/seats/")
SEAT_ID=$(echo $SEAT_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$SEAT_ID" ]; then
    echo "   Using seat ID: $SEAT_ID"
    test_endpoint "GET" "/api/seats/$SEAT_ID" "Get seat details"
fi
echo ""

# Test 5: IoT Occupancy (HIGHEST PRIORITY)
echo "5️⃣  IoT Occupancy Endpoints ⭐ (Imp: 95)"
echo "---------------------------------------"
test_endpoint "GET" "/api/iot/occupancy/current" "Get current occupancy"
test_endpoint "POST" "/api/iot/occupancy/simulate" "Simulate random occupancy"
test_endpoint "GET" "/api/iot/occupancy/history" "Get occupancy history"

if [ -n "$SEAT_ID" ]; then
    OCCUPANCY_DATA="{\"seat_id\":\"$SEAT_ID\",\"is_occupied\":true}"
    test_endpoint "POST" "/api/iot/occupancy" "Update seat occupancy" "$OCCUPANCY_DATA"
fi
echo ""

# Test 6: Reservations
echo "6️⃣  Reservation Endpoints"
echo "------------------------"
if [ -n "$TOKEN" ]; then
    test_endpoint "GET" "/api/reservations/my" "Get my reservations" "" "$TOKEN"
fi
echo ""

# Test 7: Admin Dashboard
echo "7️⃣  Admin Dashboard Endpoints (Imp: 80)"
echo "--------------------------------------"
if [ -n "$TOKEN" ]; then
    test_endpoint "GET" "/api/admin/analytics/utilization" "Get utilization stats" "" "$TOKEN"
    test_endpoint "GET" "/api/admin/analytics/occupancy?days=7" "Get occupancy analytics" "" "$TOKEN"
    test_endpoint "GET" "/api/admin/users" "Get all users" "" "$TOKEN"
    test_endpoint "GET" "/api/admin/export/report?format=json&days=7" "Export report" "" "$TOKEN"
fi
echo ""

# Summary
echo "======================================"
echo "📊 Test Summary"
echo "======================================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo "Total Tests:  $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check the output above.${NC}"
    exit 1
fi

