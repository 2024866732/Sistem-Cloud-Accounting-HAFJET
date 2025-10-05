provider "aws" {
  region = var.aws_region
}

resource "aws_s3_bucket" "backup_bucket" {
  bucket = var.s3_bucket_name

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }

  lifecycle_rule {
    id      = "backup-retention"
    enabled = true
    prefix  = "backups/"

    expiration {
      days = var.retention_days
    }
  }
}

resource "aws_iam_user" "backup_uploader" {
  name = "hafjet-backup-uploader"
}

resource "aws_iam_access_key" "backup_uploader_key" {
  user = aws_iam_user.backup_uploader.name
}

resource "aws_iam_policy" "backup_uploader_policy" {
  name        = "hafjet-backup-uploader-policy"
  description = "Minimal S3 access for backup uploads"
  policy      = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action   = ["s3:PutObject","s3:GetObject","s3:ListBucket"],
        Effect   = "Allow",
        Resource = [
          "arn:aws:s3:::${var.s3_bucket_name}",
          "arn:aws:s3:::${var.s3_bucket_name}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_user_policy_attachment" "backup_attach" {
  user       = aws_iam_user.backup_uploader.name
  policy_arn = aws_iam_policy.backup_uploader_policy.arn
}

variable "s3_bucket_name" {}
variable "aws_region" { default = "ap-southeast-1" }
variable "retention_days" { default = 30 }
