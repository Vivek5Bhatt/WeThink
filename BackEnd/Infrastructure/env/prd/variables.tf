variable "allowed_account_ids" {
  description = "List of allowed AWS account ids where resources can be created."
  type        = list(string)
  default     = ["074783170632"]
}

variable "codestar_connection_arn" {
  description = "Codestar connection arn to the bitbucker WeThink Repos"
  type        = string
  default     = "arn:aws:codestar-connections:us-east-1:074783170632:connection/87803ba4-5a43-4f38-a111-b37c4098ee49"
}

variable "domain" {
  description = "The APP root main domain"
  type        = string
  default     = "getwethink.com"
}

variable "env" {
  description = "The Environment for which the resources are created."
  type        = string
  default     = "prd"
}

variable "project" {
  description = "The Project for which the resources are created."
  type        = string
  default     = "wethink"
}

variable "region" {
  description = "The AWS region to create resources in."
  type        = string
  default     = "us-east-1"
}

variable "tags" {
  description = "Map of tags."
  type        = map(string)
  default     = {}
}
