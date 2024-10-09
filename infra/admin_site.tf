# S3 Bucket for Sandwatch Admin App
resource "aws_s3_bucket" "sandwatch_admin_app_bucket" {
  bucket = "sandwatch-admin-app-bucket-${var.aws_region}"
}

resource "aws_s3_bucket_ownership_controls" "admin_bucket" {
  bucket = aws_s3_bucket.sandwatch_admin_app_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "sandwatch_admin_app_bucket" {
  depends_on = [aws_s3_bucket_ownership_controls.admin_bucket]

  bucket = aws_s3_bucket.sandwatch_admin_app_bucket.id
  acl    = "private"
}

resource "aws_s3_bucket_public_access_block" "this" {
  bucket = aws_s3_bucket.sandwatch_admin_app_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = true
  restrict_public_buckets = false
}

resource "aws_s3_account_public_access_block" "example" {
  block_public_acls   = false
  block_public_policy = false
}

resource "aws_s3_bucket_website_configuration" "example" {
  bucket = aws_s3_bucket.sandwatch_admin_app_bucket.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

# S3 Bucket Policy
resource "aws_s3_bucket_policy" "sandwatch_admin_app_bucket_policy" {
  bucket = aws_s3_bucket.sandwatch_admin_app_bucket.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect    = "Allow",
        Principal = "*",
        Action = ["s3:PutObject",
          "s3:PutObjectAcl",
          "s3:GetObject",
          "s3:GetObjectAcl",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.sandwatch_admin_app_bucket.arn}/*"
      }
    ]
  })
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "sandwatch_admin_app_distribution" {
  origin {
    domain_name = aws_s3_bucket.sandwatch_admin_app_bucket.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.sandwatch_admin_app_bucket.id}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.sandwatch_admin_app_identity.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Sandwatch Admin App CloudFront Distribution"
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.sandwatch_admin_app_bucket.id}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

# CloudFront Origin Access Identity
resource "aws_cloudfront_origin_access_identity" "sandwatch_admin_app_identity" {
  comment = "Origin Access Identity for Sandwatch Admin App"
}

# Output the CloudFront URL
output "cloudfront_url" {
  value = aws_cloudfront_distribution.sandwatch_admin_app_distribution.domain_name
}