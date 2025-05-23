terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">4.0.0"
    }
  }
}
provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}


#  Create Resource Group
resource "azurerm_resource_group" "warden_rg" {
  name     = var.resource_group_name
  location = var.region
}

#  Create Azure SQL Server
resource "azurerm_mssql_server" "warden_sql_server" {
  name                         = "${var.project_name}-sqlserver"
  resource_group_name          = azurerm_resource_group.warden_rg.name
  location                     = var.region
  version                      = "12.0"
  administrator_login          = var.sql_admin
  administrator_login_password = var.sql_password
}

#  Create Azure SQL Database
resource "azurerm_mssql_database" "warden_db" {
  name                = "${var.project_name}-db"
  server_id           = azurerm_mssql_server.warden_sql_server.id
  collation           = "SQL_Latin1_General_CP1_CI_AS"
  max_size_gb         = 2
  
  sku_name            = "Basic" # Basic tier, 2GB max size
  depends_on = [azurerm_mssql_server.warden_sql_server]

}

#  Allow Azure Services to Access SQL Server
resource "azurerm_mssql_firewall_rule" "allow_azure_services" {
  name                = "AllowAzureServices"
  server_id           = azurerm_mssql_server.warden_sql_server.id
  start_ip_address    = "0.0.0.0"
  end_ip_address      = "0.0.0.0"
}

# Azure App Service (Express Backend)
resource "azurerm_service_plan" "warden_service_plan" {
  name                = "${var.project_name}-plan"
  resource_group_name = azurerm_resource_group.warden_rg.name
  location            = var.region
  os_type             = "Linux"
  sku_name            = "F1" # free tier, NO autoscaling or multiple instance support
}
#  Create Azure App Service (For Express Backend)
resource "azurerm_linux_web_app" "warden_backend" {
  name                = "${var.project_name}-backend"
  resource_group_name = azurerm_resource_group.warden_rg.name
  location            = var.region
  service_plan_id     = azurerm_service_plan.warden_service_plan.id

  site_config {
    always_on = true
    application_stack {
      node_version = "18-lts"
    }
  }

  app_settings = {
    "DATABASE_URL" = "Server=tcp:${azurerm_mssql_server.warden_sql_server.fully_qualified_domain_name},1433;Initial Catalog=${azurerm_mssql_database.warden_db.name};Persist Security Info=False;User ID=${var.sql_admin};Password=${var.sql_password};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  }
}

#  Create Azure Static Web App (For React Frontend)
resource "azurerm_static_web_app" "warden_frontend" {
  name                = "${var.project_name}-frontend"
  resource_group_name = azurerm_resource_group.warden_rg.name
  location            = "westeurope"
  sku_tier            = "Free" # free tier, NO autoscaling or multiple instance support 

  repository_url        = "https://github.com/8WhyIAmHere8/fire-tracker"
  repository_branch = "main"
  repository_token =  var.git_tocken
  
}

# 🔹 Output Connection Details
output "database_connection_string" {
  value     = "Server=tcp:${azurerm_mssql_server.warden_sql_server.fully_qualified_domain_name},1433;Initial Catalog=${azurerm_mssql_database.warden_db.name};User ID=${var.sql_admin};Password=${var.sql_password};Encrypt=True;"
  sensitive = true
}

output "backend_url" {
  value = azurerm_linux_web_app.warden_backend.default_hostname
}

output "frontend_url" {
  value = azurerm_static_web_app.warden_frontend.default_host_name
}
