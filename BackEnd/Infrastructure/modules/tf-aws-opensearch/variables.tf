variable "advanced_options" {
  description = "Map of key-value string pairs to specify advanced configuration options. Note that the values for these configuration options must be strings (wrapped in quotes) or they may be wrong and cause a perpetual diff, causing Terraform to want to recreate your Opensearch domain on every apply."
  type        = map(string)
  default     = {}
}

variable "advanced_security_options_enabled" {
  description = "AWS OpenSearch Dashboards enhanced security plugin enabling (forces new resource)"
  type        = bool
  default     = false
}

variable "advanced_security_options_internal_user_database_enabled" {
  description = "Whether to enable or not internal Dashboards user database for ELK OpenSearch security plugin"
  type        = bool
  default     = false
}

variable "advanced_security_options_master_user_arn" {
  description = "ARN of IAM user who is to be mapped to be Dashboards master user (applicable if advanced_security_options_internal_user_database_enabled set to false)"
  type        = string
  default     = ""
}

variable "advanced_security_options_master_user_name" {
  description = "Master user username (applicable if advanced_security_options_internal_user_database_enabled set to true)"
  type        = string
  default     = ""
}

variable "advanced_security_options_master_user_password" {
  description = "Master user password (applicable if advanced_security_options_internal_user_database_enabled set to true)"
  type        = string
  default     = ""
}

variable "allowed_cidr_blocks_users" {
  description = "List of CIDR blocks of the USERS to be allowed to connect to the cluster, only for cluster outside of VPC"
  type        = list(string)
  default     = []
}

variable "allowed_cidr_blocks_instances" {
  description = "List of CIDR blocks of the Instances ( NAT GW) to be allowed to connect to the cluster, only for cluster outside of VPC"
  type        = list(string)
  default     = []
}

variable "availability_zone_count" {
  type        = number
  default     = 2
  description = "Number of Availability Zones for the domain to use."

  validation {
    condition     = contains([2, 3], var.availability_zone_count)
    error_message = "The availibility zone count must be 2 or 3."
  }
}

variable "cognito_authentication_enabled" {
  description = "Whether to enable Amazon Cognito authentication with Dashboards"
  type        = bool
  default     = false
}

variable "cognito_iam_role_arn" {
  description = "ARN of the IAM role that has the AmazonESCognitoAccess policy attached"
  type        = string
  default     = ""
}

variable "cognito_identity_pool_id" {
  description = "The ID of the Cognito Identity Pool to use"
  type        = string
  default     = ""
}

variable "cognito_user_pool_id" {
  description = "The ID of the Cognito User Pool to use"
  type        = string
  default     = ""
}

variable "create_iam_service_linked_role" {
  description = "Whether to create IAM service linked role for AWS OpenSearch service. Can be only one per AWS account."
  type        = bool
  default     = true
}

variable "custom_endpoint" {
  description = "Fully qualified domain for custom endpoint."
  type        = string
  default     = ""
}

variable "custom_endpoint_certificate_arn" {
  description = "ACM certificate ARN for custom endpoint."
  type        = string
  default     = ""
}

variable "custom_endpoint_enabled" {
  description = "Whether to enable custom endpoint for the Opensearch domain."
  type        = bool
  default     = true
}

variable "dedicated_master_threshold" {
  description = "The number of instances above which dedicated master nodes will be used. Default: 10"
  type        = number
  default     = 10
}

variable "dedicated_master_type" {
  description = "Instance type to be used for dedicated masters (default same as instance_type)"
  type        = string
  default     = "false"
}

variable "dns_zone_id" {
  description = "Route53 DNS Zone ID to add hostname records for Opensearch domain and Dashboards"
  type        = string
  default     = ""
}

variable "domain_hostname_enabled" {
  description = "Explicit flag to enable creating a DNS hostname for ES. If `true`, then `var.dns_zone_id` is required."
  type        = bool
  default     = false
}

variable "ebs_iops" {
  description = "The baseline input/output (I/O) performance of EBS volumes attached to data nodes. Applicable only for the Provisioned IOPS EBS volume type"
  type        = number
  default     = 0
}

variable "ebs_volume_size" {
  description = "Optionally use EBS volumes for data storage by specifying volume size in GB (default 0)"
  type        = number
  default     = 0
}

variable "ebs_volume_type" {
  description = "Storage type of EBS volumes, if used (default gp2)"
  type        = string
  default     = "gp2"
}

variable "opensearch_subdomain_name" {
  description = "The name of the subdomain for Opensearch in the DNS zone (_e.g._ `opensearch`, `ui`, `ui-es`, `search-ui`)"
  type        = string
  default     = "es"
}

variable "encrypt_at_rest" {
  description = "Enable encrption at rest (only specific instance family types support it: m4, c4, r4, i2, i3 default: false)"
  type        = bool
  default     = true
}

variable "enforce_https" {
  description = "Whether or not to require HTTPS."
  type        = bool
  default     = true
}

variable "env" {
  description = "Environment"
  type        = string
  default     = "dev"
}

variable "os_version" {
  description = "Version of OpenSearch to deploy (default 1.3)"
  type        = string
  default     = "OpenSearch_1.3"
}

variable "iam_actions_instance" {
  description = "List of actions to allow for EC2 instances, for all indexes, _e.g._ `es:ESHttpGet`, `es:ESHttpPut`, `es:ESHttpPost`, only for when outside of VPC"
  type        = list(string)
  default     = ["es:ESHttp*"]
}

variable "iam_actions_user_read" {
  description = "List of read actions to allow for the IAM Users in a given index, _e.g._ `es:ESHttpGet`, `es:ESHttpPut`, `es:ESHttpPost`, only for when outside of VPC"
  type        = list(string)
  default     = ["es:ESHttp*"]
}

variable "iam_actions_user_write" {
  description = "List of read/write actions to allow for the IAM Users in a given index, _e.g._ `es:ESHttpGet`, `es:ESHttpPut`, `es:ESHttpPost`, only for when outside of VPC"
  type        = list(string)
  default     = ["es:ESHttp*"]
}

variable "ingress_port" {
  description = "Ingress Port allowed on Security Group to access OpenSearch cluster . (e.g. `443`)"
  type        = number
  default     = 443
}

variable "instance_count" {
  description = "Number of data nodes in the cluster (default 2)"
  type        = number
  default     = 2
}

variable "instance_type" {
  description = "Instance type for data nodes in the cluster (default t3.small.search)"
  type        = string
  default     = "t3.small.search"
}

variable "dashboards_hostname_enabled" {
  description = "Explicit flag to enable creating a DNS hostname for Dashboards. If `true`, then `var.dns_zone_id` is required."
  type        = bool
  default     = false
}

variable "dashboards_subdomain_name" {
  description = "The name of the subdomain for Dashboards in the DNS zone (_e.g._ `dashboards`, `ui`, `ui-es`, `search-ui`, `dashboards.search`)"
  type        = string
  default     = "dashboards"
}

variable "kms_key_id" {
  description = "KMS key used for OpenSearch"
  type        = string
  default     = ""
}

variable "log_publishing_application_enabled" {
  description = "Specifies whether log publishing option for ES_APPLICATION_LOGS is enabled or not"
  type        = bool
  default     = true
}

variable "log_publishing_audit_enabled" {
  description = "Specifies whether log publishing option for AUDIT_LOGS is enabled or not"
  type        = bool
  default     = false
}

variable "log_publishing_index_enabled" {
  description = "Specifies whether log publishing option for INDEX_SLOW_LOGS is enabled or not"
  type        = bool
  default     = true
}

variable "log_publishing_search_enabled" {
  description = "Specifies whether log publishing option for SEARCH_SLOW_LOGS is enabled or not"
  type        = bool
  default     = true
}

variable "name" {
  description = "Project Name"
  type        = string
  default     = "wethink"
}

variable "node_to_node_encryption_enabled" {
  description = "Whether to enable node-to-node encryption."
  type        = bool
  default     = true
}

variable "security_groups" {
  description = "List of security group IDs to be allowed to connect to the cluster"
  type        = list(string)
  default     = []
}

variable "snapshot_start_hour" {
  description = "Hour at which automated snapshots are taken, in UTC (default 0)"
  type        = number
  default     = 0
}

variable "subnet_ids" {
  description = "VPC Subnet IDs"
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "tags to apply to all resources"
  type        = map(string)
  default     = {}
}

variable "tls_security_policy" {
  description = "The name of the TLS security policy that needs to be applied to the HTTPS endpoint. Example values: Policy-Min-TLS-1-0-2019-07 and Policy-Min-TLS-1-2-2019-07. Terraform will only perform drift detection if a configuration value is provided."
  type        = string
  default     = "Policy-Min-TLS-1-0-2019-07"
}

variable "vpc_enabled" {
  description = "Set to false if ES should be deployed outside of VPC."
  type        = bool
  default     = true
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
  default     = null
}

variable "warm_count" {
  description = "Number of UltraWarm nodes"
  type        = number
  default     = 2
}

variable "warm_enabled" {
  description = "Whether AWS UltraWarm is enabled"
  type        = bool
  default     = false
}

variable "warm_type" {
  description = "Type of UltraWarm nodes"
  type        = string
  default     = "ultrawarm1.medium.search"
}

variable "zone_awareness" {
  description = "Enable zone awareness for OpenSearch cluster (default false)"
  type        = bool
  default     = true
}

variable "zone_awareness_count" {
  description = "Number of availability zones used for data nodes (default 2)"
  type        = number
  default     = 2
}

variable "create" {
  description = "Determines whether to create this module resources or not"
  type        = bool
  default     = true
}
