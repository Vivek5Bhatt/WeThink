resource "aws_codedeploy_app" "this" {
  count = local.create ? 1 : 0
  name  = local.full_name

  tags = merge(
    {
      "Name" = local.full_name
    },
    var.tags,
  )
}
resource "aws_codedeploy_deployment_group" "this" {
  count                 = local.create ? 1 : 0
  app_name              = aws_codedeploy_app.this[0].name
  deployment_group_name = local.full_name
  service_role_arn      = aws_iam_role.codedeploy[0].arn

  autoscaling_groups = var.asg_group_name

  tags = merge(
    {
      "Name" = local.full_name
    },
    var.tags,
  )
}
