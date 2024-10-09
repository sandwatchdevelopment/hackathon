variable "account_id" {
  description = "AWS account ID"
  type        = string
  default = "----------"
}

variable "aws_region" {
  description = "AWS region"
  type    = string
  default = "us-west-2"
}

variable "bucket_name" {
  type    = string
}

variable "function_name" {
  description = "Name of the Lambda function"
  type        = string
}

variable "handler" {
  description = "Lambda function handler"
  type        = string
}

variable "api_gw_id" {
  description = "Api gateway to attach the lambda to"
  type        = string
}

variable "api_gw_execution_arn" {
  description = "Execution arn of api gateway"
  type        = string
}

variable "layers_arn" {
  description = "Arn of a lambda layer"
  type        = string
  default     = null 
}

variable "env_var" {
  description = "Environment variables for the lambda function"
  type = map(string)
  default = {}
}

variable "enable_authorizer" {
  description = "is authorizer attached to the lambda"
  type        = bool
  default     = true
}

variable "authorizer_id" {
  description = "Authorizer for the lambda"
  type        = string
  default     = null
}