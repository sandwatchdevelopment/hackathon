resource "aws_lambda_function" "this" {
    function_name       = var.function_name
    handler             = var.handler
    role                = aws_iam_role.lambda_exec.arn
    runtime             = "python3.12"
    s3_bucket           = data.aws_s3_bucket.lambda_bucket.id
    s3_key              = "lambda-packages/${var.function_name}.zip"
    source_code_hash = data.aws_s3_object.lambda_package.etag

    # Only update if the S3 object is not empty
    # lifecycle {
    #     ignore_changes = all
    # }

    layers             = var.layers_arn != null ? [var.layers_arn] : []

    dynamic "environment" {
      for_each = length(keys(var.env_var)) == 0 ? [] : [true]
      content {
        variables = var.env_var
      }
    }
}

resource "aws_apigatewayv2_integration" "this" {
    api_id              = var.api_gw_id
    integration_uri     = aws_lambda_function.this.invoke_arn
    integration_type    = "AWS_PROXY"
    integration_method  = "POST"
}

resource "aws_apigatewayv2_route" "this" {
    api_id              = var.api_gw_id
    route_key           = "ANY /${var.function_name}/{proxy+}"
    target              = "integrations/${aws_apigatewayv2_integration.this.id}"
    authorizer_id       = var.enable_authorizer && var.authorizer_id != "" ? var.authorizer_id : null
    authorization_type  = var.enable_authorizer && var.authorizer_id != "" ? "CUSTOM" : "NONE"
}

resource "aws_lambda_permission" "this" {
    statement_id        = "AllowExecutionFromAPIGateway"
    action              = "lambda:InvokeFunction"
    function_name       = aws_lambda_function.this.function_name
    principal           = "apigateway.amazonaws.com"
    source_arn          = "${var.api_gw_execution_arn}/*/*"
}


####################################
# LAMBDA ROLE 
####################################
resource "aws_iam_role" "lambda_exec" {
  name = format("%s_%s",var.aws_region,var.function_name)

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

####################################
# S3 LAMBDA BUCKET
####################################
data "aws_s3_bucket" "lambda_bucket" {
  bucket = var.bucket_name
}

data "aws_s3_object" "lambda_package" {
  bucket = var.bucket_name
  key    = "lambda-packages/${var.function_name}.zip"
}

resource "aws_s3_bucket_ownership_controls" "lambda_bucket" {
  bucket = data.aws_s3_bucket.lambda_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "lambda_bucket" {
  depends_on = [aws_s3_bucket_ownership_controls.lambda_bucket]

  bucket = data.aws_s3_bucket.lambda_bucket.id
  acl    = "private"
}

# resource "null_resource" "lambda_update_check" {
#   triggers = {
#     s3_object_version = data.aws_s3_object.lambda_package.version_id
#   }

#   provisioner "local-exec" {
#     command = <<EOF
#       S3_OBJECT_SIZE=$(aws s3api head-object --bucket ${var.bucket_name} --key ${data.aws_s3_object.lambda_package.key} --query 'ContentLength' --output text --region ${var.aws_region})
#       if [ "$S3_OBJECT_SIZE" != "0" ]; then
#         aws lambda update-function-code --function-name ${aws_lambda_function.this.function_name} --s3-bucket ${var.bucket_name} --s3-key ${data.aws_s3_object.lambda_package.key} --region ${var.aws_region}
#       else
#         echo "S3 object is empty. Skipping Lambda update."
#       fi
#     EOF
#   }
# }