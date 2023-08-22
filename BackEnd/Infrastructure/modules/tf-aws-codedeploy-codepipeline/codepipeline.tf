
resource "aws_codepipeline" "this" {
  count    = local.create ? 1 : 0
  name     = local.full_name
  role_arn = aws_iam_role.codepipeline[0].arn

  artifact_store {
    location = var.s3_codepipeline_bucket_name
    type     = "S3"
  }

  stage {
    name = "Source"

    action {
      name             = "Source"
      category         = "Source"
      owner            = "AWS"
      provider         = "CodeStarSourceConnection"
      version          = "1"
      output_artifacts = ["source_output"]

      configuration = {
        ConnectionArn    = var.codestar_connection_arn
        FullRepositoryId = var.pipeline_repository_id
        BranchName       = var.pipeline_branch_name
      }
    }
  }

  dynamic "stage" {
    for_each = var.pipeline_approval_step ? { pipeline_approval = true } : {}
    content {
      name = "Approve"

      action {
        name     = "Approval"
        category = "Approval"
        owner    = "AWS"
        provider = "Manual"
        version  = "1"

      }

    }
  }

  dynamic "stage" {
    for_each = var.pipeline_build_step ? { pipeline_build = true } : {}
    content {
      name = "Build"

      action {
        name             = "Build"
        category         = "Build"
        owner            = "AWS"
        provider         = "CodeBuild"
        version          = "1"
        input_artifacts  = ["source_output"]
        output_artifacts = ["build_output"]

        configuration = {
          ProjectName = aws_codebuild_project.this[0].name
        }
      }

    }
  }

  stage {
    name = "Deploy"

    action {
      name            = "Deploy"
      category        = "Deploy"
      owner           = "AWS"
      provider        = "CodeDeploy"
      input_artifacts = var.pipeline_build_step ? ["build_output"] : ["source_output"]
      version         = "1"

      configuration = {
        ApplicationName     = aws_codedeploy_app.this[0].name
        DeploymentGroupName = aws_codedeploy_deployment_group.this[0].deployment_group_name
      }
      namespace = "DeployVariables"
    }
  }
}
