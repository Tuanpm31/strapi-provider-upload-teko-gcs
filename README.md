strapi-provider-upload-google-cloud-storage

**Non-Official** Google Cloud Storage Provider for Strapi Upload

## Installation

Install the package from your app root directory

with `npm`

```
npm install strapi-provider-upload-teko-gcs --save
```

or `yarn`

```
yarn add strapi-provider-upload-teko-gcs
```

## <a name="create-bucket"></a> Create your Bucket on Google Cloud Storage

### How to create a bucket ?

- https://cloud.google.com/storage/docs/creating-buckets

### Where my bucket can be located ?

- https://cloud.google.com/storage/docs/locations

## Setting up Google authentication

1. In the GCP Console, go to the **Create service account key** page..
   - **[Go to the create service account key page](https://console.cloud.google.com/apis/credentials/serviceaccountkey)**
2. From the **Service account** list, select **New service account**.
3. In the **Service account name** field, enter a name.
4. From the **Role** list, select **Cloud Storage > Storage Onject Admin** or higher.
5. Select `JSON` for **Key Type**
6. Click **Create**. A JSON file that contains your key downloads to your computer.

## Setting up the a configuration file

You will find below many examples of configurations, for each example :

1. Copy the full content of the downloaded JSON file
2. Open the configuration file
3. Paste it into the "Service Account JSON" field (as `string` or `JSON`, be careful with indentation)
4. Set the `bucketName` field and replace `Bucket-name` by yours [previously create](#create-bucket)
5. Default `baseUrl` is working, but you can replace it by yours (if you use a custom baseUrl)
6. Save the configuration file
7. Enjoy !

**Example with one configuration for all environments (dev/stage/prod)**

`./extensions/upload/config/settings.json`

```json
{
  "provider": "google-cloud-storage",
  "providerOptions": {
    "serviceAccount": "<Your serviceAccount JSON object/string here>",
    "bucketName": "Bucket-name",
    "baseUrl": "https://storage.googleapis.com/{bucket-name}"
  }
}
```

**Example with environment variable**

`./extensions/upload/config/settings.json`

```json
{
  "provider": "google-cloud-storage",
  "providerOptions": {
    "serviceAccount": "${process.env.GCS_SERVICE_ACCOUNT || <Your serviceAccount JSON object/string here>}",
    "bucketName": "${process.env.GCS_BUCKET_NAME || Bucket-name}",
    "baseUrl": "${process.env.GCS_BASE_URL || https://storage.googleapis.com/{bucket-name}}"
  }
}
```

You can rename the `environment variables` as you like.
All variable are optional, you can setting up only `bucketName` if you need to change only the `bucketName`.

**Example with multi configuration multi upload : one by environment (dev/stage/prod)**

`./extensions/upload/config/settings.js`

```js
const stagingProviderOptions = {
  serviceAccount: '<Your serviceAccount JSON object/string here>', // json configuration
  bucketName: 'Bucket-name', // name of the bucket
  baseUrl: 'https://storage.googleapis.com/{bucket-name}',
}

const productionProviderOptions = {
  serviceAccount: '<Your serviceAccount JSON object/string here>', // json configuration
  bucketName: 'Bucket-name', // name of the bucket
  baseUrl: 'https://storage.googleapis.com/{bucket-name}',
}

if (process.env.NODE_ENV === 'production') {
  module.exports = {
    provider: 'google-cloud-storage',
    providerOptions: productionProviderOptions,
  }
} else if (process.env.NODE_ENV === 'staging') {
  module.exports = {
    provider: 'google-cloud-storage',
    providerOptions: stagingProviderOptions,
  }
} else {
  module.exports = {
    provider: 'local',
  }
}
```

**Overriding `uploadProvider` config with `gcs` key in Strapi custom config**

Contents of `gcs` key in Strapi custom config, if set, will be merged over `./extensions/upload/config/settings.json`,

`./config/custom.json` (config items set here will be merged over, overriding config set at `./extensions/upload/config/settings.json`)

```json
{
  "gcs": {
    "serviceAccount": "<Your serviceAccount JSON object/string here>",
    "bucketName": "Bucket-name",
    "baseUrl": "https://storage.googleapis.com/{bucket-name}"
  }
}
```

`./config/environments/<development|staging|production>/custom.json` (config items set here will be merged over and override the previous ones)

```json
{
  "gcs": {
    "serviceAccount": "<Your serviceAccount JSON object/string here>",
    "bucketName": "Bucket-name",
    "baseUrl": "https://storage.googleapis.com/{bucket-name}"
  }
}
```

## How to configure variable ?

#### `serviceAccount` :

JSON data provide by Google Account (explained before).

Can be set as a String or JSON Object.

#### `bucketName` :

The name of the bucket on Google Cloud Storage.
You can find more information on Google Cloud documentation.

#### `baseUrl` :

Define your base Url, first is default value :

- https://storage.googleapis.com/{bucket-name}
- https://{bucket-name}
- http://{bucket-name}

## Important information

From release `3.0.0-beta.20` the `bucketLocation` is no longer supported.
The plugin will not create the bucket, you need to configure it before.

## Resources
