output "api_gateway_id" {
  value = aws_apigatewayv2_api.lambda.id
}

output "api_gateway_base_url" {
  description = "Base URL for API Gateway stage."
  value       = aws_apigatewayv2_stage.lambda.invoke_url
}
