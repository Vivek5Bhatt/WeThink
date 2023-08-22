output "arn" {
  description = "Amazon Resource Name (ARN) of the domain"
  value       = try(aws_opensearch_domain.default.*.arn, "")
}

output "domain_id" {
  description = "Unique identifier for the domain"
  value       = try(aws_opensearch_domain.default.*.domain_id, "")
}

output "domain_name" {
  description = "The name of the OpenSearch domain"
  value       = try(aws_opensearch_domain.default.*.domain_name, "")
}

output "endpoint" {
  description = "Domain-specific endpoint used to submit index, search, and data upload requests"
  value       = try(aws_opensearch_domain.default.*.endpoint, "")
}

output "dashboards_endpoint" {
  description = "Domain-specific endpoint for Dashboards without https scheme"
  value       = try(aws_opensearch_domain.default.*.dashboards_endpoint, "")
}

