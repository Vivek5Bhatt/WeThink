<!-- BEGIN_TF_DOCS -->
## Requirements

No requirements.

## Providers

| Name | Version |
|------|---------|
| <a name="provider_aws"></a> [aws](#provider\_aws) | n/a |

## Modules

No modules.

## Resources

| Name | Type |
|------|------|
| [aws_codebuild_project.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/codebuild_project) | resource |
| [aws_codedeploy_app.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/codedeploy_app) | resource |
| [aws_codedeploy_deployment_group.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/codedeploy_deployment_group) | resource |
| [aws_codepipeline.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/codepipeline) | resource |
| [aws_iam_role.codebuild](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role) | resource |
| [aws_iam_role.codedeploy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role) | resource |
| [aws_iam_role.codepipeline](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role) | resource |
| [aws_iam_role_policy.codebuild](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy) | resource |
| [aws_iam_role_policy.codepipeline](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy) | resource |
| [aws_iam_role_policy_attachment.codedeploy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |
| [aws_security_group.codebuild](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group) | resource |
| [aws_iam_policy.aws-codedeploy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_account_id"></a> [account\_id](#input\_account\_id) | Current VPC ID | `string` | `"vpc-12345"` | no |
| <a name="input_app"></a> [app](#input\_app) | App name | `string` | `"web"` | no |
| <a name="input_asg_group_name"></a> [asg\_group\_name](#input\_asg\_group\_name) | AutoScaling Group Name to attach to codedeploy | `list(string)` | `null` | no |
| <a name="input_codebuild_base_image"></a> [codebuild\_base\_image](#input\_codebuild\_base\_image) | The image identifier of the Docker image to use for this build project - list of Docker images provided by AWS CodeBuild -> https://docs.aws.amazon.com/codebuild/latest/userguide/build-env-ref-available.html | `string` | `"aws/codebuild/standard:6.0"` | no |
| <a name="input_codebuild_build_timeout"></a> [codebuild\_build\_timeout](#input\_codebuild\_build\_timeout) | default timeout in minutes for the build to be completed | `string` | `"10"` | no |
| <a name="input_codebuild_buildspec"></a> [codebuild\_buildspec](#input\_codebuild\_buildspec) | codebuild buildspec definition | `string` | `"none"` | no |
| <a name="input_codebuild_compute_type"></a> [codebuild\_compute\_type](#input\_codebuild\_compute\_type) | Information about the compute resources the build project will use. Available values for this parameter are: BUILD\_GENERAL1\_SMALL, BUILD\_GENERAL1\_MEDIUM or BUILD\_GENERAL1\_LARGE. BUILD\_GENERAL1\_SMALL is only valid if type is set to LINUX\_CONTAINER | `string` | `"BUILD_GENERAL1_SMALL"` | no |
| <a name="input_codebuild_container_type"></a> [codebuild\_container\_type](#input\_codebuild\_container\_type) | The type of build environment to use for related builds. Available values are: LINUX\_CONTAINER or WINDOWS\_CONTAINER | `string` | `"LINUX_CONTAINER"` | no |
| <a name="input_codebuild_image_pull_credentials_type"></a> [codebuild\_image\_pull\_credentials\_type](#input\_codebuild\_image\_pull\_credentials\_type) | OPTIONAL: The type of credentials AWS CodeBuild uses to pull images in your build. Available values for this parameter are CODEBUILD or SERVICE\_ROLE | `string` | `"CODEBUILD"` | no |
| <a name="input_codebuild_run_prileged_mode"></a> [codebuild\_run\_prileged\_mode](#input\_codebuild\_run\_prileged\_mode) | If set to true, enables running the Docker daemon inside a Docker container. | `bool` | `true` | no |
| <a name="input_codestar_connection_arn"></a> [codestar\_connection\_arn](#input\_codestar\_connection\_arn) | ARN of the AWS CodeStar connection to the bitbucket repo | `string` | `"none"` | no |
| <a name="input_create"></a> [create](#input\_create) | Determines whether to create this module resources or not | `bool` | `true` | no |
| <a name="input_env"></a> [env](#input\_env) | Environment | `string` | `"dev"` | no |
| <a name="input_name"></a> [name](#input\_name) | Project Name | `string` | `"wethink"` | no |
| <a name="input_pipeline_approval_step"></a> [pipeline\_approval\_step](#input\_pipeline\_approval\_step) | Whenever to configure in CodePipeline the Approval step | `bool` | `false` | no |
| <a name="input_pipeline_approve_comment"></a> [pipeline\_approve\_comment](#input\_pipeline\_approve\_comment) | Comment to add to the approval message to help with the review | `string` | `"Please approve to deploy in"` | no |
| <a name="input_pipeline_approve_sns_arn"></a> [pipeline\_approve\_sns\_arn](#input\_pipeline\_approve\_sns\_arn) | ARN of the SNS topic to send the approval message to | `string` | `"none"` | no |
| <a name="input_pipeline_approve_url"></a> [pipeline\_approve\_url](#input\_pipeline\_approve\_url) | URL of the APP tot be approved on CodePipeline to be reviewed | `string` | `"http://dev.getwethink.com/we-think-admin/v1/api-docs/"` | no |
| <a name="input_pipeline_branch_name"></a> [pipeline\_branch\_name](#input\_pipeline\_branch\_name) | Name of the branch to track and deploy using AWS Pipeline | `string` | `"master"` | no |
| <a name="input_pipeline_build_step"></a> [pipeline\_build\_step](#input\_pipeline\_build\_step) | Whenever to configure in CodePipeline the Codebuild step | `bool` | `true` | no |
| <a name="input_pipeline_repository_id"></a> [pipeline\_repository\_id](#input\_pipeline\_repository\_id) | Path to the git repository of the App | `string` | `"mmoirano/none"` | no |
| <a name="input_region"></a> [region](#input\_region) | Current AWS Region | `string` | `"us-east-1"` | no |
| <a name="input_s3_codepipeline_bucket_name"></a> [s3\_codepipeline\_bucket\_name](#input\_s3\_codepipeline\_bucket\_name) | Name of the s3 bucket to store the Codepipeline Artifacts | `string` | `"none"` | no |
| <a name="input_tags"></a> [tags](#input\_tags) | A mapping of tags to assign to the resource | `map(string)` | n/a | yes |
| <a name="input_vpc_id"></a> [vpc\_id](#input\_vpc\_id) | VPC ID | `string` | `"vpc-12345"` | no |
| <a name="input_vpc_subnets_private"></a> [vpc\_subnets\_private](#input\_vpc\_subnets\_private) | VPC Subnets, needed to run Codebuild inside the VPC subnets | `list(string)` | `[]` | no |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_aws_codepipeline_arn"></a> [aws\_codepipeline\_arn](#output\_aws\_codepipeline\_arn) | The ARN of the CodePipeline |
| <a name="output_aws_iam_role_codebuild_arn"></a> [aws\_iam\_role\_codebuild\_arn](#output\_aws\_iam\_role\_codebuild\_arn) | The IAM Role arn of the CodeBuild project |
| <a name="output_aws_iam_role_codedeploy_arn"></a> [aws\_iam\_role\_codedeploy\_arn](#output\_aws\_iam\_role\_codedeploy\_arn) | The IAM Role arn of the CodeDeploy project |
| <a name="output_codebuild_sg_id"></a> [codebuild\_sg\_id](#output\_codebuild\_sg\_id) | The ID of the CodeBuild Security Group |
<!-- END_TF_DOCS -->