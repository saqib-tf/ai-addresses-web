# Deploy to Azure

## Create static website on Azure

Create new static website. In source choose github repository. It will detect React, but choose NextJS platform. Leave all other fields default/empty.

On save, it will add workflow file in github repository. Edit the workflow file and add the following section to create new .env before the build process.

- name: Generate Env File
  run: echo 'NEXT_PUBLIC_WEB_API_BASE_URL=${{ secrets.NEXT_PUBLIC_WEB_API_BASE_URL }}' >> .env

For reference check out the workflow file of this repository.

No need to create environment variable in Azure static website.

## next.config.ts

Set output to standalone.
Set eslint ignore error during builds to true.

##
