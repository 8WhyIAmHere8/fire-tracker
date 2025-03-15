variable "subscription_id" {
  description = "Azure Subscription ID"
  type        = string
}

variable "resource_group_name" {
  description = "Resource Group Name"
  type        = string
}

variable "location" {
  description = "Azure Georgaphy"
  type        = string
}
variable "region" {
  description = "Azure Region"
  type        = string
}

variable "project_name" {
  description = "Project Name"
  type        = string
}

variable "sql_admin" {
  description = "SQL Admin Username"
  type        = string
}

variable "sql_password" {
  description = "SQL Admin Password"
  type        = string
  sensitive   = true
}


