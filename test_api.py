#!/usr/bin/env python
import requests
import json

# Test the API endpoints
API_BASE = "http://127.0.0.1:8000/api/"

def test_projects_endpoint():
    """Test the projects endpoint"""
    try:
        # First, let's try without authentication
        print("🔍 Testing projects endpoint without auth...")
        response = requests.get(f"{API_BASE}projects/")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:200]}...")
        
        # Now let's try to get a token
        print("\n🔑 Testing login...")
        login_data = {
            "username": "superadmin",
            "password": "admin123"
        }
        
        login_response = requests.post(f"{API_BASE}auth/login/", json=login_data)
        print(f"Login Status: {login_response.status_code}")
        print(f"Login Response: {login_response.text}")
        
        if login_response.status_code == 200:
            token = login_response.json().get('data', {}).get('token')
            if token:
                print(f"\n✅ Got token: {token[:20]}...")
                
                # Test projects with token
                print("\n🚀 Testing projects with token...")
                headers = {"Authorization": f"Token {token}"}
                projects_response = requests.get(f"{API_BASE}projects/", headers=headers)
                print(f"Projects Status: {projects_response.status_code}")
                print(f"Projects Response: {projects_response.text}")
            else:
                print("❌ No token in response")
        else:
            print("❌ Login failed")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_projects_endpoint()
