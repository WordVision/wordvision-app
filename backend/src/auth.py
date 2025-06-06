from dotenv import load_dotenv
from fastapi import HTTPException, status, Request
# from gotrue.types import User
# from jose import jwt, JWTError
import requests
import os
import logging


# from .models.book import hash_email
from .lib.supabase import supabase


load_dotenv()
COGNITO_CLIENT_ID = os.getenv("COGNITO_CLIENT_ID")
COGNITO_ISSUER = os.getenv("COGNITO_ISSUER")
COGNITO_DOMAIN = os.getenv("COGNITO_DOMAIN")
JWKS_URL = f"{COGNITO_ISSUER}/.well-known/jwks.json"

logger = logging.getLogger("uvicorn.error")

# Custom Middleware for Authentication
async def auth_middleware(request: Request):

    # Get the Authorization header from the request
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization header missing")

    # Extract access_token from the Authorization header ("Bearer <token>")
    token = auth_header.split(" ")[1]

    # Verify user access token
    try:
      response = supabase.auth.get_user(token);
      if response:
        logger.debug(f"Auth Middleware response.user: {response.user}")
        request.state.user = response.user
        return request
      else:
        logger.error(f"Auth Middleware: response is empty")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User not found")
    except:
      logger.error(f"Auth Middleware: supabase.auth.get_user(token) threw an error")
      raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User not logged in")

# # Function to Verify JWT Tokens
# def verify_jwt_token(token: str):
#     try:
#         # Fetch the public keys (JWKS) from Cognito
#         print(f"JWKS URL: {JWKS_URL}")
#         jwks = requests.get(JWKS_URL).json()
#         print("Fetched JWKS:", jwks)
#
#         if jwks is None:
#             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to retrieve JSON Web keys")
#
#         # Attempt to decode and verify the JWT token using the found JSON Web Keys
#         payload = jwt.decode(
#             token,
#             jwks,
#             algorithms=["RS256"],
#             audience=COGNITO_CLIENT_ID,
#             issuer=COGNITO_ISSUER,
#         )
#         print("Decoded payload:", payload)  # Check if the payload contains the expected audience and issuer
#         return payload  # Return the decoded token if it's valid
#
#     except JWTError as e:
#         print(f"JWT verification error: {e}")
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def get_user_info(access_token: str):
    user_info_url = f"https://{COGNITO_DOMAIN}/oauth2/userInfo"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    response = requests.get(user_info_url, headers=headers)

    if response.status_code == 200:
        return response.json()  # User info returned by Cognito
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to fetch user info from Cognito"
        )
