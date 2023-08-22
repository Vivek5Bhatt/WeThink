# tf-aws-elasticsearch

IMPORTANT: This is an updated version of the Terraform module found online, the Documentation below has been kept intact ( apart form updates using terraform-docs).

Terraform module for deploying and managing [Amazon Elasticsearch Service](https://aws.amazon.com/documentation/elasticsearch-service/).

This module has two options for creating an Elasticsearch domain:
  1) Create an Elasticsearch domain with a public endpoint. Access policy is then based on the intersection of the following two criteria
     * source IP address
     * client IAM role

     See [this Stack Overflow post](http://stackoverflow.com/questions/32978026/proper-access-policy-for-amazon-elastic-search-cluster) for further discussion of access policies for Elasticsearch.
  2) Create an Elasticsearch domain and join it to a VPC. Access policy is then based on the intersection of the following two criteria:
     * security groups applied to Elasticsearch domain
     * client IAM role

If `vpc_options` option is set, Elasticsearch domain is created within a VPC. If not, Elasticsearch domain is created with a public endpoint

NOTE: **You can either launch your domain within a VPC or use a public endpoint, but you can't do both.** Considering this, adding or removing `vpc_options` will force **DESTRUCTION** of the old Elasticsearch domain and **CREATION** of a new one. More INFO - [VPC support](http://docs.aws.amazon.com/elasticsearch-service/latest/developerguide/es-vpc.html)

Several options affect the resilience and scalability of your Elasticsearch domain.  For a production deployment:

- set `instance_count` to an even number (default: `6`) greater than or equal to the `dedicated_master_threshold` (default: `10`)
- choose an `instance_type` that is not in the T2 family
- set `es_zone_awareness` to `true`.

This will result in a cluster with three dedicated master nodes, balanced across two availability zones.

For a production deployment it may also make sense to use EBS volumes rather that instance storage; to do so, set `ebs_volume_size` greater than 0 and optionally specify a value for `ebs_volume_type` (right now the only supported values are `gp2` and `magnetic`).


## Terraform versions

Terraform 0.12. Pin module version to `~> v1.0`. Submit pull-requests to `master` branch.

Terraform 0.11. Pin module version to `~> v0.0`. Submit pull-requests to `terraform011` branch.

# Usage

Create Elasticsearch domain with public endpoint

```hcl
module "es" {
  source  = "git::https://github.com/terraform-community-modules/tf_aws_elasticsearch.git?ref=v1.1.0"

  domain_name                    = "my-elasticsearch-domain"
  management_public_ip_addresses = ["34.203.XXX.YYY"]
  instance_count                 = 16
  instance_type                  = "m4.2xlarge.elasticsearch"
  dedicated_master_type          = "m4.large.elasticsearch"
  es_zone_awareness              = true
  ebs_volume_size                = 100
}
```

Create Elasticsearch domain within a VPC and CloudWatch logs

```hcl
module "es" {
  source  = "git::https://github.com/terraform-community-modules/tf_aws_elasticsearch.git?ref=v1.1.0"

  domain_name                    = "my-elasticsearch-domain"
  vpc_options                    = {
    security_group_ids = ["sg-XXXXXXXX"]
    subnet_ids         = ["subnet-YYYYYYYY"]
  }
  instance_count                 = 1
  instance_type                  = "t2.medium.elasticsearch"
  dedicated_master_type          = "t2.medium.elasticsearch"
  es_zone_awareness              = false
  ebs_volume_size                = 35

  advanced_options = {
    "rest.action.multi.allow_explicit_index" = "true"   # double quotes are required here
  }

  log_publishing_options = [
    {
      cloudwatch_log_group_arn = "arn:aws:logs:eu-central-1:604506250243:log-group:es:*"
      log_type                 = "INDEX_SLOW_LOGS"
      enabled                  = true
    },
    {
      cloudwatch_log_group_arn = "arn:aws:logs:eu-central-1:604506250243:log-group:es:*"
      log_type                 = "SEARCH_SLOW_LOGS"
      enabled                  = true
    },
    {
      cloudwatch_log_group_arn = "arn:aws:logs:eu-central-1:604506250243:log-group:es:*"
      log_type                 = "ES_APPLICATION_LOGS"
      enabled                  = true
    }
  ]
}
```

Create small (4-node) Elasticsearch domain in a VPC with dedicated master nodes

```hcl
module "es" {
  source  = "git::https://github.com/terraform-community-modules/tf_aws_elasticsearch.git?ref=v1.1.0"

  domain_name                    = "my-elasticsearch-domain"
  vpc_options                    = {
    security_group_ids = ["sg-XXXXXXXX"]
    subnet_ids         = ["subnet-YYYYYYYY"]
  }
  instance_count                 = 4
  instance_type                  = "m4.2xlarge.elasticsearch"
  dedicated_master_threshold     = 4
  dedicated_master_type          = "m4.large.elasticsearch"
  es_zone_awareness              = true
  ebs_volume_size                = 100
}
```

<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|:----:|:-----:|:-----:|
| advanced\_options | Map of key-value string pairs to specify advanced configuration options. Note that the values for these configuration options must be strings (wrapped in quotes) or they may be wrong and cause a perpetual diff, causing Terraform to want to recreate your Elasticsearch domain on every apply. | map(string) | `{}` | no |
| create\_iam\_service\_linked\_role | Whether to create IAM service linked role for AWS ElasticSearch service. Can be only one per AWS account. | bool | `"true"` | no |
| dedicated\_master\_threshold | The number of instances above which dedicated master nodes will be used. Default: 10 | number | `"10"` | no |
| dedicated\_master\_type | ES instance type to be used for dedicated masters (default same as instance_type) | string | `"false"` | no |
| domain\_name | Domain name for Elasticsearch cluster | string | `"es-domain"` | no |
| domain\_prefix | String to be prefixed to search domain. Default: tf- | string | `"tf-"` | no |
| ebs\_volume\_size | Optionally use EBS volumes for data storage by specifying volume size in GB (default 0) | number | `"0"` | no |
| ebs\_volume\_type | Storage type of EBS volumes, if used (default gp2) | string | `"gp2"` | no |
| encrypt\_at\_rest | Enable encrption at rest (only specific instance family types support it: m4, c4, r4, i2, i3 default: false) | bool | `"false"` | no |
| enforce\_https | Whether or not to require HTTPS. | bool | `"false"` | no |
| es\_version | Version of Elasticsearch to deploy (default 5.1) | string | `"5.1"` | no |
| es\_zone\_awareness | Enable zone awareness for Elasticsearch cluster (default false) | bool | `"false"` | no |
| es\_zone\_awareness\_count | Number of availability zones used for data nodes (default 2) | number | `"2"` | no |
| instance\_count | Number of data nodes in the cluster (default 6) | number | `"6"` | no |
| instance\_type | ES instance type for data nodes in the cluster (default t2.small.elasticsearch) | string | `"t2.small.elasticsearch"` | no |
| kms\_key\_id | KMS key used for elasticsearch | string | `""` | no |
| log\_publishing\_options | List of maps of options for publishing slow logs to CloudWatch Logs. | list(map(string)) | `[]` | no |
| management\_iam\_roles | List of IAM role ARNs from which to permit management traffic (default ['*']).  Note that a client must match both the IP address and the IAM role patterns in order to be permitted access. | list(string) | `[ "*" ]` | no |
| management\_public\_ip\_addresses | List of IP addresses from which to permit management traffic (default []).  Note that a client must match both the IP address and the IAM role patterns in order to be permitted access. | list(string) | `[]` | no |
| node\_to\_node\_encryption\_enabled | Whether to enable node-to-node encryption. | bool | `"false"` | no |
| snapshot\_start\_hour | Hour at which automated snapshots are taken, in UTC (default 0) | number | `"0"` | no |
| tags | tags to apply to all resources | map(string) | `{}` | no |
| tls\_security\_policy | The name of the TLS security policy that needs to be applied to the HTTPS endpoint. Example values: Policy-Min-TLS-1-0-2019-07 and Policy-Min-TLS-1-2-2019-07. Terraform will only perform drift detection if a configuration value is provided. | string | `"null"` | no |
| use\_prefix | Flag indicating whether or not to use the domain_prefix. Default: true | bool | `"true"` | no |
| vpc\_options | A map of supported vpc options | map(list(string)) | `{ "security_group_ids": [], "subnet_ids": [] }` | no |

## Outputs

| Name | Description |
|------|-------------|
| arn | Amazon Resource Name (ARN) of the domain |
| domain\_id | Unique identifier for the domain |
| domain\_name | The name of the Elasticsearch domain |
| endpoint | Domain-specific endpoint used to submit index, search, and data upload requests |
| kibana\_endpoint | Domain-specific endpoint for kibana without https scheme |

<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->

## Authors

Originally created by [Steve Huff](https://github.com/hakamadare), [Alexander Gramovich](https://github.com/ggramal) and [these awesome contributors](https://github.com/terraform-community-modules/tf_aws_elasticsearch/graphs/contributors).


## License

MIT licensed. See `LICENSE.md` for full details.

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
| [aws_cloudwatch_log_group.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_log_group) | resource |
| [aws_cloudwatch_log_resource_policy.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_log_resource_policy) | resource |
| [aws_iam_service_linked_role.es](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_service_linked_role) | resource |
| [aws_opensearch_domain.default](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/opensearch_domain) | resource |
| [aws_opensearch_domain_policy.management_access](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/opensearch_domain_policy) | resource |
| [aws_route53_record.dashboards_hostname](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route53_record) | resource |
| [aws_route53_record.domain_hostname](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route53_record) | resource |
| [aws_security_group.default](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group) | resource |
| [aws_security_group_rule.egress](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group_rule) | resource |
| [aws_security_group_rule.ingress_security_groups](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group_rule) | resource |
| [aws_ssm_parameter.admin-panel-api-os-url](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.mobile-app-api-os-url](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_iam_policy_document.management_access](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_advanced_options"></a> [advanced\_options](#input\_advanced\_options) | Map of key-value string pairs to specify advanced configuration options. Note that the values for these configuration options must be strings (wrapped in quotes) or they may be wrong and cause a perpetual diff, causing Terraform to want to recreate your Opensearch domain on every apply. | `map(string)` | `{}` | no |
| <a name="input_advanced_security_options_enabled"></a> [advanced\_security\_options\_enabled](#input\_advanced\_security\_options\_enabled) | AWS OpenSearch Dashboards enhanced security plugin enabling (forces new resource) | `bool` | `false` | no |
| <a name="input_advanced_security_options_internal_user_database_enabled"></a> [advanced\_security\_options\_internal\_user\_database\_enabled](#input\_advanced\_security\_options\_internal\_user\_database\_enabled) | Whether to enable or not internal Dashboards user database for ELK OpenSearch security plugin | `bool` | `false` | no |
| <a name="input_advanced_security_options_master_user_arn"></a> [advanced\_security\_options\_master\_user\_arn](#input\_advanced\_security\_options\_master\_user\_arn) | ARN of IAM user who is to be mapped to be Dashboards master user (applicable if advanced\_security\_options\_internal\_user\_database\_enabled set to false) | `string` | `""` | no |
| <a name="input_advanced_security_options_master_user_name"></a> [advanced\_security\_options\_master\_user\_name](#input\_advanced\_security\_options\_master\_user\_name) | Master user username (applicable if advanced\_security\_options\_internal\_user\_database\_enabled set to true) | `string` | `""` | no |
| <a name="input_advanced_security_options_master_user_password"></a> [advanced\_security\_options\_master\_user\_password](#input\_advanced\_security\_options\_master\_user\_password) | Master user password (applicable if advanced\_security\_options\_internal\_user\_database\_enabled set to true) | `string` | `""` | no |
| <a name="input_allowed_cidr_blocks_instances"></a> [allowed\_cidr\_blocks\_instances](#input\_allowed\_cidr\_blocks\_instances) | List of CIDR blocks of the Instances ( NAT GW) to be allowed to connect to the cluster, only for cluster outside of VPC | `list(string)` | `[]` | no |
| <a name="input_allowed_cidr_blocks_users"></a> [allowed\_cidr\_blocks\_users](#input\_allowed\_cidr\_blocks\_users) | List of CIDR blocks of the USERS to be allowed to connect to the cluster, only for cluster outside of VPC | `list(string)` | `[]` | no |
| <a name="input_availability_zone_count"></a> [availability\_zone\_count](#input\_availability\_zone\_count) | Number of Availability Zones for the domain to use. | `number` | `2` | no |
| <a name="input_cognito_authentication_enabled"></a> [cognito\_authentication\_enabled](#input\_cognito\_authentication\_enabled) | Whether to enable Amazon Cognito authentication with Dashboards | `bool` | `false` | no |
| <a name="input_cognito_iam_role_arn"></a> [cognito\_iam\_role\_arn](#input\_cognito\_iam\_role\_arn) | ARN of the IAM role that has the AmazonESCognitoAccess policy attached | `string` | `""` | no |
| <a name="input_cognito_identity_pool_id"></a> [cognito\_identity\_pool\_id](#input\_cognito\_identity\_pool\_id) | The ID of the Cognito Identity Pool to use | `string` | `""` | no |
| <a name="input_cognito_user_pool_id"></a> [cognito\_user\_pool\_id](#input\_cognito\_user\_pool\_id) | The ID of the Cognito User Pool to use | `string` | `""` | no |
| <a name="input_create"></a> [create](#input\_create) | Determines whether to create this module resources or not | `bool` | `true` | no |
| <a name="input_create_iam_service_linked_role"></a> [create\_iam\_service\_linked\_role](#input\_create\_iam\_service\_linked\_role) | Whether to create IAM service linked role for AWS OpenSearch service. Can be only one per AWS account. | `bool` | `true` | no |
| <a name="input_custom_endpoint"></a> [custom\_endpoint](#input\_custom\_endpoint) | Fully qualified domain for custom endpoint. | `string` | `""` | no |
| <a name="input_custom_endpoint_certificate_arn"></a> [custom\_endpoint\_certificate\_arn](#input\_custom\_endpoint\_certificate\_arn) | ACM certificate ARN for custom endpoint. | `string` | `""` | no |
| <a name="input_custom_endpoint_enabled"></a> [custom\_endpoint\_enabled](#input\_custom\_endpoint\_enabled) | Whether to enable custom endpoint for the Opensearch domain. | `bool` | `true` | no |
| <a name="input_dashboards_hostname_enabled"></a> [dashboards\_hostname\_enabled](#input\_dashboards\_hostname\_enabled) | Explicit flag to enable creating a DNS hostname for Dashboards. If `true`, then `var.dns_zone_id` is required. | `bool` | `false` | no |
| <a name="input_dashboards_subdomain_name"></a> [dashboards\_subdomain\_name](#input\_dashboards\_subdomain\_name) | The name of the subdomain for Dashboards in the DNS zone (\_e.g.\_ `dashboards`, `ui`, `ui-es`, `search-ui`, `dashboards.search`) | `string` | `"dashboards"` | no |
| <a name="input_dedicated_master_threshold"></a> [dedicated\_master\_threshold](#input\_dedicated\_master\_threshold) | The number of instances above which dedicated master nodes will be used. Default: 10 | `number` | `10` | no |
| <a name="input_dedicated_master_type"></a> [dedicated\_master\_type](#input\_dedicated\_master\_type) | Instance type to be used for dedicated masters (default same as instance\_type) | `string` | `"false"` | no |
| <a name="input_dns_zone_id"></a> [dns\_zone\_id](#input\_dns\_zone\_id) | Route53 DNS Zone ID to add hostname records for Opensearch domain and Dashboards | `string` | `""` | no |
| <a name="input_domain_hostname_enabled"></a> [domain\_hostname\_enabled](#input\_domain\_hostname\_enabled) | Explicit flag to enable creating a DNS hostname for ES. If `true`, then `var.dns_zone_id` is required. | `bool` | `false` | no |
| <a name="input_ebs_iops"></a> [ebs\_iops](#input\_ebs\_iops) | The baseline input/output (I/O) performance of EBS volumes attached to data nodes. Applicable only for the Provisioned IOPS EBS volume type | `number` | `0` | no |
| <a name="input_ebs_volume_size"></a> [ebs\_volume\_size](#input\_ebs\_volume\_size) | Optionally use EBS volumes for data storage by specifying volume size in GB (default 0) | `number` | `0` | no |
| <a name="input_ebs_volume_type"></a> [ebs\_volume\_type](#input\_ebs\_volume\_type) | Storage type of EBS volumes, if used (default gp2) | `string` | `"gp2"` | no |
| <a name="input_encrypt_at_rest"></a> [encrypt\_at\_rest](#input\_encrypt\_at\_rest) | Enable encrption at rest (only specific instance family types support it: m4, c4, r4, i2, i3 default: false) | `bool` | `true` | no |
| <a name="input_enforce_https"></a> [enforce\_https](#input\_enforce\_https) | Whether or not to require HTTPS. | `bool` | `true` | no |
| <a name="input_env"></a> [env](#input\_env) | Environment | `string` | `"dev"` | no |
| <a name="input_iam_actions_instance"></a> [iam\_actions\_instance](#input\_iam\_actions\_instance) | List of actions to allow for EC2 instances, for all indexes, _e.g._ `es:ESHttpGet`, `es:ESHttpPut`, `es:ESHttpPost`, only for when outside of VPC | `list(string)` | <pre>[<br>  "es:ESHttp*"<br>]</pre> | no |
| <a name="input_iam_actions_user_read"></a> [iam\_actions\_user\_read](#input\_iam\_actions\_user\_read) | List of read actions to allow for the IAM Users in a given index, _e.g._ `es:ESHttpGet`, `es:ESHttpPut`, `es:ESHttpPost`, only for when outside of VPC | `list(string)` | <pre>[<br>  "es:ESHttp*"<br>]</pre> | no |
| <a name="input_iam_actions_user_write"></a> [iam\_actions\_user\_write](#input\_iam\_actions\_user\_write) | List of read/write actions to allow for the IAM Users in a given index, _e.g._ `es:ESHttpGet`, `es:ESHttpPut`, `es:ESHttpPost`, only for when outside of VPC | `list(string)` | <pre>[<br>  "es:ESHttp*"<br>]</pre> | no |
| <a name="input_ingress_port"></a> [ingress\_port](#input\_ingress\_port) | Ingress Port allowed on Security Group to access OpenSearch cluster . (e.g. `443`) | `number` | `443` | no |
| <a name="input_instance_count"></a> [instance\_count](#input\_instance\_count) | Number of data nodes in the cluster (default 2) | `number` | `2` | no |
| <a name="input_instance_type"></a> [instance\_type](#input\_instance\_type) | Instance type for data nodes in the cluster (default t3.small.search) | `string` | `"t3.small.search"` | no |
| <a name="input_kms_key_id"></a> [kms\_key\_id](#input\_kms\_key\_id) | KMS key used for OpenSearch | `string` | `""` | no |
| <a name="input_log_publishing_application_enabled"></a> [log\_publishing\_application\_enabled](#input\_log\_publishing\_application\_enabled) | Specifies whether log publishing option for ES\_APPLICATION\_LOGS is enabled or not | `bool` | `true` | no |
| <a name="input_log_publishing_audit_enabled"></a> [log\_publishing\_audit\_enabled](#input\_log\_publishing\_audit\_enabled) | Specifies whether log publishing option for AUDIT\_LOGS is enabled or not | `bool` | `false` | no |
| <a name="input_log_publishing_index_enabled"></a> [log\_publishing\_index\_enabled](#input\_log\_publishing\_index\_enabled) | Specifies whether log publishing option for INDEX\_SLOW\_LOGS is enabled or not | `bool` | `true` | no |
| <a name="input_log_publishing_search_enabled"></a> [log\_publishing\_search\_enabled](#input\_log\_publishing\_search\_enabled) | Specifies whether log publishing option for SEARCH\_SLOW\_LOGS is enabled or not | `bool` | `true` | no |
| <a name="input_name"></a> [name](#input\_name) | Project Name | `string` | `"wethink"` | no |
| <a name="input_node_to_node_encryption_enabled"></a> [node\_to\_node\_encryption\_enabled](#input\_node\_to\_node\_encryption\_enabled) | Whether to enable node-to-node encryption. | `bool` | `true` | no |
| <a name="input_opensearch_subdomain_name"></a> [opensearch\_subdomain\_name](#input\_opensearch\_subdomain\_name) | The name of the subdomain for Opensearch in the DNS zone (\_e.g.\_ `opensearch`, `ui`, `ui-es`, `search-ui`) | `string` | `"es"` | no |
| <a name="input_os_version"></a> [os\_version](#input\_os\_version) | Version of OpenSearch to deploy (default 1.3) | `string` | `"OpenSearch_1.3"` | no |
| <a name="input_security_groups"></a> [security\_groups](#input\_security\_groups) | List of security group IDs to be allowed to connect to the cluster | `list(string)` | `[]` | no |
| <a name="input_snapshot_start_hour"></a> [snapshot\_start\_hour](#input\_snapshot\_start\_hour) | Hour at which automated snapshots are taken, in UTC (default 0) | `number` | `0` | no |
| <a name="input_subnet_ids"></a> [subnet\_ids](#input\_subnet\_ids) | VPC Subnet IDs | `list(string)` | `[]` | no |
| <a name="input_tags"></a> [tags](#input\_tags) | tags to apply to all resources | `map(string)` | `{}` | no |
| <a name="input_tls_security_policy"></a> [tls\_security\_policy](#input\_tls\_security\_policy) | The name of the TLS security policy that needs to be applied to the HTTPS endpoint. Example values: Policy-Min-TLS-1-0-2019-07 and Policy-Min-TLS-1-2-2019-07. Terraform will only perform drift detection if a configuration value is provided. | `string` | `"Policy-Min-TLS-1-0-2019-07"` | no |
| <a name="input_vpc_enabled"></a> [vpc\_enabled](#input\_vpc\_enabled) | Set to false if ES should be deployed outside of VPC. | `bool` | `true` | no |
| <a name="input_vpc_id"></a> [vpc\_id](#input\_vpc\_id) | VPC ID | `string` | `null` | no |
| <a name="input_warm_count"></a> [warm\_count](#input\_warm\_count) | Number of UltraWarm nodes | `number` | `2` | no |
| <a name="input_warm_enabled"></a> [warm\_enabled](#input\_warm\_enabled) | Whether AWS UltraWarm is enabled | `bool` | `false` | no |
| <a name="input_warm_type"></a> [warm\_type](#input\_warm\_type) | Type of UltraWarm nodes | `string` | `"ultrawarm1.medium.search"` | no |
| <a name="input_zone_awareness"></a> [zone\_awareness](#input\_zone\_awareness) | Enable zone awareness for OpenSearch cluster (default false) | `bool` | `true` | no |
| <a name="input_zone_awareness_count"></a> [zone\_awareness\_count](#input\_zone\_awareness\_count) | Number of availability zones used for data nodes (default 2) | `number` | `2` | no |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_arn"></a> [arn](#output\_arn) | Amazon Resource Name (ARN) of the domain |
| <a name="output_dashboards_endpoint"></a> [dashboards\_endpoint](#output\_dashboards\_endpoint) | Domain-specific endpoint for Dashboards without https scheme |
| <a name="output_domain_id"></a> [domain\_id](#output\_domain\_id) | Unique identifier for the domain |
| <a name="output_domain_name"></a> [domain\_name](#output\_domain\_name) | The name of the OpenSearch domain |
| <a name="output_endpoint"></a> [endpoint](#output\_endpoint) | Domain-specific endpoint used to submit index, search, and data upload requests |
<!-- END_TF_DOCS -->