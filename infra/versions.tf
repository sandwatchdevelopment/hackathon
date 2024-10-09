terraform {

  cloud {
    organization = "sandwatch"
    workspaces {
      name = "aws-sw-tf"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.38.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4.2"
    }
    cockroach = {
      source = "cockroachdb/cockroach"
    }
    klayers = {
      version = "~> 1.0.0"
      source  = "ldcorentin/klayer"
    }
  }

  required_version = "~> 1.2"
}
