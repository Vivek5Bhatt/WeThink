resource "aws_security_group" "default" {
  count  = var.create && var.vpc_enabled ? 1 : 0
  vpc_id = var.vpc_id
  name   = "${local.domain_name}-os"

  description = "Allow traffic to OpenSearch from Security Groups and CIDRs. Allow all outbound traffic"

  tags = merge(
    {
      "Name" = "${local.domain_name}-os"
    },
    var.tags,
  )

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_security_group_rule" "ingress_security_groups" {
  count                    = var.create && var.vpc_enabled ? length(var.security_groups) : 0
  description              = "Allow inbound traffic from Security Groups"
  type                     = "ingress"
  from_port                = var.ingress_port
  to_port                  = var.ingress_port
  protocol                 = "tcp"
  source_security_group_id = var.security_groups[count.index]
  security_group_id        = join("", aws_security_group.default.*.id)
}

resource "aws_security_group_rule" "egress" {
  count             = var.create && var.vpc_enabled ? 1 : 0
  description       = "Allow all egress traffic"
  type              = "egress"
  from_port         = 0
  to_port           = 65535
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = join("", aws_security_group.default.*.id)
}

data "aws_iam_policy_document" "management_access" {
  count = var.create ? 1 : 0

  # Only for VPC Domains
  dynamic "statement" {
    for_each = var.vpc_enabled ? [true] : []
    content {
      effect  = "Allow"
      actions = ["es:ESHttp*"]
      resources = [
        join("", aws_opensearch_domain.default.*.arn),
        "${join("", aws_opensearch_domain.default.*.arn)}/*"
      ]
      principals {
        type        = "AWS"
        identifiers = ["*"]
      }
    }
  }
  dynamic "statement" {
    for_each = length(var.allowed_cidr_blocks_instances) > 0 && !var.vpc_enabled ? [true] : []
    content {
      effect  = "Allow"
      actions = distinct(compact(var.iam_actions_instance))
      resources = [
        join("", aws_opensearch_domain.default.*.arn),
        "${join("", aws_opensearch_domain.default.*.arn)}/*"
      ]
      principals {
        type        = "AWS"
        identifiers = ["*"]
      }

      condition {
        test     = "IpAddress"
        values   = var.allowed_cidr_blocks_instances
        variable = "aws:SourceIp"
      }
    }
  }

  # This statement is for non VPC ES to allow anonymous access from whitelisted IP ranges without requests signing
  # https://docs.aws.amazon.com/elasticsearch-service/latest/developerguide/es-ac.html#es-ac-types-ip
  # https://aws.amazon.com/premiumsupport/knowledge-center/anonymous-not-authorized-elasticsearch/
  dynamic "statement" {
    for_each = length(var.allowed_cidr_blocks_users) > 0 && !var.vpc_enabled ? [true] : []
    content {
      effect  = "Allow"
      actions = distinct(compact(var.iam_actions_user_read))
      resources = [
        join("", aws_opensearch_domain.default.*.arn),
        "${join("", aws_opensearch_domain.default.*.arn)}/*",
      ]
      principals {
        type        = "AWS"
        identifiers = ["*"]
      }
      condition {
        test     = "IpAddress"
        values   = var.allowed_cidr_blocks_users
        variable = "aws:SourceIp"
      }
    }
  }
  dynamic "statement" {
    for_each = length(var.allowed_cidr_blocks_users) > 0 && !var.vpc_enabled ? [true] : []
    content {
      effect  = "Allow"
      actions = distinct(compact(var.iam_actions_user_write))
      resources = [
        "${join("", aws_opensearch_domain.default.*.arn)}/pre-dev*"
      ]
      principals {
        type        = "AWS"
        identifiers = ["*"]
      }
      condition {
        test     = "IpAddress"
        values   = var.allowed_cidr_blocks_users
        variable = "aws:SourceIp"
      }
    }
  }
}

resource "aws_iam_service_linked_role" "es" {
  count            = var.create && var.create_iam_service_linked_role ? 1 : 0
  aws_service_name = "es.amazonaws.com"
  description      = "AWSServiceRoleForAmazonOpenSearchService Service-Linked Role"
}

resource "aws_opensearch_domain" "default" {
  count = var.create ? 1 : 0

  depends_on = [aws_iam_service_linked_role.es]

  domain_name    = local.domain_name
  engine_version = var.os_version

  encrypt_at_rest {
    enabled    = var.encrypt_at_rest
    kms_key_id = var.kms_key_id
  }

  domain_endpoint_options {
    enforce_https                   = var.enforce_https
    tls_security_policy             = var.tls_security_policy
    custom_endpoint_enabled         = var.custom_endpoint_enabled
    custom_endpoint                 = var.custom_endpoint_enabled ? var.opensearch_subdomain_name : null
    custom_endpoint_certificate_arn = var.custom_endpoint_enabled ? var.custom_endpoint_certificate_arn : null
  }

  cluster_config {
    instance_type            = var.instance_type
    instance_count           = var.instance_count
    dedicated_master_enabled = var.instance_count >= var.dedicated_master_threshold ? true : false
    dedicated_master_count   = var.instance_count >= var.dedicated_master_threshold ? 3 : 0
    dedicated_master_type    = var.instance_count >= var.dedicated_master_threshold ? var.dedicated_master_type != "false" ? var.dedicated_master_type : var.instance_type : ""
    zone_awareness_enabled   = var.zone_awareness
    warm_enabled             = var.warm_enabled
    warm_count               = var.warm_enabled ? var.warm_count : null
    warm_type                = var.warm_enabled ? var.warm_type : null

    dynamic "zone_awareness_config" {
      for_each = var.availability_zone_count > 1 && var.zone_awareness ? [true] : []
      content {
        availability_zone_count = var.availability_zone_count
      }
    }
  }

  advanced_options = var.advanced_options

  advanced_security_options {
    enabled                        = var.advanced_security_options_enabled
    internal_user_database_enabled = var.advanced_security_options_internal_user_database_enabled
    master_user_options {
      master_user_arn      = var.advanced_security_options_master_user_arn
      master_user_name     = var.advanced_security_options_master_user_name
      master_user_password = var.advanced_security_options_master_user_password
    }
  }

  node_to_node_encryption {
    enabled = var.node_to_node_encryption_enabled
  }

  dynamic "vpc_options" {
    for_each = var.vpc_enabled ? [true] : []

    content {
      security_group_ids = [join("", aws_security_group.default.*.id)]
      subnet_ids         = var.subnet_ids
    }
  }

  dynamic "cognito_options" {
    for_each = var.cognito_authentication_enabled ? [true] : []
    content {
      enabled          = true
      user_pool_id     = var.cognito_user_pool_id
      identity_pool_id = var.cognito_identity_pool_id
      role_arn         = var.cognito_iam_role_arn
    }
  }

  ebs_options {
    ebs_enabled = var.ebs_volume_size > 0 ? true : false
    volume_size = var.ebs_volume_size
    volume_type = var.ebs_volume_type
    iops        = var.ebs_iops
  }

  snapshot_options {
    automated_snapshot_start_hour = var.snapshot_start_hour
  }

  log_publishing_options {
    enabled                  = var.log_publishing_index_enabled
    log_type                 = "INDEX_SLOW_LOGS"
    cloudwatch_log_group_arn = join("", aws_cloudwatch_log_group.this.*.arn)
  }

  log_publishing_options {
    enabled                  = var.log_publishing_search_enabled
    log_type                 = "SEARCH_SLOW_LOGS"
    cloudwatch_log_group_arn = join("", aws_cloudwatch_log_group.this.*.arn)
  }

  log_publishing_options {
    enabled                  = var.log_publishing_audit_enabled
    log_type                 = "AUDIT_LOGS"
    cloudwatch_log_group_arn = join("", aws_cloudwatch_log_group.this.*.arn)
  }

  log_publishing_options {
    enabled                  = var.log_publishing_application_enabled
    log_type                 = "ES_APPLICATION_LOGS"
    cloudwatch_log_group_arn = join("", aws_cloudwatch_log_group.this.*.arn)
  }

  tags = merge(
    {
      "Domain" = local.domain_name
    },
    var.tags,
  )
}

resource "aws_opensearch_domain_policy" "management_access" {
  count           = var.create ? 1 : 0
  domain_name     = local.domain_name
  access_policies = join("", data.aws_iam_policy_document.management_access.*.json)
}

resource "aws_route53_record" "domain_hostname" {
  count = var.create && var.domain_hostname_enabled ? 1 : 0

  name    = var.opensearch_subdomain_name
  type    = "CNAME"
  ttl     = 60
  zone_id = var.dns_zone_id
  records = [join("", aws_opensearch_domain.default.*.endpoint)]
}

resource "aws_route53_record" "dashboards_hostname" {
  count = var.create && var.dashboards_hostname_enabled ? 1 : 0

  name    = var.dashboards_subdomain_name
  type    = "CNAME"
  ttl     = 60
  zone_id = var.dns_zone_id
  # Note: dashboards_endpoint is not just a domain name, it includes a path component,
  # and as such is not suitable for a DNS record. The plain endpoint is the
  # hostname portion and should be used for DNS.
  records = [join("", aws_opensearch_domain.default.*.endpoint)]
}

# Cloudwatch Logs
resource "aws_cloudwatch_log_group" "this" {
  count             = var.create && (var.log_publishing_index_enabled || var.log_publishing_search_enabled || var.log_publishing_audit_enabled || var.log_publishing_application_enabled) ? 1 : 0
  name              = "${local.domain_name}-OpenSearch"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_resource_policy" "this" {
  count = var.create && (var.log_publishing_index_enabled || var.log_publishing_search_enabled || var.log_publishing_audit_enabled || var.log_publishing_application_enabled) ? 1 : 0

  policy_name = "${local.domain_name}-OpenSearch"

  policy_document = <<CONFIG
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "es.amazonaws.com"
      },
      "Action": [
        "logs:PutLogEvents",
        "logs:PutLogEventsBatch",
        "logs:CreateLogStream"
      ],
      "Resource": "arn:aws:logs:*:*:log-group:${local.domain_name}-OpenSearch:*"
    }
  ]
}
CONFIG
}

# Parameter Store OpenSearch Endpoints
resource "aws_ssm_parameter" "mobile-app-api-os-url" {
  count       = var.create && var.domain_hostname_enabled ? 1 : 0
  name        = "/${var.name}-${var.env}/mobile-app-api/OS_CONNECTION_STRING"
  description = "OpenSearch Https Endpoint"
  type        = "String"
  value       = "https://${aws_route53_record.domain_hostname[0].fqdn}"
}

resource "aws_ssm_parameter" "admin-panel-api-os-url" {
  count       = var.create && var.domain_hostname_enabled ? 1 : 0
  name        = "/${var.name}-${var.env}/admin-panel-api/OS_CONNECTION_STRING"
  description = "OpenSearch Https Endpoint"
  type        = "String"
  value       = "https://${aws_route53_record.domain_hostname[0].fqdn}"
}
