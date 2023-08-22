# Lambda Function
output "aws_codepipeline_arn" {
  description = "The ARN of the CodePipeline"
  value       = try(aws_codepipeline.this[0].arn, "")
}

output "codebuild_sg_id" {
  description = "The ID of the CodeBuild Security Group"
  value       = try(aws_security_group.codebuild[0].id, "")
}

output "aws_iam_role_codebuild_arn" {
  description = "The IAM Role arn of the CodeBuild project"
  value       = try(aws_iam_role.codebuild[0].arn, "")
}

output "aws_iam_role_codedeploy_arn" {
  description = "The IAM Role arn of the CodeDeploy project"
  value       = try(aws_iam_role.codedeploy[0].arn, "")
}
