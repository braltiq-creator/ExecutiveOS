# Permissions Guide

## Least privilege

The provider reads commercial activity only. Required object access:

- Account (read)
- Opportunity (read)
- Contact (read)
- Case (read)
- Campaign (read)
- Quote (read)
- Product2 / Pricebook (read, optional)
- Forecast / related reporting (read, as available)

## OAuth scopes

`api`, `refresh_token`, `offline_access`, `id`, `profile`

## Permission sets

Create a dedicated Permission Set for ExecutiveOS:

1. API Enabled
2. Object permissions: Read on commercial objects above
3. View Setup and Configuration: not required
4. Modify All Data: **deny**

## Validation

`assertSalesforceLeastPrivilege` rejects excess consented scopes beyond the baseline list.
