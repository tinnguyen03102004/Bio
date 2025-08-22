#!/bin/bash
set -e

mkdir -p admin content/products static/uploads

cat <<'HTML' > admin/index.html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Content Manager</title>
</head>
<body>
  <script src="https://unpkg.com/decap-cms@^2.0.0/dist/decap-cms.js"></script>
</body>
</html>
HTML

cat <<'YAML' > admin/config.yml
backend:
  name: github
  repo: tinnguyen03102004/Bio
  branch: main
  base_url: https://bio-oauth.vercel.app

media_folder: static/uploads
public_folder: /uploads

collections:
  - name: products
    label: Products
    folder: content/products
    create: true
    slug: "{{slug}}"
    fields:
      - {label: "Title", name: "title", widget: "string"}
      - {label: "Slug", name: "slug", widget: "string"}
      - {label: "Price", name: "price", widget: "number"}
      - {label: "Compare at Price", name: "compare_at_price", widget: "number", required: false}
      - {label: "Buy URL", name: "buy_url", widget: "string"}
      - {label: "Featured Image", name: "featured_image", widget: "image"}
      - {label: "Gallery", name: "gallery", widget: "list", field: {label: "Image", name: "image", widget: "image"}}
      - label: "Attributes"
        name: "attributes"
        widget: "object"
        fields:
          - {label: "Material", name: "material", widget: "string"}
          - {label: "Fit", name: "fit", widget: "string"}
          - {label: "Care", name: "care", widget: "string"}
          - {label: "Made in", name: "made_in", widget: "string"}
      - {label: "Variants", name: "variants", widget: "list", fields: [{label: "Name", name: "name", widget: "string"}, {label: "SKU", name: "sku", widget: "string"}, {label: "Price", name: "price", widget: "number"}]}
      - {label: "Tags", name: "tags", widget: "list"}
      - label: "SEO"
        name: "seo"
        widget: "object"
        fields:
          - {label: "Title", name: "title", widget: "string"}
          - {label: "Description", name: "description", widget: "string"}
      - {label: "Body", name: "body", widget: "markdown"}
YAML

cat <<'MD' > content/products/studios-basic-t-shirt.md
---
title: "Studios Basic T-shirt"
slug: "studios-basic-t-shirt"
price: 350000
compare_at_price: 550000
buy_url: "https://hellstar.com/products/studios-basic-t-shirt"
featured_image: "/uploads/studios-basic-t-shirt.jpg"
gallery:
  - "/uploads/studios-basic-t-shirt-1.jpg"
  - "/uploads/studios-basic-t-shirt-2.jpg"
attributes:
  material: "100% cotton"
  fit: "Regular fit"
  care: "Machine wash cold"
  made_in: "Vietnam"
variants:
  - name: "Small"
    sku: "SBTS-S"
    price: 350000
  - name: "Medium"
    sku: "SBTS-M"
    price: 350000
  - name: "Large"
    sku: "SBTS-L"
    price: 350000
tags:
  - "t-shirt"
  - "studios"
seo:
  title: "Studios Basic T-shirt – Kadie.Nuwrld"
  description: "Minimal classic tee with a regular fit."
---

A minimal tee featuring the Studios logo printed on the chest.
Crafted from soft cotton jersey for everyday comfort.
MD

# Ensure uploads directory exists
mkdir -p static/uploads
[ -f static/uploads/.gitkeep ] || touch static/uploads/.gitkeep

# Commit
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git add admin/index.html admin/config.yml content/products/studios-basic-t-shirt.md static/uploads/.gitkeep setup-decap.sh
  git commit -m "feat: add Decap CMS admin and sample product"
  git push origin main
fi
