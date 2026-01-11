#!/bin/bash

# Script to test admin endpoints
# First, login to get the token

echo "==================================="
echo "Testing Admin Backend API"
echo "==================================="
echo ""

echo "1. Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aimarketplace.com","password":"admin123"}')

echo "Login response: $LOGIN_RESPONSE"
echo ""

# Extract token (assuming response has "token" field)
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"//')

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token. Response was:"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Got token: ${TOKEN:0:20}..."
echo ""

echo "2. Testing /admin/dashboard/stats..."
curl -s -X GET http://localhost:5000/api/admin/dashboard/stats \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

echo "3. Testing /admin/users..."
curl -s -X GET "http://localhost:5000/api/admin/users?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

echo "4. Testing /admin/platform/config..."
curl -s -X GET http://localhost:5000/api/admin/platform/config \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

echo "5. Testing /admin/platform/skills..."
curl -s -X GET http://localhost:5000/api/admin/platform/skills \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

echo "==================================="
echo "✅ Admin API tests complete!"
echo "==================================="
