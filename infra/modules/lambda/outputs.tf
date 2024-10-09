output "arn" {
  value = aws_lambda_function.this.arn
}

output "id" {
  value = aws_lambda_function.this.id
}

output "invoke_arn" {
  value = aws_lambda_function.this.invoke_arn
}

output "function_name" {
  description = "function name"
  value = aws_lambda_function.this.function_name
}

output "lambda_bucket_name" {
  description = "Name of the S3 bucket used to store function code."
  value = data.aws_s3_bucket.lambda_bucket.id
}