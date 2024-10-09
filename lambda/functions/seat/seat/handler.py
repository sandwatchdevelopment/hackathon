# force build comment 2683534907
from shared.db import get_db_connection
from shared.models import SeatType, Seat, SeatAssignment

import json
import traceback
from psycopg2.extras import RealDictCursor
from aws_lambda_powertools import Logger, Tracer
from aws_lambda_powertools.event_handler import APIGatewayRestResolver
from aws_lambda_powertools.utilities.typing import LambdaContext
from aws_lambda_powertools.logging import correlation_paths
from aws_lambda_powertools.utilities.data_classes import APIGatewayProxyEvent
from aws_lambda_powertools.utilities.parser import parse

logger = Logger()
tracer = Tracer()
app = APIGatewayRestResolver(strip_prefixes=["/v1/seat"])


@app.get("/seat-types")
@tracer.capture_method
def get_seat_types():
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM seat_types")
            seat_types = cur.fetchall()
    return {"seat_types": [SeatType(**st) for st in seat_types]}


@app.get("/seat/{user_id}")
@tracer.capture_method
def get_seat_for_user(user_id: int):
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT stu.id, stu.user_id, stu.seat_type_id, stu.seat_row, stu.seat_number
                FROM seat_to_user stu
                WHERE stu.user_id = %s
            """,
                (user_id,),
            )
            result = cur.fetchone()

            if not result:
                return {
                    "statusCode": 404,
                    "body": json.dumps({"error": "No seat found for the given user"}),
                }

            seat = Seat(**result)

            return {"statusCode": 200, "body": json.dumps({"seat": seat.model_dump()})}


@app.get("/seat-for-invite-code/{invite_code}")
@tracer.capture_method
def get_seat_for_invite_code(invite_code: str):
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Get the seat type associated with the invite code
            cur.execute(
                """
                SELECT ic.seat_type_id
                FROM invite_codes ic
                WHERE ic.code = %s
            """,
                (invite_code,),
            )
            result = cur.fetchone()

            if not result:
                return {
                    "statusCode": 404,
                    "body": json.dumps({"error": "Invite code not found"}),
                }

            seat_type_id = result["seat_type_id"]

            # Generate random seat row and number
            import random

            seat_row = random.randint(1, 100)  # Adjust range as needed
            seat_number = random.randint(1, 50)  # Adjust range as needed

            return {
                "statusCode": 200,
                "body": json.dumps(
                    {
                        "seat": {
                            "seat_row": seat_row,
                            "seat_number": seat_number,
                            "seat_type_id": seat_type_id,
                        }
                    }
                ),
            }


@app.post("/assign")
@tracer.capture_method
def assign_seat():
    # private


@app.post("/upgrade")
@tracer.capture_method
def upgrade_seat():
    # private


@logger.inject_lambda_context(correlation_id_path=correlation_paths.API_GATEWAY_REST)
@tracer.capture_lambda_handler
def lambda_handler(event: APIGatewayProxyEvent, context: LambdaContext) -> dict:
    logger.info("Lambda handler invoked")

    try:
        return app.resolve(event, context)
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


def is_upgrade(current_type, new_type):
    seat_hierarchy = ["basic", "golden", "creator"]
    return seat_hierarchy.index(new_type) > seat_hierarchy.index(current_type)
