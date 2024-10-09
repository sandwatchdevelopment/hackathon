variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "AWS_SECRET_ACCESS_KEY" {
  type = string
}

variable "AWS_ACCESS_KEY_ID" {
  type = string
}

variable "bucket_name" {
  type = string
}

variable "is_primary_region" {
  description = "Denotes if the region is primary or secondary."
  type        = bool
}

####################################
# COCKROACHDB
####################################
variable "cockroach_sql_database" {
  type      = string
  nullable  = false
  sensitive = true
}

variable "cockroach_sql_host" {
  type      = string
  nullable  = false
  sensitive = true
}

variable "cockroach_sql_port" {
  type      = string
  nullable  = false
  sensitive = true
}

# Remember that even variables marked sensitive will show up
# in the Terraform state file. Always follow best practices
# when managing sensitive info.
variable "cockroach_sql_user_password" {
  type      = string
  nullable  = false
  sensitive = true
}


####################################
# USER LAMBDA
####################################
variable "db_user_user" {
  type     = string
  nullable = false
}

variable "db_user_password" {
  type      = string
  nullable  = false
  sensitive = true
}

####################################
# SEARCH LAMBDA
####################################
variable "db_search_user" {
  type     = string
  nullable = false
}

variable "db_search_password" {
  type      = string
  nullable  = false
  sensitive = true
}

####################################
# POPCORN LAMBDA
####################################
variable "db_popcorn_user" {
  type     = string
  nullable = false
}

variable "db_popcorn_password" {
  type      = string
  nullable  = false
  sensitive = true
}

####################################
# SEAT LAMBDA
####################################
variable "db_seat_user" {
  type     = string
  nullable = false
}

variable "db_seat_password" {
  type      = string
  nullable  = false
  sensitive = true
}

####################################
# AUTH LAMBDA
####################################
variable "db_auth_user" {
  type     = string
  nullable = false
}

variable "db_auth_password" {
  type      = string
  nullable  = false
  sensitive = true
}

variable "jwt_secret" {
  type      = string
  nullable  = false
  sensitive = true
}

variable "jwt_refresh_secret" {
  type      = string
  nullable  = false
  sensitive = true
}


################
# CONNECTIONS
################
variable "telegram_client_id" {
  description = "Telegram Client ID"
  type        = string
}

variable "telegram_secret" {
  description = "Telegram Secret"
  type        = string
  sensitive   = true
}

variable "discord_client_id" {
  description = "Discord Client ID"
  type        = string
}

variable "discord_secret" {
  description = "Discord Secret"
  type        = string
  sensitive   = true
}

variable "instagram_client_id" {
  description = "Instagram Client ID"
  type        = string
}

variable "instagram_secret" {
  description = "Instagram Secret"
  type        = string
  sensitive   = true
}

variable "twitter_client_id" {
  description = "Twitter Client ID"
  type        = string
}

variable "twitter_secret" {
  description = "Twitter Secret"
  type        = string
  sensitive   = true
}

variable "app_base_url" {
  description = "frontend app url"
  type        = string
}