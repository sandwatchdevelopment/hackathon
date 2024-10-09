# force build comment 2683534907
import json

import os
import traceback
import secrets

import psycopg2

# from psycopg2.extras import RealDictCursor

from aws_lambda_powertools import Logger, Tracer
from aws_lambda_powertools.event_handler import APIGatewayRestResolver
from aws_lambda_powertools.event_handler.api_gateway import Response
from aws_lambda_powertools.utilities.typing import LambdaContext
from aws_lambda_powertools.logging import correlation_paths
from aws_lambda_powertools.utilities.parser import BaseModel
from aws_lambda_powertools.utilities.data_classes import APIGatewayProxyEvent
import urllib.parse

# Database connection parameters
DB_NAME = os.environ["DB_NAME"]
DB_USER = os.environ["DB_USER"]
DB_PASSWORD = os.environ["DB_PASSWORD"]
DB_HOST = os.environ["DB_HOST"]
DB_PORT = os.environ["DB_PORT"]

# Keys
TELEGRAM_CLIENT_ID = os.environ["TELEGRAM_CLIENT_ID"]
TELEGRAM_SECRET = os.environ["TELEGRAM_SECRET"]

DISCORD_CLIENT_ID = os.environ["DISCORD_CLIENT_ID"]
DISCORD_SECRET = os.environ["DISCORD_SECRET"]

INSTAGRAM_CLIENT_ID = os.environ["INSTAGRAM_CLIENT_ID"]
INSTAGRAM_SECRET = os.environ["INSTAGRAM_SECRET"]

TWITTER_CLIENT_ID = os.environ["TWITTER_CLIENT_ID"]
TWITTER_SECRET = os.environ["TWITTER_SECRET"]

BASE_URL = os.environ["BASE_URL"]

logger = Logger()
tracer = Tracer()

app = APIGatewayRestResolver(strip_prefixes=["/v1/connections"])


class Connection(BaseModel):
    id: str


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


@logger.inject_lambda_context(correlation_id_path=correlation_paths.API_GATEWAY_REST)
@tracer.capture_lambda_handler
def lambda_handler(event: APIGatewayProxyEvent, context: LambdaContext) -> dict:
    logger.info("Auth Lambda handler invoked")

    try:
        response = app.resolve(event, context)
        if isinstance(response.get("body"), str):
            try:
                body = json.loads(response["body"])
                response["body"] = json.dumps(body)
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


@app.get("/discord")
@tracer.capture_method
def get_discord_redirect():
    logger.info("authentication with discord")
    try:
        # Docs: https://discord.com/developers/docs/topics/oauth2
        # Generate a random state parameter
        state = secrets.token_urlsafe(16)


        # oath2 url to redirect to discord
        # TODO: prompt=none?
        encoded_callback_route = urllib.parse.quote(
            BASE_URL + "/popcorn/discord/callback", safe=""
        )
        url = f"https://discord.com/oauth2/authorize?client_id={DISCORD_CLIENT_ID}&redirect_uri={encoded_callback_route}k&response_type=code&scope=identify&state={state}"
        return Response(
            status_code=302,
            headers={"Location": url},
        )
    except Exception as e:
        logger.error(f"Error redirecting to discord {str(e)}")
        return Response(
            status_code=500,
            content_type="application/json",
            body=json.dumps(
                {"error": "An error occurred while attempting to redirect to discord"}
            ),
        )


@app.get("/telegram")
@tracer.capture_method
def get_telegram_redirect():
    logger.info("authentication with telegram")
    try:
        # Generate a random state parameter
        nonce = secrets.token_urlsafe(16)
        scope = "default"
        # origin = "https://sandwatch.webflow.io/popcorn/telegram/callback"

        encoded_callback_route = urllib.parse.quote(
            BASE_URL + "/popcorn/telegram/callback", safe=""
        )
        url = f"https://oauth.telegram.org/auth?bot_id={TELEGRAM_CLIENT_ID}&scope={scope}&nonce={nonce}&origin={encoded_callback_route}"
        return Response(
            status_code=302,
            headers={"Location": url},
        )
    except Exception as e:
        logger.error(f"Error redirecting to telegram {str(e)}")
        return Response(
            status_code=500,
            content_type="application/json",
            body=json.dumps(
                {"error": "An error occurred while attempting to redirect to telegram"}
            ),
        )


@app.get("/twitter")
@tracer.capture_method
def get_twitter_redirect():
    logger.info("authentication with twitter")
    try:
        # Generate a random state parameter
        state = secrets.token_urlsafe(16)

        # oath2 url to redirect to twitter
        encoded_callback_route = urllib.parse.quote(
            BASE_URL + "/popcorn/twitter/callback", safe=""
        )
        url = f"https://twitter.com/i/oauth2/authorize?response_type=code&client_id={TWITTER_CLIENT_ID}&scope=tweet.read%20users.read%20offline.access%20follows.read&state=Z&code_challenge=Z&code_challenge_method=plain&redirect_uri={encoded_callback_route}&state={state}"
        return Response(
            status_code=302,
            headers={"Location": url},
        )
    except Exception as e:
        logger.error(f"Error redirecting to twitter {str(e)}")
        return Response(
            status_code=500,
            content_type="application/json",
            body=json.dumps(
                {"error": "An error occurred while attempting to redirect to twitter"}
            ),
        )


@app.get("/instagram")
@tracer.capture_method
def get_instagram_redirect():
    logger.info("authentication with twitter")
    try:
        # Docs: https://developers.facebook.com/docs/instagram-basic-display-api/getting-started
        # Generate a random state parameter
        state = secrets.token_urlsafe(16)

        # oath2 url to redirect to instagram
        encoded_callback_route = urllib.parse.quote(
            BASE_URL + "/popcorn/instagram/callback", safe=""
        )
        url = f"https://instagram.com/oauth/authorize?client_id={INSTAGRAM_CLIENT_ID}&redirect_uri={encoded_callback_route}&response_type=code&scope=basic$state={state}"
        return Response(
            status_code=302,
            headers={"Location": url},
        )
    except Exception as e:
        logger.error(f"Error redirecting to instagram {str(e)}")
        return Response(
            status_code=500,
            content_type="application/json",
            body=json.dumps(
                {"error": "An error occurred while attempting to redirect to instagram"}
            ),
        )


@app.get("/instagram/deauthorize")
@tracer.capture_method
def deauthorize_instagram():
    return Response(
        status_code=200,
        content_type="application/json",
        body=json.dumps({"success": "User deauthorized Instagram"}),
    )


@app.get("/instagram/delete-data")
@tracer.capture_method
def delete_data_instagram():
    return Response(
        status_code=200,
        content_type="application/json",
        body=json.dumps({"success": "User deleted Instagram data"}),
    )
