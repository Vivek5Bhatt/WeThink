/* Security Group for Codebuild */
resource "aws_security_group" "codebuild" {
  count       = local.create && var.pipeline_build_step ? 1 : 0
  name        = "${local.full_name}-codebuild"
  description = "Manages traffic from and to Codebuild"
  vpc_id      = var.vpc_id

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    {
      "Name" = "${local.full_name}-codebuild"
    },
    var.tags,
  )
}
