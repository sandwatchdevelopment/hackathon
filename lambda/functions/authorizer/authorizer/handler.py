# force build comment 2683534907
import os
import jwt
from aws_lambda_powertools import Logger

logger = Logger()

JWT_SECRET = os.getenv("JWT_SECRET")


def lambda_handler(event, context):
    # private