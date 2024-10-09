####################################
# LAMBDAS
####################################
# service that handles the authentication of the user
# and distributes jwts based on signed messages
module "auth_lambda" {
  source               = "./modules/lambda"
  function_name        = "auth"
  handler              = "auth.handler.lambda_handler"
  aws_region           = var.aws_region
  bucket_name          = var.bucket_name
  api_gw_id            = aws_apigatewayv2_api.lambda.id
  api_gw_execution_arn = aws_apigatewayv2_api.lambda.execution_arn
  layers_arn           = data.klayers_package_latest_version.cryptography.arn
  enable_authorizer    = false

  env_var = {
    DB_NAME            = var.cockroach_sql_database
    DB_USER            = var.db_auth_user
    DB_PASSWORD        = var.db_auth_password
    DB_HOST            = var.cockroach_sql_host
    DB_PORT            = var.cockroach_sql_port
    JWT_SECRET         = var.jwt_secret
    JWT_REFRESH_SECRET = var.jwt_refresh_secret
    BASE_URL           = aws_apigatewayv2_stage.lambda.invoke_url
  }
}

module "authorizer_lambda" {
  source               = "./modules/lambda"
  function_name        = "authorizer"
  handler              = "authorizer.handler.lambda_handler"
  aws_region           = var.aws_region
  bucket_name          = var.bucket_name
  api_gw_id            = aws_apigatewayv2_api.lambda.id
  api_gw_execution_arn = aws_apigatewayv2_api.lambda.execution_arn
  enable_authorizer    = false
  env_var = {
    JWT_SECRET = var.jwt_secret
  }
}

module "search_lambda" {
  source               = "./modules/lambda"
  function_name        = "search"
  handler              = "search.handler.handler"
  aws_region           = var.aws_region
  bucket_name          = var.bucket_name
  api_gw_id            = aws_apigatewayv2_api.lambda.id
  api_gw_execution_arn = aws_apigatewayv2_api.lambda.execution_arn
  enable_authorizer    = false

  env_var = {
    DB_NAME     = var.cockroach_sql_database
    DB_USER     = var.db_search_user
    DB_PASSWORD = var.db_search_password
    DB_HOST     = var.cockroach_sql_host
    DB_PORT     = var.cockroach_sql_port
  }
}

module "user_lambda" {
  source               = "./modules/lambda"
  function_name        = "user"
  handler              = "user.handler.handler"
  aws_region           = var.aws_region
  bucket_name          = var.bucket_name
  api_gw_id            = aws_apigatewayv2_api.lambda.id
  api_gw_execution_arn = aws_apigatewayv2_api.lambda.execution_arn
  authorizer_id        = aws_apigatewayv2_authorizer.lambda_authorizer.id
  enable_authorizer    = true

  env_var = {
    DB_NAME     = var.cockroach_sql_database
    DB_USER     = var.db_user_user
    DB_PASSWORD = var.db_user_password
    DB_HOST     = var.cockroach_sql_host
    DB_PORT     = var.cockroach_sql_port
  }

  depends_on = [aws_apigatewayv2_authorizer.lambda_authorizer]
}

module "popcorn_lambda" {
  source               = "./modules/lambda"
  function_name        = "popcorn"
  handler              = "popcorn.handler.lambda_handler"
  aws_region           = var.aws_region
  bucket_name          = var.bucket_name
  api_gw_id            = aws_apigatewayv2_api.lambda.id
  api_gw_execution_arn = aws_apigatewayv2_api.lambda.execution_arn
  enable_authorizer    = false

  env_var = {
    DB_NAME      = var.cockroach_sql_database
    DB_USER      = var.db_popcorn_user
    DB_PASSWORD  = var.db_popcorn_password
    DB_HOST      = var.cockroach_sql_host
    DB_PORT      = var.cockroach_sql_port
    app_base_url = var.app_base_url
  }
}

module "connections_lambda" {
  source               = "./modules/lambda"
  function_name        = "connections"
  handler              = "connections.handler.lambda_handler"
  aws_region           = var.aws_region
  bucket_name          = var.bucket_name
  api_gw_id            = aws_apigatewayv2_api.lambda.id
  api_gw_execution_arn = aws_apigatewayv2_api.lambda.execution_arn
  enable_authorizer    = false

  env_var = {
    DB_NAME             = var.cockroach_sql_database
    DB_USER             = var.db_popcorn_user
    DB_PASSWORD         = var.db_popcorn_password
    DB_HOST             = var.cockroach_sql_host
    DB_PORT             = var.cockroach_sql_port
    TELEGRAM_CLIENT_ID  = var.telegram_client_id
    TELEGRAM_SECRET     = var.telegram_secret
    DISCORD_CLIENT_ID   = var.discord_client_id
    DISCORD_SECRET      = var.discord_secret
    INSTAGRAM_CLIENT_ID = var.instagram_client_id
    INSTAGRAM_SECRET    = var.instagram_secret
    TWITTER_CLIENT_ID   = var.twitter_client_id
    TWITTER_SECRET      = var.twitter_secret
    BASE_URL            = aws_apigatewayv2_stage.lambda.invoke_url
  }
}

module "seat_lambda" {
  source               = "./modules/lambda"
  function_name        = "seat"
  handler              = "seat.handler.lambda_handler"
  aws_region           = var.aws_region
  bucket_name          = var.bucket_name
  api_gw_id            = aws_apigatewayv2_api.lambda.id
  api_gw_execution_arn = aws_apigatewayv2_api.lambda.execution_arn
  enable_authorizer    = false

  env_var = {
    DB_NAME     = var.cockroach_sql_database
    DB_USER     = var.db_seat_user
    DB_PASSWORD = var.db_seat_password
    DB_HOST     = var.cockroach_sql_host
    DB_PORT     = var.cockroach_sql_port
  }
}


####################################
# AUTHORIZER
####################################
resource "aws_apigatewayv2_authorizer" "lambda_authorizer" {
  name                       = "sw-authorizer"
  api_id                     = aws_apigatewayv2_api.lambda.id
  authorizer_type            = "REQUEST"
  identity_sources           = ["$request.header.Authorization"]
  authorizer_credentials_arn = aws_iam_role.apig_lambda_role.arn
  authorizer_uri = module.authorizer_lambda.invoke_arn
  authorizer_payload_format_version = "2.0"
}

data "aws_iam_policy_document" "apig_lambda_policy" {
  statement {
    actions = [
      "lambda:InvokeFunction",
    ]
    effect    = "Allow"
    resources = [module.authorizer_lambda.arn]
    sid       = "ApiGatewayInvokeLambda"
  }
}

data "aws_iam_policy_document" "apig_lambda_role_assume" {
  statement {
    actions = [
      "sts:AssumeRole",
    ]
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["apigateway.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "apig_lambda_role" {
  name               = "apigateway-authorize-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.apig_lambda_role_assume.json
}

resource "aws_iam_policy" "apig_lambda" {
  name   = "apig-lambda-policy"
  policy = data.aws_iam_policy_document.apig_lambda_policy.json
}

resource "aws_iam_role_policy_attachment" "apig_lambda_role_to_policy" {
  role       = aws_iam_role.apig_lambda_role.name
  policy_arn = aws_iam_policy.apig_lambda.arn
}

####################################
# LAMBDA LAYERS 
####################################
data "klayers_package_latest_version" "cryptography" {
  name           = "cryptography"
  region         = var.aws_region
  python_version = "3.12"
}