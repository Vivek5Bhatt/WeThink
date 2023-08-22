variable "account_id" {
  description = "Current VPC ID"
  type        = string
  default     = "vpc-12345"
}

variable "app" {
  description = "App name"
  type        = string
  default     = "web"
}

variable "asg_group_name" {
  description = "AutoScaling Group Name to attach to codedeploy"
  type        = list(string)
  default     = null
}

variable "codebuild_base_image" {
  default     = "aws/codebuild/standard:6.0"
  description = "The image identifier of the Docker image to use for this build project - list of Docker images provided by AWS CodeBuild -> https://docs.aws.amazon.com/codebuild/latest/userguide/build-env-ref-available.html"
}

variable "codebuild_build_timeout" {
  default     = "10"
  description = "default timeout in minutes for the build to be completed"
}

variable "codebuild_buildspec" {
  default     = "none"
  description = "codebuild buildspec definition"
}

variable "codebuild_compute_type" {
  default     = "BUILD_GENERAL1_SMALL"
  description = "Information about the compute resources the build project will use. Available values for this parameter are: BUILD_GENERAL1_SMALL, BUILD_GENERAL1_MEDIUM or BUILD_GENERAL1_LARGE. BUILD_GENERAL1_SMALL is only valid if type is set to LINUX_CONTAINER"
}

variable "codebuild_container_type" {
  default     = "LINUX_CONTAINER"
  description = "The type of build environment to use for related builds. Available values are: LINUX_CONTAINER or WINDOWS_CONTAINER"
}

variable "codebuild_image_pull_credentials_type" {
  default     = "CODEBUILD"
  description = "OPTIONAL: The type of credentials AWS CodeBuild uses to pull images in your build. Available values for this parameter are CODEBUILD or SERVICE_ROLE"
}

variable "codebuild_run_prileged_mode" {
  default     = true
  description = "If set to true, enables running the Docker daemon inside a Docker container."
}

variable "codestar_connection_arn" {
  description = "ARN of the AWS CodeStar connection to the bitbucket repo"
  type        = string
  default     = "none"
}

variable "create" {
  description = "Determines whether to create this module resources or not"
  type        = bool
  default     = true
}

variable "env" {
  description = "Environment"
  type        = string
  default     = "dev"
}

variable "name" {
  description = "Project Name"
  type        = string
  default     = "wethink"
}

variable "pipeline_approval_step" {
  description = "Whenever to configure in CodePipeline the Approval step"
  type        = bool
  default     = false
}

variable "pipeline_approve_comment" {
  description = "Comment to add to the approval message to help with the review"
  type        = string
  default     = "Please approve to deploy in"
}

variable "pipeline_approve_sns_arn" {
  description = "ARN of the SNS topic to send the approval message to"
  type        = string
  default     = "none"
}

variable "pipeline_approve_url" {
  description = "URL of the APP tot be approved on CodePipeline to be reviewed"
  type        = string
  default     = "http://dev.getwethink.com/we-think-admin/v1/api-docs/"
}

variable "pipeline_branch_name" {
  description = "Name of the branch to track and deploy using AWS Pipeline"
  type        = string
  default     = "master"
}

variable "pipeline_build_step" {
  description = "Whenever to configure in CodePipeline the Codebuild step"
  type        = bool
  default     = true
}

variable "pipeline_repository_id" {
  description = "Path to the git repository of the App"
  type        = string
  default     = "mmoirano/none"
}

variable "region" {
  description = "Current AWS Region"
  type        = string
  default     = "us-east-1"
}

variable "s3_codepipeline_bucket_name" {
  description = "Name of the s3 bucket to store the Codepipeline Artifacts"
  type        = string
  default     = "none"
}

variable "tags" {
  description = "A mapping of tags to assign to the resource"
  type        = map(string)
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
  default     = "vpc-12345"
}

variable "vpc_subnets_private" {
  default     = []
  type        = list(string)
  description = "VPC Subnets, needed to run Codebuild inside the VPC subnets"
}
