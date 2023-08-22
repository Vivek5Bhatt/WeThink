# Codebuild
resource "aws_iam_role" "codebuild" {
  count = local.create && var.pipeline_build_step ? 1 : 0
  name  = "${local.full_name}-codebuild-role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "codebuild.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

  tags = merge(
    {
      "Name" = local.full_name
    },
    var.tags,
  )
}

resource "aws_iam_role_policy" "codebuild" {
  count = local.create && var.pipeline_build_step ? 1 : 0
  name  = "${local.full_name}-codebuild_policy"
  role  = aws_iam_role.codebuild[0].id

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Resource": [
                "arn:aws:logs:us-east-1:074783170632:log-group:/aws/codebuild/${local.full_name}",
                "arn:aws:logs:us-east-1:074783170632:log-group:/aws/codebuild/${local.full_name}:*"
            ],
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ]
        },
        {
            "Effect": "Allow",
            "Resource": [
                "arn:aws:s3:::${var.s3_codepipeline_bucket_name}/*"
            ],
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:GetObjectVersion",
                "s3:GetBucketAcl",
                "s3:GetBucketLocation"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "ssm:DescribeParameters",
                "ec2:DescribeSecurityGroups",
                "ec2:DescribeSubnets",
                "ec2:CreateNetworkInterface",
                "ec2:DescribeNetworkInterfaces",
                "ec2:DeleteNetworkInterface",
                "ec2:DescribeDhcpOptions",
                "ec2:DescribeVpcs",
                "ec2:CreateNetworkInterfacePermission"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "ssm:GetParameters"
            ],
            "Resource": "arn:aws:ssm:${var.region}:${var.account_id}:parameter/${var.name}-${var.env}/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "codebuild:CreateReportGroup",
                "codebuild:CreateReport",
                "codebuild:UpdateReport",
                "codebuild:BatchPutTestCases",
                "codebuild:BatchPutCodeCoverages"
            ],
            "Resource": [
                "arn:aws:codebuild:us-east-1:074783170632:report-group/${local.full_name}-*"
            ]
        }
    ]
}
EOF
}

# Codedeploy
resource "aws_iam_role" "codedeploy" {
  count = local.create ? 1 : 0
  name  = "${local.full_name}-codeploy-role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "codedeploy.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

  tags = merge(
    {
      "Name" = local.full_name
    },
    var.tags,
  )
}


# Get the AWS managed Codeploy Role policy
data "aws_iam_policy" "aws-codedeploy" {
  name = "AWSCodeDeployRole"
}

# Attach the previous policy to the codedeploy role
resource "aws_iam_role_policy_attachment" "codedeploy" {
  count      = local.create ? 1 : 0
  role       = aws_iam_role.codedeploy[0].name
  policy_arn = data.aws_iam_policy.aws-codedeploy.arn
}

# CodePipeline
resource "aws_iam_role" "codepipeline" {
  count = local.create ? 1 : 0
  name  = "${local.full_name}-codepipeline-role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "codepipeline.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
  tags = merge(
    {
      "Name" = local.full_name
    },
    var.tags,
  )
}

resource "aws_iam_role_policy" "codepipeline" {
  count = local.create ? 1 : 0
  name  = "${local.full_name}-codepipeline_policy"
  role  = aws_iam_role.codepipeline[0].id

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect":"Allow",
      "Action": [
        "s3:GetObject",
        "s3:GetObjectVersion",
        "s3:GetBucketVersioning",
        "s3:PutObjectAcl",
        "s3:PutObject"
      ],
      "Resource": [
        "arn:aws:s3:::${var.s3_codepipeline_bucket_name}",
        "arn:aws:s3:::${var.s3_codepipeline_bucket_name}/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "codestar-connections:UseConnection"
      ],
      "Resource": "${var.codestar_connection_arn}"
    },
    {
      "Effect": "Allow",
      "Action": [
        "codebuild:BatchGetBuilds",
        "codebuild:StartBuild"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "codedeploy:CreateDeployment",
        "codedeploy:GetApplicationRevision",
        "codedeploy:GetApplication",
        "codedeploy:GetDeployment",
        "codedeploy:GetDeploymentConfig",
        "codedeploy:RegisterApplicationRevision"
      ],
      "Resource": "*"
    }
  ]
}
EOF
}
