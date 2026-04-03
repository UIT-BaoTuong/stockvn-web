output "k8s_name" {
  value = azurerm_kubernetes_cluster.aks.name
}

output "k8s_resource_group" {
  value = azurerm_kubernetes_cluster.aks.resource_group_name
}

output "k8s_get_credentials" {
  value = "az aks get-credentials --resource-group ${azurerm_kubernetes_cluster.aks.resource_group_name} --name ${azurerm_kubernetes_cluster.aks.name} --overwrite-existing"
}