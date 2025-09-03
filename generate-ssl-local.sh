#!/bin/bash

# Generate self-signed SSL certificates for local production testing
# This creates certificates for django-template.local

SSL_DIR="./ssl"
DOMAIN="django-template.local"

echo "Creating SSL directory..."
mkdir -p $SSL_DIR

echo "Generating self-signed certificate for $DOMAIN..."

# Generate private key
openssl genrsa -out $SSL_DIR/server.key 2048

# Generate certificate signing request
openssl req -new -key $SSL_DIR/server.key -out $SSL_DIR/server.csr \
    -subj "/C=US/ST=Indiana/L=West Lafayette/O=Purdue University/CN=$DOMAIN"

# Generate self-signed certificate (valid for 365 days)
openssl x509 -req -days 365 -in $SSL_DIR/server.csr \
    -signkey $SSL_DIR/server.key -out $SSL_DIR/server.crt

# Clean up CSR
rm $SSL_DIR/server.csr

echo "SSL certificates generated in $SSL_DIR/"
echo ""
echo "To use these certificates:"
echo "1. Add this line to your /etc/hosts file:"
echo "   127.0.0.1 $DOMAIN"
echo ""
echo "2. Run the production Docker Compose:"
echo "   docker compose -f docker-compose.prod.yml up"
echo ""
echo "3. Access the site at:"
echo "   http://$DOMAIN (HTTP)"
echo "   https://$DOMAIN (HTTPS - will show security warning)"

# Make script executable
chmod +x generate-ssl-local.sh
