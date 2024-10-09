# force build comment 2683534908
import datetime
import json
import jwt
import base58

# from solana.message import Message
# from solana.transaction import Transaction
# from solana.publickey import PublicKey
# from solana.transaction import Signature
import nacl.signing
import nacl.encoding

import os
import traceback

# from datetime import datetime, timezone
from decimal import Decimal

import psycopg2
from psycopg2.extras import RealDictCursor

from aws_lambda_powertools import Logger, Tracer
from aws_lambda_powertools.event_handler import APIGatewayRestResolver
from aws_lambda_powertools.event_handler.api_gateway import Response
from aws_lambda_powertools.utilities.typing import LambdaContext
from aws_lambda_powertools.logging import correlation_paths
from aws_lambda_powertools.utilities.parser import BaseModel
from aws_lambda_powertools.utilities.data_classes import APIGatewayProxyEvent

# Database connection parameters
DB_NAME = os.environ["DB_NAME"]
DB_USER = os.environ["DB_USER"]
DB_PASSWORD = os.environ["DB_PASSWORD"]
DB_HOST = os.environ["DB_HOST"]
DB_PORT = os.environ["DB_PORT"]

MESSAGE_TO_SIGN = b"Log in to Sandwatch"

# Keys
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_REFRESH_SECRET = os.environ["JWT_REFRESH_SECRET"]

# Token Settings
JWT_EXPIRATION = 3600  # 1 hour
REFRESH_TOKEN_EXPIRATION = 604800  # 7 days

logger = Logger()
tracer = Tracer()

app = APIGatewayRestResolver(strip_prefixes=["/v1/auth"])


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)


class MessagePayload(BaseModel):
    signedMessage: str
    publicKey: str


class RefreshToken(BaseModel):
    refreshToken: str


class DatabaseError(Exception):
    """Custom exception for database-related errors."""

    pass


@tracer.capture_method
def get_db_connection():
    try:
        return psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
        )
    except psycopg2.Error as e:
        logger.error(f"Failed to connect to the database: {str(e)}")
        raise DatabaseError("Unable to establish database connection") from e


@app.exception_handler(Exception)
def handle_general_exception(e):
    logger.exception("An unexpected error occurred")
    return {
        "statusCode": 500,
        "body": "An unexpected error occurred. Please try again later.",
    }


@app.exception_handler(DatabaseError)
def handle_database_error(e):
    logger.error(f"Database error: {str(e)}")
    return {
        "statusCode": 500,
        "body": "A database error occurred. Please try again later.",
    }


@tracer.capture_method
def verify_signature(signature_str, public_key_str):
    # public_key is the wallet address
    try:
        # Decode the public key and signature from base58
        public_key_bytes = base58.b58decode(public_key_str)
        signature_bytes = base58.b58decode(signature_str)
        # Create a VerifyKey object from the public key bytes
        verify_key = nacl.signing.VerifyKey(public_key_bytes)
        verify_key.verify(MESSAGE_TO_SIGN, signature_bytes)
        return True
    except nacl.exceptions.BadSignatureError as ex:
        print(f"BadSignatureError error: {ex}")
        return False
    except Exception as e:
        print(f"Verification error: {e}")
        return False


@tracer.capture_method
def generate_token(public_key):
    return jwt.encode(
        {
            "principalId": public_key,
            "exp": datetime.datetime.now(datetime.timezone.utc)
            + datetime.timedelta(hours=(JWT_EXPIRATION / 3600)),
        },
        JWT_SECRET,
        algorithm="HS256",
    )


@tracer.capture_method
def generate_refresh_token(public_key):
    return jwt.encode(
        {
            "principalId": public_key,
            "exp": datetime.datetime.now(datetime.timezone.utc)
            + datetime.timedelta(hours=(REFRESH_TOKEN_EXPIRATION / 3600)),
        },
        JWT_REFRESH_SECRET,
        algorithm="HS256",
    )


@tracer.capture_method
def try_create_new_user(public_key):
    # create a new user in the database
    # if one doesn't already exist
    # use the public key as the user ID
    # public key should be the wallet address
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                INSERT INTO users (wallet_address, created_date)
                VALUES (%s, NOW())
                ON CONFLICT (wallet_address) DO NOTHING
                """,
                (public_key,),
            )
            conn.commit()
    except psycopg2.Error as e:
        logger.error(f"Failed to create user: {str(e)}")
        raise DatabaseError("Unable to create user") from e
    finally:
        conn.close()


@logger.inject_lambda_context(correlation_id_path=correlation_paths.API_GATEWAY_REST)
@tracer.capture_lambda_handler
def lambda_handler(event: APIGatewayProxyEvent, context: LambdaContext) -> dict:
    logger.info("Auth Lambda handler invoked")

    try:
        response = app.resolve(event, context)
        if isinstance(response.get("body"), str):
            try:
                body = json.loads(response["body"])
                response["body"] = json.dumps(body, cls=DecimalEncoder)
            except json.JSONDecodeError:
                pass  # If it's not JSON, leave it as is
        return response
    except Exception as e:
        logger.error(f"An error occurred in the lambda handler: {str(e)}")
        logger.error(f"Exception type: {type(e).__name__}")
        logger.error(f"Exception traceback: {traceback.format_exc()}")
        return {
            "statusCode": 500,
            "body": json.dumps(
                {
                    "error": "An internal server error occurred",
                    "details": str(e),
                    "type": type(e).__name__,
                }
            ),
        }


@app.post("/access_token")
@tracer.capture_method
def get_token():
    logger.info("Authenticating user. Attempting to generate token")
    try:
        body = json.loads(app.current_event.body)
        message_payload = MessagePayload(**body)

        if verify_signature(message_payload.signedMessage, message_payload.publicKey):
            # create new user if not exists
            try_create_new_user(message_payload.publicKey)
            token = generate_token(message_payload.publicKey)
            refresh_token = generate_refresh_token(message_payload.publicKey)
            return {
                "statusCode": 200,
                "body": json.dumps({"token": token, "refresh_token": refresh_token}),
            }
        else:
            return {
                "statusCode": 401,
                "body": json.dumps({"error": "Invalid signature"}),
            }
    except Exception as e:
        logger.error(f"Error generating token: {str(e)}")
        return Response(
            status_code=500,
            content_type="application/json",
            body=json.dumps(
                {"error": "An error occurred while attempting to authenticate"}
            ),
        )


@app.post("/refresh_token")
@tracer.capture_method
def new_token():
    logger.info("Refreshing token")
    try:
        body = json.loads(app.current_event.body)
        refresh_token = RefreshToken(**body)

        try:
            decoded = jwt.decode(
                refresh_token.refreshToken, JWT_REFRESH_SECRET, algorithms=["HS256"]
            )
            print(f"decoded: {decoded}")
            principal_id = decoded["principalId"]  # this is the public key
            print(f"principal_id: {principal_id}")
            token = generate_token(principal_id)
            refresh_token = generate_refresh_token(principal_id)
            return {
                "statusCode": 200,
                "body": json.dumps({"token": token, "refresh_token": refresh_token}),
            }
        except jwt.ExpiredSignatureError:
            return {
                "statusCode": 401,
                "body": json.dumps({"error": "Refresh token expired"}),
            }
        except jwt.InvalidTokenError:
            return {
                "statusCode": 401,
                "body": json.dumps({"error": "Invalid refresh token"}),
            }
    except Exception as e:
        logger.error(f"Error generating token: {str(e)}")
        return Response(
            status_code=500,
            content_type="application/json",
            body=json.dumps(
                {"error": "An error occurred while attempting to authenticate"}
            ),
        )
