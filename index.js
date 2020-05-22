const path = require('path')
const slugify = require('slugify')

const { Storage } = require('@google-cloud/storage')

const checkServiceAccount = (config) => {
  if (!config.serviceAccount) {
    throw new Error('"Service Account JSON" is required!')
  }
  if (!config.bucketName) {
    throw new Error('"Bucket name" is required!')
  }
  if (!config.baseUrl) {
    /** Set to default **/
    config.baseUrl = 'https://storage.googleapis.com/{bucket-name}'
  }
  try {
    const serviceAccount =
      typeof config.serviceAccount === 'string'
        ? JSON.parse(config.serviceAccount)
        : config.serviceAccount

    /**
     * Check exist
     */
    if (!serviceAccount.project_id) {
      throw new Error(
        'Error parsing data "Service Account JSON". Missing "project_id" field in JSON file.'
      )
    }
    if (!serviceAccount.client_email) {
      throw new Error(
        'Error parsing data "Service Account JSON". Missing "client_email" field in JSON file.'
      )
    }
    if (!serviceAccount.private_key) {
      throw new Error(
        'Error parsing data "Service Account JSON". Missing "private_key" field in JSON file.'
      )
    }
    return serviceAccount
  } catch (e) {
    throw new Error(
      'Error parsing data "Service Account JSON", please be sure to copy/paste the full JSON file.'
    )
  }
}

const checkBucket = async (GCS, bucketName) => {
  let bucket = GCS.bucket(bucketName)
  await bucket.exists().then((data) => {
    if (!data[0]) {
      throw new Error(
        'An error occurs when we try to retrieve the Bucket "' +
          bucketName +
          '". Check if bucket exist on Google Cloud Platform.'
      )
    }
  })
}

const mergeConfigs = (providerConfig) => {
  let customGcsConfig = strapi.config.gcs ? strapi.config.gcs : {}
  let customEnvGcsConfig = strapi.config.currentEnvironment.gcs
    ? strapi.config.currentEnvironment.gcs
    : {}
  return { ...providerConfig, ...customGcsConfig, ...customEnvGcsConfig }
}

module.exports = {
  init(providerConfig) {
    const config = mergeConfigs(providerConfig)
    const serviceAccount = checkServiceAccount(config)
    const GCS = new Storage({
      projectId: serviceAccount.project_id,
      credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key,
      },
    })

    return {
      upload(file) {
        return new Promise((resolve, reject) => {
          const backupPath =
            file.related && file.related.length > 0 && file.related[0].ref
              ? `${file.related[0].ref}`
              : `${file.hash}`
          const filePath = file.path ? `${file.path}/` : `${backupPath}/`
          const fileName =
            slugify(path.basename(file.name + '_' + file.hash, file.ext)) +
            file.ext.toLowerCase()
          GCS.bucket(config.bucketName)
            .file(`${filePath}${fileName}`)
            .save(file.buffer, {
              contentType: file.mime,
              metadata: {
                contentDisposition: `inline; filename="${file.name}"`,
              },
            })
            .then(() => {
              file.url = `${config.baseUrl.replace(
                /{bucket-name}/,
                config.bucketName
              )}/${filePath}${fileName}`
              strapi.log.debug(`File successfully uploaded to ${file.url}`)
              resolve()
            })
            .catch((error) => {
              return reject(error)
            })
        })
      },
      delete(file) {
        return new Promise((resolve, reject) => {
          const fileName = `${file.url.replace(
            config.baseUrl.replace('{bucket-name}', config.bucketName) + '/',
            ''
          )}`

          GCS.bucket(config.bucketName)
            .file(fileName)
            .delete()
            .then(() => {
              strapi.log.debug(`File ${fileName} successfully deleted`)
            })
            .catch((error) => {
              if (error.code === 404) {
                return strapi.log.warn(
                  'Remote file was not found, you may have to delete manually.'
                )
              }
              reject(error)
            })
          resolve()
        })
      },
    }
  },
}
