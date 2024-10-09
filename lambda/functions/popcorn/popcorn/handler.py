# force build comment 2683534907
import json
import os
import traceback
from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum
import uuid

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

APP_BASE_URL = os.environ["APP_BASE_URL"]
PROFILE_URL = f"{APP_BASE_URL}/profile"

logger = Logger()
tracer = Tracer()

# Set up app with API Gateway resolver
app = APIGatewayRestResolver(strip_prefixes=["/v1/popcorn"])


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)


# Enum for invite code types
class InviteCodeType(Enum):
    GENERAL = "general"
    USER = "user"
    SANDWATCH = "sandwatch"


class TaskBase(BaseModel):
    name: str
    multiplier: float


class Task(TaskBase):
    id: int


class UserTask(BaseModel):
    id: int
    performed_at: datetime
    task_id: int
    task_name: str
    multiplier: float


class UserTaskAssignment(BaseModel):
    user_id: int
    multiplier_task_id: int


class PopcornCalculation(BaseModel):
    user_id: int
    total_popcorn: float
    current_multiplier: float
    calculated_at: datetime


class DatabaseError(Exception):
    """Custom exception for database-related errors."""

    pass


class CalculationError(Exception):
    """Custom exception for calculation-related errors."""

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


@app.exception_handler(CalculationError)
def handle_calculation_error(e):
    logger.error(f"Calculation error: {str(e)}")
    return {"statusCode": 400, "body": str(e)}


@app.get("/discord/callback")
@tracer.capture_method
def handle_discord_callback():
    social = "discord"
    logger.info(f"Handling {social} callback")
    query_params = app.current_event.query_string_parameters
    print_social_query_string_values(social, query_params)
    # verify nonce / user
    # update tasks
    return Response(
        status_code=302,
        headers={"Location": PROFILE_URL},
    )


@app.get("/instagram/callback")
@tracer.capture_method
def handle_instagram_callback():
    social = "instagram"
    logger.info(f"Handling {social} callback")
    query_params = app.current_event.query_string_parameters
    print_social_query_string_values(social, query_params)
    # verify nonce / user
    # update tasks
    return Response(
        status_code=302,
        headers={"Location": PROFILE_URL},
    )


@app.get("/telegram/callback")
@tracer.capture_method
def handle_telegram_callback():
    social = "telegram"
    logger.info(f"Handling {social} callback")
    query_params = app.current_event.query_string_parameters
    print_social_query_string_values(social, query_params)
    # verify nonce / user
    # update tasks
    return Response(
        status_code=302,
        headers={"Location": PROFILE_URL},
    )


@app.get("/twitter/callback")
@tracer.capture_method
def handle_twitter_callback():
    social = "twitter"
    logger.info(f"Handling {social} callback")
    query_params = app.current_event.query_string_parameters
    print_social_query_string_values(social, query_params)
    # verify nonce / user
    # update tasks
    return Response(
        status_code=302,
        headers={"Location": PROFILE_URL},
    )


def print_social_query_string_values(social, query_params):
    if query_params:
        for key, value in query_params.items():
            print(f"{social} callback: - {key}: {value}")
    else:
        print(f"No query string parameters found for {social} callback.")


@app.get("/tasks")
@tracer.capture_method
def get_all_tasks():
    logger.info("Fetching all tasks")
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT * FROM multiplier_tasks")
                tasks = cur.fetchall()
        return Response(
            status_code=200,
            content_type="application/json",
            body=json.loads(json.dumps({"tasks": tasks}, cls=DecimalEncoder)),
        )
    except Exception as e:
        logger.error(f"Error fetching tasks: {str(e)}")
        return Response(
            status_code=500,
            content_type="application/json",
            body=json.dumps({"error": "An error occurred while fetching tasks"}),
        )


@app.get("/user-tasks")
@tracer.capture_method
def get_user_tasks():
    logger.info("Fetching user tasks")
    user_id = app.current_event.get_query_string_value("user_id")
    if not user_id:
        logger.warning("User ID is required but not provided")
        return Response(
            status_code=400,
            content_type="application/json",
            body=json.dumps({"error": "User ID is required"}),
        )

    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """
                    SELECT utm.id, utm.performed_at, mt.id AS task_id, mt.name AS task_name, mt.multiplier
                    FROM user_to_multiplier utm
                    JOIN multiplier_tasks mt ON utm.multiplier_task_id = mt.id
                    WHERE utm.user_id = %s
                    ORDER BY utm.performed_at DESC
                """,
                    (user_id,),
                )
                user_tasks = cur.fetchall()

        # Convert datetime objects to strings for JSON serialization
        for task in user_tasks:
            task["performed_at"] = task["performed_at"].isoformat()

        return Response(
            status_code=200,
            content_type="application/json",
            body=json.dumps({"user_id": user_id, "tasks": user_tasks}),
        )
    except Exception as e:
        logger.error(f"Error fetching user tasks: {str(e)}")
        return Response(
            status_code=500,
            content_type="application/json",
            body=json.dumps({"error": "An error occurred while fetching user tasks"}),
        )


def ensure_utc(dt):
    """Ensure a datetime is UTC and offset-aware."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


@app.get("/popcorn")
@tracer.capture_method
def calculate_popcorn():
    try:
        user_id = app.current_event.query_string_parameters.get("user_id")
        timestamp_str = app.current_event.query_string_parameters.get("timestamp")

        if not user_id:
            raise CalculationError("User ID is required")

        calculation_time = ensure_utc(datetime.now())
        if timestamp_str:
            try:
                calculation_time = ensure_utc(datetime.fromisoformat(timestamp_str))
            except ValueError:
                raise CalculationError("Invalid timestamp format. Use ISO 8601 format.")

        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Get user creation time
                cur.execute("SELECT created_date FROM users WHERE id = %s", (user_id,))
                user = cur.fetchone()
                if not user:
                    raise CalculationError("User not found")
                user_created_at = ensure_utc(user["created_date"])

                # Get all tasks assigned to the user
                cur.execute(
                    """
                    SELECT utm.performed_at, mt.multiplier
                    FROM user_to_multiplier utm
                    JOIN multiplier_tasks mt ON utm.multiplier_task_id = mt.id
                    WHERE utm.user_id = %s
                    ORDER BY utm.performed_at
                """,
                    (user_id,),
                )
                tasks = cur.fetchall()

                # Calculate popcorn
                total_popcorn = 0
                current_multiplier = 1
                last_calculation_time = user_created_at

                for task in tasks:
                    print(task)
                    task_performed_at = ensure_utc(task["performed_at"])

                    if task_performed_at > calculation_time:
                        break

                    # Calculate popcorn up to this task assignment
                    try:
                        time_diff = (
                            task_performed_at - last_calculation_time
                        ).total_seconds()
                        logger.debug(
                            f"Time diff calculation: {task_performed_at} - {last_calculation_time} = {time_diff} seconds"
                        )
                        total_popcorn += time_diff * current_multiplier
                    except TypeError as e:
                        logger.error(f"TypeError in time difference calculation: {e}")
                        logger.error(
                            f"task_performed_at: {task_performed_at}, type: {type(task_performed_at)}, tzinfo: {task_performed_at.tzinfo}"
                        )
                        logger.error(
                            f"last_calculation_time: {last_calculation_time}, type: {type(last_calculation_time)}, tzinfo: {last_calculation_time.tzinfo}"
                        )
                        raise CalculationError("Error in time difference calculation")

                    # Update multiplier and last calculation time
                    current_multiplier += task["multiplier"] - 1
                    last_calculation_time = task_performed_at

                # Calculate remaining popcorn up to the calculation time
                final_time_diff = (
                    calculation_time - last_calculation_time
                ).total_seconds()
                logger.debug(
                    f"Final time diff calculation: {calculation_time} - {last_calculation_time} = {final_time_diff} seconds"
                )
                total_popcorn += final_time_diff * current_multiplier

                return {
                    "statusCode": 200,
                    "body": {
                        "user_id": int(user_id),
                        "total_popcorn": total_popcorn,
                        "current_multiplier": current_multiplier,
                        "calculated_at": calculation_time.isoformat(),
                    },
                }

    except psycopg2.Error as e:
        logger.error(f"Database error during popcorn calculation: {str(e)}")
        raise DatabaseError("A database error occurred during calculation")
    except Exception as e:
        logger.error(f"Unexpected error during popcorn calculation: {str(e)}")
        logger.error(traceback.format_exc())
        raise


# New endpoint to generate invite codes
@app.post("/generate_invite_code")
@tracer.capture_method
def generate_invite_code_endpoint():
    body = json.loads(app.current_event.body)
    code_type_str = body.get("code_type")

    if not code_type_str:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "code_type is required"}),
        }

    try:
        code_type = InviteCodeType(code_type_str.lower())
    except ValueError:
        return {"statusCode": 400, "body": json.dumps({"error": "Invalid code_type"})}

    invite_code = generate_invite_sandwatch_invite_code(code_type)
    return {"statusCode": 200, "body": json.dumps({"invite_code": invite_code})}


# Endpoint to handle invite codes
@app.post("/apply_invite_code")
@tracer.capture_method
def apply_invite_code():
    # private


@app.post("/user-tasks")
@tracer.capture_method
def assign_task_to_user():
    logger.info("Assigning task to user")
    try:
        body = json.loads(app.current_event.body)
        assignment_data = UserTaskAssignment(**body)
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO user_to_multiplier (user_id, multiplier_task_id, performed_at) VALUES (%s, %s, %s) RETURNING id",
                    (
                        assignment_data.user_id,
                        assignment_data.multiplier_task_id,
                        datetime.utcnow(),
                    ),
                )
                assignment_id = cur.fetchone()[0]
                conn.commit()
        logger.info(f"Task assigned successfully. Assignment ID: {assignment_id}")
        return Response(
            status_code=201,
            content_type="application/json",
            body=json.dumps(
                {"id": assignment_id, "message": "Task assigned to user successfully"}
            ),
        )
    except Exception as e:
        logger.error(f"Error assigning task to user: {str(e)}")
        return Response(
            status_code=500,
            content_type="application/json",
            body=json.dumps(
                {"error": "An error occurred while trying to assign the task"}
            ),
        )


@logger.inject_lambda_context(correlation_id_path=correlation_paths.API_GATEWAY_REST)
@tracer.capture_lambda_handler
def lambda_handler(event: APIGatewayProxyEvent, context: LambdaContext) -> dict:
    logger.info("Lambda handler invoked")

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


def determine_invite_code_type(invite_code):
    # Logic to determine the type of invite code
    # This is a placeholder implementation
    if invite_code.startswith("GEN"):
        return InviteCodeType.GENERAL
    elif invite_code.startswith("USR"):
        return InviteCodeType.USER
    elif invite_code.startswith("SW"):
        return InviteCodeType.SANDWATCH
    else:
        return None


def validate_user_invite_code(invite_code):
    # Logic to validate user invite code in the database
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT * FROM user_invite_codes WHERE code = %s", (invite_code,)
            )
            result = cur.fetchone()
            return result is not None
    except psycopg2.Error as e:
        logger.error(f"Failed to validate user invite code: {str(e)}")
        return False
    finally:
        conn.close()


def update_user_to_multiplier(user_id):
    # Logic to update the user_to_multiplier table
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO user_to_multiplier (user_id, multiplier)
                VALUES (%s, 1.1)
                ON CONFLICT (user_id) DO UPDATE SET multiplier = user_to_multiplier.multiplier * 1.1
                """,
                (user_id,),
            )
            conn.commit()
    except psycopg2.Error as e:
        logger.error(f"Failed to update user_to_multiplier: {str(e)}")
        raise Exception("Unable to update user_to_multiplier") from e
    finally:
        conn.close()


def validate_and_use_sandwatch_code(invite_code):
    # Logic to validate and use sandwatch invite code
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT * FROM sandwatch_invite_codes WHERE code = %s AND used = FALSE",
                (invite_code,),
            )
            result = cur.fetchone()
            if result:
                cur.execute(
                    "UPDATE sandwatch_invite_codes SET used = TRUE WHERE code = %s",
                    (invite_code,),
                )
                conn.commit()
                return True
            else:
                return False
    except psycopg2.Error as e:
        logger.error(f"Failed to validate and use sandwatch invite code: {str(e)}")
        return False
    finally:
        conn.close()


def generate_invite_sandwatch_invite_code(code_type: InviteCodeType) -> str:
    # Generate a unique identifier
    unique_id = uuid.uuid4().hex[:5].upper()  # Use the first 8 characters of the UUID

    # Format the invite code based on the type
    if code_type == InviteCodeType.GENERAL:
        return f"GEN-{unique_id}"
    elif code_type == InviteCodeType.USER:
        return f"USR-{unique_id}"
    elif code_type == InviteCodeType.SANDWATCH:
        return f"SW-{unique_id}"
    else:
        raise ValueError("Invalid invite code type")

