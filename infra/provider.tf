provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      repo = "aws-sw-tf"
    }
  }
}