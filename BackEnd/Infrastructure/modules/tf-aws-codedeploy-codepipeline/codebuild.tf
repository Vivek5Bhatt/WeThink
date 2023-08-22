resource "aws_codebuild_project" "this" {
  count         = local.create && var.pipeline_build_step ? 1 : 0
  name          = local.full_name
  build_timeout = var.codebuild_build_timeout
  service_role  = aws_iam_role.codebuild[0].arn

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type = var.codebuild_compute_type
    // https://docs.aws.amazon.com/codebuild/latest/userguide/build-env-ref-available.html
    image                       = var.codebuild_base_image
    type                        = var.codebuild_container_type
    privileged_mode             = var.codebuild_run_prileged_mode
    image_pull_credentials_type = var.codebuild_image_pull_credentials_type
  }
  source {
    type                = "CODEPIPELINE"
    buildspec           = var.codebuild_buildspec
    git_clone_depth     = 0
    insecure_ssl        = false
    report_build_status = false
  }

  vpc_config {
    vpc_id             = var.vpc_id
    subnets            = var.vpc_subnets_private
    security_group_ids = ["${aws_security_group.codebuild[0].id}"]
  }

  tags = merge(
    {
      "Name" = local.full_name
    },
    var.tags,
  )
}
