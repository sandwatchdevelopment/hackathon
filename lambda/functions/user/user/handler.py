# force build comment 2683534907
import json

import os
import traceback

import psycopg2

# from psycopg2.extras import RealDictCursor

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

logger = Logger()
tracer = Tracer()

app = APIGatewayRestResolver(strip_prefixes=["/v1/user"])


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
    logger.info("Search Lambda handler invoked")

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


@app.get("/foo")
@tracer.capture_method
def check_username_exists(request):
    username = request.get_query_string_value("foo")
    if not username:
        return Response(
            status_code=400,
            content_type="application/json",
            body=json.dumps({"error": "Foo parameter is required"}),
        )

    logger.info("Foo")
    try:
        return Response(
            status_code=200,
            content_type="application/json",
            body=json.dumps({"hello": "user"}),
        )
    except Exception as e:
        logger.error(f"Error checking username: {str(e)}")
        return Response(
            status_code=500,
            content_type="application/json",
            body=json.dumps(
                {
                    "error": "An internal server error occurred",
                    "details": str(e),
                    "type": type(e).__name__,
                }
            ),
        )
