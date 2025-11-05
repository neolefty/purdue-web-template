# Deploying to Geddes Kubernetes Cluster

**⚠️ Note**: Geddes is a research computing platform, not a production-grade cluster. It's useful for:
- Testing Kubernetes deployments
- Research projects requiring external accessibility
- Prototyping before production clusters are ready

This guide contains verified working configuration for deploying to the Geddes RKE cluster at Purdue RCAC.

**For production deployments**: Wait for the production Kubernetes clusters currently under construction.

## Cluster Access

### Getting Kubeconfig

1. Navigate to Rancher UI: https://geddes.rcac.purdue.edu
2. Login with your Purdue credentials
3. Navigate to your cluster view (not the Account page)
4. Look for **"Kubeconfig File"** button in top-right corner
5. Download the `geddes.yaml` kubeconfig file

### Using Kubeconfig

```bash
# Option 1: Single command
kubectl --kubeconfig=./geddes.yaml get pods -n your-namespace

# Option 2: Environment variable (recommended)
export KUBECONFIG=./geddes.yaml
kubectl get pods -n your-namespace

# Option 3: Merge into default config
KUBECONFIG=~/.kube/config:./geddes.yaml kubectl config view --flatten > ~/.kube/config-merged
mv ~/.kube/config-merged ~/.kube/config
```

## Namespace & Resource Quotas

**Example namespace**: `beecher-sandbox` (created via Rancher UI)

All namespaces have ResourceQuotas that **require** resource limits on all pods:

```yaml
# Example quota limits for beecher-sandbox:
limits.cpu: 3 cores total
limits.memory: 12000Mi (12GB) total
pods: 4 maximum
requests.storage: 16Gi persistent volumes
```

**Key requirement**: Every container MUST specify `resources.requests` and `resources.limits` or pod creation will fail.

```yaml
# Minimum required in every container spec:
resources:
  requests:
    memory: "64Mi"
    cpu: "100m"
  limits:
    memory: "128Mi"
    cpu: "200m"
```

## HTTP Ingress Configuration

### ✅ Verified Working Configuration

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app
  namespace: your-namespace
spec:
  ingressClassName: public  # REQUIRED for external access!
  rules:
  - host: my-app-your-namespace.geddes.rcac.purdue.edu
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: my-app
            port:
              number: 80
```

### Key Details

- **ingressClassName: public** - REQUIRED for external access (default is Purdue-internal only)
- **Hostname pattern**: `<name>-<namespace>.geddes.rcac.purdue.edu`
- **DNS**: Automatically configured, propagates in ~1-2 minutes
- **TLS/HTTPS**: Automatically provisioned (cert-manager or similar)
- **Ingress controller**: nginx-ingress-controller (manages sync)
- **DNS resolves to**: 128.211.160.110

### Common Mistakes to Avoid

1. ❌ Omitting `ingressClassName: public` → Only accessible from Purdue network
2. ❌ Using old annotation style `kubernetes.io/ingress.class: traefik` → Works but deprecated
3. ❌ Wrong hostname pattern → DNS won't resolve

## Complete Working Example

Tested and verified October 2025:

```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  namespace: your-namespace
spec:
  replicas: 1
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: app
        image: your-registry/your-app:latest
        ports:
        - containerPort: 8000
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
---
apiVersion: v1
kind: Service
metadata:
  name: my-app
  namespace: your-namespace
spec:
  selector:
    app: my-app
  ports:
  - port: 80
    targetPort: 8000
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app
  namespace: your-namespace
spec:
  ingressClassName: public
  rules:
  - host: my-app-your-namespace.geddes.rcac.purdue.edu
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: my-app
            port:
              number: 80
```

## Testing Your Deployment

```bash
# Apply manifests
kubectl apply -f deployment.yaml

# Watch deployment progress
kubectl get pods -n your-namespace -w

# Check ingress status (wait for ADDRESS to populate)
kubectl get ingress -n your-namespace

# Describe ingress for events
kubectl describe ingress my-app -n your-namespace

# Test DNS resolution
nslookup my-app-your-namespace.geddes.rcac.purdue.edu

# Access via IP with Host header (during DNS propagation)
curl -H "Host: my-app-your-namespace.geddes.rcac.purdue.edu" http://128.211.160.110

# Access via hostname (after DNS propagates)
curl https://my-app-your-namespace.geddes.rcac.purdue.edu
```

## Permissions & RBAC

Your kubeconfig has:
- ✅ Full access to your namespace (create/read/update/delete)
- ❌ No cluster-wide resource viewing (normal for shared clusters)
- ✅ Can create: Deployments, Services, Ingresses, ConfigMaps, Secrets, PVCs

You cannot:
- View resources in other namespaces
- List all namespaces
- View cluster-level resources (nodes, ingressclasses, etc.)

## Documentation

- **Official Guide**: https://www.rcac.purdue.edu/knowledge/geddes
- **Ingress Example**: https://www.rcac.purdue.edu/knowledge/geddes/examples/webserver
- **Kubernetes Guide**: https://www.rcac.purdue.edu/knowledge/geddes/kubernetes

## Next Steps for Django-React Template

1. **Build container images**:
   - Backend (Django + Gunicorn)
   - Frontend (Nginx serving React build)
   - Optional: Combined image

2. **Push to registry**:
   - Use Docker Hub, GitHub Container Registry, or Purdue's registry
   - Geddes can pull from public registries

3. **Create secrets**:
   ```bash
   kubectl create secret generic app-secrets \
     --from-literal=database-url="postgres://..." \
     --from-literal=secret-key="..." \
     --from-literal=debug="False" \
     -n your-namespace
   ```

4. **Adapt the working example** above to your app structure

5. **Consider using Kustomize** for environment-specific configs:
   ```
   base/
     deployment.yaml
     service.yaml
     ingress.yaml
   overlays/
     dev/
     staging/
     production/
   ```

## Tips & Gotchas

- **Resource limits are enforced**: Monitor your quota usage
- **Pods restart if over memory limit**: Set limits appropriately
- **Static files**: Consider separate nginx container or CDN
- **Database**: Consider external managed Postgres vs in-cluster
- **Secrets**: Never commit kubeconfig or secrets to git
- **Logs**: Use `kubectl logs -f pod-name` or set up log aggregation
- **Health checks**: Add liveness/readiness probes to deployments
- **Migrations**: Run as Kubernetes Job, not in main container

## Troubleshooting

```bash
# Pod won't start - check events
kubectl describe pod <pod-name> -n your-namespace

# Pod crashing - check logs
kubectl logs <pod-name> -n your-namespace
kubectl logs <pod-name> -n your-namespace --previous  # Previous crash

# Ingress not working - check events
kubectl describe ingress <ingress-name> -n your-namespace

# Service not routing - check endpoints
kubectl get endpoints <service-name> -n your-namespace

# Resource quota exceeded
kubectl get resourcequota -n your-namespace
kubectl describe resourcequota -n your-namespace
```

## Contact

For Geddes-specific issues: https://www.rcac.purdue.edu/contact

---

**Last Updated**: October 28, 2025
**Tested by**: wbbaker
**Cluster**: geddes.rcac.purdue.edu (RKE with Rancher v1)
