# sdk-nodejs-cert-manager
[![[ CI ] Certificate Manager / Node](https://github.com/ionos-cloud/sdk-resources/actions/workflows/ci-certmanager-node.yml/badge.svg)](https://github.com/ionos-cloud/sdk-resources/actions/workflows/ci-certmanager-node.yml)
# Overview
Using the Certificate Manager Service, you can conveniently provision and manage SSL certificates with IONOS services and your internal connected resources.

## Installation

Install the following dependencies:

```shell
npm i --save @ionos-cloud/sdk-nodejs-cert-manager
```

## Usage
Import the SDK using:

```javascript
const ionoscloud = require('@ionos-cloud/sdk-nodejs-cert-manager');
```

Or, if the import is done from an ES module, use:

```javascript
import * as ionoscloud from '@ionos-cloud/sdk-nodejs-cert-manager';
```

### Example

```javascript
const ionoscloud = require('@ionos-cloud/sdk-nodejs-cert-manager');
// setup authorization
const config = new ionoscloud.Configuration({
    username: 'YOUR_USERNAME',
    password: 'YOUR_PASSWORD',
    apiKey: 'YOUR_API_KEY'
});
const api_instance = new ionoscloud.InformationApi(config);
// Get the Service API Information
api_instance
  .getInfo()
  .then((response) => console.log(response.data))
  .catch((error) => console.log(error.response.data));
```

Returns the information about the API.

### Authentication

The username and password or the authentication token can be manually specified when initializing the configuration:

```javascript
const config = new ionoscloud.Configuration({
    username: 'YOUR_USERNAME',
    password: 'YOUR_PASSWORD',
    apiKey: 'YOUR_API_KEY'
});
```

Environment variables can also be used; the SDK uses the following variables:

* IONOS\_USERNAME - to specify the username used to log in
* IONOS\_PASSWORD - to specify the password
* IONOS\_TOKEN - if an authentication token is being used

In this case, the client configuration must be initialized using `fromEnv()`:

```javascript
const config = new ionoscloud.Configuration.fromEnv();
```

{% hint style="danger" %}
**Warning**: Make sure to follow the Information Security Best Practices when using credentials within your code or storing them in a file.
{% endhint %}

## Feature Reference

The IONOS Cloud SDK for Certificate Manager aims to offer access to all resources in the IONOS Certificate Manager API, and has additional features to make integration easier:

* Authentication for API calls
* Asynchronous request handling

## FAQ

1. How can I open a bug report/feature request?

Bug reports and feature requests can be opened in the Issues repository: [https://github.com/ionos-cloud/sdk-nodejs-cert-manager/issues/new/choose](https://github.com/ionos-cloud/sdk-nodejs-cert-manager/issues/new/choose)

2. Can I contribute to the NodeJS Certificate Manager SDK?

Our SDKs are automatically generated using OpenAPI Generator and don’t support manual changes. If you require changes, please open an issue, and we will try to address it.