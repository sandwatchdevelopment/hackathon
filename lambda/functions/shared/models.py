from aws_lambda_powertools.utilities.parser import BaseModel


class SeatType(BaseModel):
    id: int
    name: str


class Seat(BaseModel):
    id: int
    user_id: int
    seat_type_id: int
    seat_row: int
    seat_number: int


class SeatAssignment(BaseModel):
    user_id: int
    seat_type_id: int
