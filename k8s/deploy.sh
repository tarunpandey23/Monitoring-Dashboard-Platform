#!/bin/bash

# Deployment script for Monitoring Dashboard Platform
# Usage: ./deploy.sh [namespace]

set -e

NAMESPACE=${1:-monitoring-platform}

echo "🚀 Deploying Monitoring Dashboard Platform to namespace: $NAMESPACE"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi

echo "✅ Kubernetes cluster is accessible"

# Apply manifests in order
echo "📦 Creating namespace..."
kubectl apply -f namespace.yaml

echo "⚙️  Creating ConfigMap..."
kubectl apply -f configmap.yaml

echo "🔧 Deploying backend..."
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml

echo "🎨 Deploying frontend..."
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml

echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/backend -n $NAMESPACE || true
kubectl wait --for=condition=available --timeout=300s deployment/frontend -n $NAMESPACE || true

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Deployment Status:"
kubectl get deployments -n $NAMESPACE
echo ""
kubectl get services -n $NAMESPACE
echo ""
kubectl get pods -n $NAMESPACE
echo ""

# Get NodePort information
echo "🌐 Service Access:"
echo ""
BACKEND_NODEPORT=$(kubectl get service backend-service -n $NAMESPACE -o jsonpath='{.spec.ports[0].nodePort}')
FRONTEND_NODEPORT=$(kubectl get service frontend-service -n $NAMESPACE -o jsonpath='{.spec.ports[0].nodePort}')

# Try to get node IP
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}' 2>/dev/null || \
          kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="ExternalIP")].address}' 2>/dev/null || \
          echo "localhost")

echo "Frontend: http://$NODE_IP:$FRONTEND_NODEPORT"
echo "Backend:  http://$NODE_IP:$BACKEND_NODEPORT"
echo ""
echo "💡 Tip: Use 'kubectl port-forward' for local access:"
echo "   kubectl port-forward service/frontend-service 3000:80 -n $NAMESPACE"
echo "   kubectl port-forward service/backend-service 8080:8080 -n $NAMESPACE"

