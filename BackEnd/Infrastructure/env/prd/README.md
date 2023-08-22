<!-- BEGIN_TF_DOCS -->
## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | ~> 1.3.3 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_aws"></a> [aws](#provider\_aws) | 4.44.0 |

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_acm"></a> [acm](#module\_acm) | terraform-aws-modules/acm/aws | ~> 4.0 |
| <a name="module_admin-panel"></a> [admin-panel](#module\_admin-panel) | ../../modules/tf-aws-codedeploy-codepipeline | n/a |
| <a name="module_admin-panel-api"></a> [admin-panel-api](#module\_admin-panel-api) | ../../modules/tf-aws-codedeploy-codepipeline | n/a |
| <a name="module_alb-angular"></a> [alb-angular](#module\_alb-angular) | terraform-aws-modules/alb/aws | ~> 6.0 |
| <a name="module_alb-node"></a> [alb-node](#module\_alb-node) | terraform-aws-modules/alb/aws | ~> 6.0 |
| <a name="module_asg-angular"></a> [asg-angular](#module\_asg-angular) | terraform-aws-modules/autoscaling/aws | n/a |
| <a name="module_asg-node"></a> [asg-node](#module\_asg-node) | terraform-aws-modules/autoscaling/aws | n/a |
| <a name="module_cdn_website"></a> [cdn\_website](#module\_cdn\_website) | terraform-aws-modules/cloudfront/aws | n/a |
| <a name="module_codepipeline_bucket"></a> [codepipeline\_bucket](#module\_codepipeline\_bucket) | terraform-aws-modules/s3-bucket/aws | n/a |
| <a name="module_db"></a> [db](#module\_db) | terraform-aws-modules/rds/aws | n/a |
| <a name="module_document_bucket"></a> [document\_bucket](#module\_document\_bucket) | terraform-aws-modules/s3-bucket/aws | n/a |
| <a name="module_iam_policy_app-developers"></a> [iam\_policy\_app-developers](#module\_iam\_policy\_app-developers) | terraform-aws-modules/iam/aws//modules/iam-policy | n/a |
| <a name="module_iam_policy_backend-developers"></a> [iam\_policy\_backend-developers](#module\_iam\_policy\_backend-developers) | terraform-aws-modules/iam/aws//modules/iam-policy | n/a |
| <a name="module_iam_policy_cloudwatch"></a> [iam\_policy\_cloudwatch](#module\_iam\_policy\_cloudwatch) | terraform-aws-modules/iam/aws//modules/iam-policy | n/a |
| <a name="module_iam_policy_opensearch-developers"></a> [iam\_policy\_opensearch-developers](#module\_iam\_policy\_opensearch-developers) | terraform-aws-modules/iam/aws//modules/iam-policy | n/a |
| <a name="module_iam_policy_parameterstore"></a> [iam\_policy\_parameterstore](#module\_iam\_policy\_parameterstore) | terraform-aws-modules/iam/aws//modules/iam-policy | n/a |
| <a name="module_iam_policy_s3"></a> [iam\_policy\_s3](#module\_iam\_policy\_s3) | terraform-aws-modules/iam/aws//modules/iam-policy | n/a |
| <a name="module_iam_policy_stepfunction"></a> [iam\_policy\_stepfunction](#module\_iam\_policy\_stepfunction) | terraform-aws-modules/iam/aws//modules/iam-policy | n/a |
| <a name="module_images_bucket"></a> [images\_bucket](#module\_images\_bucket) | terraform-aws-modules/s3-bucket/aws | n/a |
| <a name="module_lambda_dbSyncVideoTranscoderFunction"></a> [lambda\_dbSyncVideoTranscoderFunction](#module\_lambda\_dbSyncVideoTranscoderFunction) | terraform-aws-modules/lambda/aws | n/a |
| <a name="module_lambda_s3VideoTriggerForTranscoding"></a> [lambda\_s3VideoTriggerForTranscoding](#module\_lambda\_s3VideoTriggerForTranscoding) | terraform-aws-modules/lambda/aws | n/a |
| <a name="module_lambda_sendPollNotification"></a> [lambda\_sendPollNotification](#module\_lambda\_sendPollNotification) | terraform-aws-modules/lambda/aws | n/a |
| <a name="module_main_bucket"></a> [main\_bucket](#module\_main\_bucket) | terraform-aws-modules/s3-bucket/aws | n/a |
| <a name="module_mobile-app-api"></a> [mobile-app-api](#module\_mobile-app-api) | ../../modules/tf-aws-codedeploy-codepipeline | n/a |
| <a name="module_opensearch"></a> [opensearch](#module\_opensearch) | ../../modules/tf-aws-opensearch | n/a |
| <a name="module_s3_website"></a> [s3\_website](#module\_s3\_website) | terraform-aws-modules/s3-bucket/aws | n/a |
| <a name="module_send-poll-notification"></a> [send-poll-notification](#module\_send-poll-notification) | terraform-aws-modules/step-functions/aws | n/a |
| <a name="module_transcoded_bucket"></a> [transcoded\_bucket](#module\_transcoded\_bucket) | terraform-aws-modules/s3-bucket/aws | n/a |
| <a name="module_video_thumbnail_bucket"></a> [video\_thumbnail\_bucket](#module\_video\_thumbnail\_bucket) | terraform-aws-modules/s3-bucket/aws | n/a |
| <a name="module_vpc"></a> [vpc](#module\_vpc) | terraform-aws-modules/vpc/aws | ~> 3.0 |
| <a name="module_vpc_endpoints"></a> [vpc\_endpoints](#module\_vpc\_endpoints) | terraform-aws-modules/vpc/aws//modules/vpc-endpoints | n/a |

## Resources

| Name | Type |
|------|------|
| [aws_db_subnet_group.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/db_subnet_group) | resource |
| [aws_elastictranscoder_pipeline.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/elastictranscoder_pipeline) | resource |
| [aws_iam_group.all-developers](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_group) | resource |
| [aws_iam_group.app-developers](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_group) | resource |
| [aws_iam_group.backend-developers](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_group) | resource |
| [aws_iam_group.devops](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_group) | resource |
| [aws_iam_group.opensearch-developers](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_group) | resource |
| [aws_iam_group_membership.all-developers](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_group_membership) | resource |
| [aws_iam_group_membership.app-developers](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_group_membership) | resource |
| [aws_iam_group_membership.backend-developers](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_group_membership) | resource |
| [aws_iam_group_membership.devops](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_group_membership) | resource |
| [aws_iam_group_membership.opensearch-developers](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_group_membership) | resource |
| [aws_iam_group_policy_attachment.all-developers-policy-attach](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_group_policy_attachment) | resource |
| [aws_iam_group_policy_attachment.app-developers-policy-attach-custom](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_group_policy_attachment) | resource |
| [aws_iam_group_policy_attachment.app-developers-policy-attach-full](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_group_policy_attachment) | resource |
| [aws_iam_group_policy_attachment.app-developers-policy-attach-read](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_group_policy_attachment) | resource |
| [aws_iam_group_policy_attachment.backend-developers-policy-attach-custom](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_group_policy_attachment) | resource |
| [aws_iam_group_policy_attachment.backend-developers-policy-attach-full](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_group_policy_attachment) | resource |
| [aws_iam_group_policy_attachment.backend-developers-policy-attach-read](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_group_policy_attachment) | resource |
| [aws_iam_group_policy_attachment.devops-policy-attach-full](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_group_policy_attachment) | resource |
| [aws_iam_group_policy_attachment.opensearch-developers-policy-attach-custom](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_group_policy_attachment) | resource |
| [aws_iam_group_policy_attachment.opensearch-developers-policy-attach-read](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_group_policy_attachment) | resource |
| [aws_iam_role.transcoder](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role) | resource |
| [aws_iam_role_policy_attachment.cloudwatch_ec2_angular](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |
| [aws_iam_role_policy_attachment.cloudwatch_ec2_node](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |
| [aws_iam_role_policy_attachment.elastictranscoder_videos](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |
| [aws_iam_role_policy_attachment.parameterstore_ec2_angular](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |
| [aws_iam_role_policy_attachment.parameterstore_ec2_node](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |
| [aws_iam_role_policy_attachment.s3_ec2_angular](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |
| [aws_iam_role_policy_attachment.s3_ec2_node](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |
| [aws_iam_role_policy_attachment.stepfunction_ec2_node](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |
| [aws_route53_delegation_set.main](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route53_delegation_set) | resource |
| [aws_route53_record.api](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route53_record) | resource |
| [aws_route53_record.console](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route53_record) | resource |
| [aws_route53_record.website](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route53_record) | resource |
| [aws_route53_record.www_website](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route53_record) | resource |
| [aws_route53_zone.wethink](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route53_zone) | resource |
| [aws_s3_bucket_notification.lambda_s3VideoTriggerForTranscoding](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_notification) | resource |
| [aws_s3_bucket_policy.website_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_policy) | resource |
| [aws_security_group.alb-angular](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group) | resource |
| [aws_security_group.alb-node](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group) | resource |
| [aws_security_group.angular](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group) | resource |
| [aws_security_group.lambda_dbSyncVideoTranscoderFunction](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group) | resource |
| [aws_security_group.lambda_s3VideoTriggerForTranscoding](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group) | resource |
| [aws_security_group.lambda_sendPollNotification](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group) | resource |
| [aws_security_group.node](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group) | resource |
| [aws_security_group.rds](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group) | resource |
| [aws_ssm_parameter.admin-panel-api-aws-region](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.admin-panel-api-document_bucket](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.admin-panel-api-host](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.admin-panel-api-main_bucket](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.admin-panel-api-port](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.elastictranscoder_pipeline_id](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.lambda-db-user](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.mobile-app-api-aws-region](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.mobile-app-api-document_bucket](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.mobile-app-api-host](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.mobile-app-api-images_bucket](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.mobile-app-api-main_bucket](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.mobile-app-api-poll-step-function](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.mobile-app-api-port](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.mobile-app-api-transcoded_bucket](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.mobile-app-api-transcoded_region](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_cloudfront_cache_policy.cache_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/cloudfront_cache_policy) | data source |
| [aws_iam_policy_document.website_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document) | data source |
| [aws_region.current](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/region) | data source |
| [aws_route53_zone.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/route53_zone) | data source |
| [aws_ssm_parameter.db-user-password](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/ssm_parameter) | data source |
| [aws_ssm_parameter.lambda-firebase-key](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/ssm_parameter) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_allowed_account_ids"></a> [allowed\_account\_ids](#input\_allowed\_account\_ids) | List of allowed AWS account ids where resources can be created. | `list(string)` | <pre>[<br>  "074783170632"<br>]</pre> | no |
| <a name="input_codestar_connection_arn"></a> [codestar\_connection\_arn](#input\_codestar\_connection\_arn) | Codestar connection arn to the bitbucker WeThink Repos | `string` | `"arn:aws:codestar-connections:us-east-1:074783170632:connection/87803ba4-5a43-4f38-a111-b37c4098ee49"` | no |
| <a name="input_domain"></a> [domain](#input\_domain) | The APP root main domain | `string` | `"getwethink.com"` | no |
| <a name="input_env"></a> [env](#input\_env) | The Environment for which the resources are created. | `string` | `"prd"` | no |
| <a name="input_project"></a> [project](#input\_project) | The Project for which the resources are created. | `string` | `"wethink"` | no |
| <a name="input_region"></a> [region](#input\_region) | The AWS region to create resources in. | `string` | `"us-east-1"` | no |
| <a name="input_tags"></a> [tags](#input\_tags) | Map of tags. | `map(string)` | `{}` | no |

## Outputs

No outputs.
<!-- END_TF_DOCS -->