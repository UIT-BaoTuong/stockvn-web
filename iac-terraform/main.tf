resource "azurerm_resource_group" "rg_k8s" {
  name     = "rg-k8s-lab"  
  location = "Central India"
  
  tags = {
    Environment = "lab"     
    Owner       = "tuongndb"
  }
}
resource "azurerm_virtual_network" "vnet_k8s" {
  name = "vnet-k8s"
  location = "Central India"
  address_space = [ "10.0.0.0/16" ]
  resource_group_name = azurerm_resource_group.rg_k8s.name
  tags = {
    Project = "terraform"
  }
}
resource "azurerm_subnet" "subnet_k8s" {
  name = "snet-k8s"
  resource_group_name = azurerm_resource_group.rg_k8s.name
  virtual_network_name = azurerm_virtual_network.vnet_k8s.name
  address_prefixes = ["10.0.1.0/24"]
}
resource "azurerm_kubernetes_cluster" "aks" {
    name = "aks-k8s"
    location = azurerm_resource_group.rg_k8s.location
    resource_group_name = azurerm_resource_group.rg_k8s.name
    dns_prefix = "aksdns"
    default_node_pool {
      name = "default"
      node_count = 2
      vm_size = "standard_b2as_v2"
      vnet_subnet_id = azurerm_subnet.subnet_k8s.id
    }
    network_profile {
    network_plugin     = "azure"
    service_cidr       = "172.16.0.0/16"
    dns_service_ip     = "172.16.0.10"
    }
    identity {
      type = "SystemAssigned"
    }
    tags = {
        Environment = "lab"
    }
}
# 1. Tạo Network Security Group (NSG)
resource "azurerm_network_security_group" "nsg_k8s" {
  name                = "nsg-k8s-allow-web"
  location            = azurerm_resource_group.rg_k8s.location
  resource_group_name = azurerm_resource_group.rg_k8s.name

  # Mở cổng 80 cho HTTP
  security_rule {
    name                       = "AllowHTTP"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  # Mở cổng 443 cho HTTPS
  security_rule {
    name                       = "AllowHTTPS"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

# 2. Liên kết NSG này vào Subnet snet-k8s
resource "azurerm_subnet_network_security_group_association" "subnet_assoc" {
  subnet_id                 = azurerm_subnet.subnet_k8s.id
  network_security_group_id = azurerm_network_security_group.nsg_k8s.id
}