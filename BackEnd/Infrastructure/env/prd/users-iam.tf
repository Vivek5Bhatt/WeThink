# This file contains the IAM Permissions and Groups specific for the Developer Users.
# Assignment of users to the group is done manually throught the UI.



#==========================
# IAM - All Developers
#==========================

resource "aws_iam_group" "all-developers" {
  name = "All-Developers"
  path = "/users/"
}

resource "aws_iam_group_membership" "all-developers" {
  name = "wethink-all-developers-group-membership"

  users = [
    "Ankit_Himanshu",
    "CarlosVal",
    "Daniel_Ramteke",
    "info@matrixmarketers.com",
    "Terraform"
  ]

  group = aws_iam_group.all-developers.name
}
resource "aws_iam_group_policy_attachment" "all-developers-policy-attach" {
  for_each = toset([
    "arn:aws:iam::aws:policy/AmazonEC2ReadOnlyAccess",
    "arn:aws:iam::aws:policy/CloudWatchReadOnlyAccess",
    "arn:aws:iam::aws:policy/IAMReadOnlyAccess",
    "arn:aws:iam::aws:policy/AmazonRoute53ReadOnlyAccess",
    "arn:aws:iam::aws:policy/AmazonVPCReadOnlyAccess",
    "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess",
    "arn:aws:iam::aws:policy/AWSCloudTrail_ReadOnlyAccess",
    "arn:aws:iam::aws:policy/AWSCodePipelineReadOnlyAccess",
    "arn:aws:iam::aws:policy/AutoScalingReadOnlyAccess",
    "arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess"
  ])

  group      = aws_iam_group.all-developers.name
  policy_arn = each.value
}

#==========================
# IAM - Backend-Developers
#==========================
resource "aws_iam_group" "backend-developers" {
  name = "Backend-Developers"
  path = "/users/"
}

resource "aws_iam_group_membership" "backend-developers" {
  name = "wethink-backend-developers-group-membership"

  users = ["info@matrixmarketers.com"]

  group = aws_iam_group.backend-developers.name
}

module "iam_policy_backend-developers" {
  source = "terraform-aws-modules/iam/aws//modules/iam-policy"

  name        = "wethink-backend-developers"
  path        = "/users/"
  description = "Policy to allow different specific permissions for Backend Developers"

  policy = templatefile("../../files/policies/users/AmazonIAMGroup_BackendDevelopers.json", {
    region     = data.aws_region.current.name,
    account_id = var.allowed_account_ids[0]
  })
}

resource "aws_iam_group_policy_attachment" "backend-developers-policy-attach-read" {
  for_each = toset([
    "arn:aws:iam::aws:policy/AWSCodePipelineFullAccess",
    "arn:aws:iam::aws:policy/AmazonOpenSearchServiceReadOnlyAccess",
    "arn:aws:iam::aws:policy/AmazonRDSReadOnlyAccess",
    "arn:aws:iam::aws:policy/AWSCodeBuildReadOnlyAccess",
    "arn:aws:iam::aws:policy/AWSCodeDeployReadOnlyAccess",
    "arn:aws:iam::aws:policy/AWSLambda_ReadOnlyAccess",
    "arn:aws:iam::aws:policy/CloudFrontReadOnlyAccess",
    "arn:aws:iam::aws:policy/AWSCodePipelineApproverAccess"
  ])

  group      = aws_iam_group.backend-developers.name
  policy_arn = each.value
}

resource "aws_iam_group_policy_attachment" "backend-developers-policy-attach-custom" {
  group      = aws_iam_group.backend-developers.name
  policy_arn = module.iam_policy_backend-developers.arn
}

# This needs to be reworked -- Too much permissions grant then "arn:aws:iam::aws:policy/AmazonElasticTranscoder_JobsSubmitter"
resource "aws_iam_group_policy_attachment" "backend-developers-policy-attach-full" {
  group      = aws_iam_group.backend-developers.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}


#==========================
# IAM - App-Developers
#==========================
resource "aws_iam_group" "app-developers" {
  name = "App-Developers"
  path = "/users/"
}

resource "aws_iam_group_membership" "app-developers" {
  name = "wethink-app-developers-group-membership"

  users = ["Daniel_Ramteke"]

  group = aws_iam_group.app-developers.name
}

module "iam_policy_app-developers" {
  source = "terraform-aws-modules/iam/aws//modules/iam-policy"

  name        = "wethink-app-developers"
  path        = "/users/"
  description = "Policy to allow different specific permissions for Application Developers"

  policy = templatefile("../../files/policies/users/AmazonIAMGroup_AppDevelopers.json", {
    region     = data.aws_region.current.name,
    account_id = var.allowed_account_ids[0]
  })
}

resource "aws_iam_group_policy_attachment" "app-developers-policy-attach-read" {
  for_each = toset([
    "arn:aws:iam::aws:policy/AWSCodePipelineFullAccess",
    "arn:aws:iam::aws:policy/AmazonOpenSearchServiceReadOnlyAccess",
    "arn:aws:iam::aws:policy/AmazonRDSReadOnlyAccess",
    "arn:aws:iam::aws:policy/AWSCodeBuildReadOnlyAccess",
    "arn:aws:iam::aws:policy/AWSCodeDeployReadOnlyAccess",
    "arn:aws:iam::aws:policy/AWSLambda_ReadOnlyAccess",
    "arn:aws:iam::aws:policy/CloudFrontReadOnlyAccess",
    "arn:aws:iam::aws:policy/AWSCodePipelineApproverAccess"
  ])

  group      = aws_iam_group.app-developers.name
  policy_arn = each.value
}

resource "aws_iam_group_policy_attachment" "app-developers-policy-attach-custom" {
  group      = aws_iam_group.app-developers.name
  policy_arn = module.iam_policy_app-developers.arn
}

# This needs to be reworked -- Too much permissions
resource "aws_iam_group_policy_attachment" "app-developers-policy-attach-full" {
  group      = aws_iam_group.app-developers.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

#=================================
# IAM - OpenSearch-Developers
#=================================
resource "aws_iam_group" "opensearch-developers" {
  name = "Opensearch-Developers"
  path = "/users/"
}

resource "aws_iam_group_membership" "opensearch-developers" {
  name = "wethink-opensearch-developers-group-membership"

  users = [
    "Ankit_Himanshu"
  ]

  group = aws_iam_group.opensearch-developers.name
}

module "iam_policy_opensearch-developers" {
  source = "terraform-aws-modules/iam/aws//modules/iam-policy"

  name        = "wethink-opensearch-developers"
  path        = "/users/"
  description = "Policy to allow different specific permissions for OpenSearch Developers"

  policy = templatefile("../../files/policies/users/AmazonIAMGroup_OpenSearchDevelopers.json", {
    region     = data.aws_region.current.name,
    account_id = var.allowed_account_ids[0]
  })
}

resource "aws_iam_group_policy_attachment" "opensearch-developers-policy-attach-read" {
  for_each = toset([
    "arn:aws:iam::aws:policy/AWSCodePipelineFullAccess",
    "arn:aws:iam::aws:policy/AmazonOpenSearchServiceReadOnlyAccess",
    "arn:aws:iam::aws:policy/AmazonRDSReadOnlyAccess",
    "arn:aws:iam::aws:policy/AWSCodeBuildReadOnlyAccess",
    "arn:aws:iam::aws:policy/AWSCodeDeployReadOnlyAccess",
    "arn:aws:iam::aws:policy/AWSLambda_ReadOnlyAccess",
    "arn:aws:iam::aws:policy/CloudFrontReadOnlyAccess",
    "arn:aws:iam::aws:policy/AWSCodePipelineApproverAccess",
    "arn:aws:iam::aws:policy/AmazonElasticTranscoder_JobsSubmitter"
  ])

  group      = aws_iam_group.opensearch-developers.name
  policy_arn = each.value
}

resource "aws_iam_group_policy_attachment" "opensearch-developers-policy-attach-custom" {
  group      = aws_iam_group.opensearch-developers.name
  policy_arn = module.iam_policy_opensearch-developers.arn
}

#==========================
# IAM - DevOps
#==========================
resource "aws_iam_group" "devops" {
  name = "DevOps"
  path = "/users/"
}

resource "aws_iam_group_membership" "devops" {
  name = "wethink-devops-group-membership"

  users = [
    "Daniel_Ramteke",
    "CarlosVal",
    "Terraform"
  ]

  group = aws_iam_group.devops.name
}

resource "aws_iam_group_policy_attachment" "devops-policy-attach-full" {
  group      = aws_iam_group.devops.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

