[![Build Status](https://travis-ci.org/srobinson/secure-kv-store.svg?branch=master)](https://travis-ci.org/srobinson/secure-kv-store)

# Secure Key Value Store

## Starting the service

```
# install dependencies
yarn

# run tests
yarn test

# run express server
yarn start

# I'm running a docker image for PG
docker run --rm --name postgres -e POSTGRES_PASSWORD=docker -p 5432:5432 postgres

# create db tables
node db.create.js
```

## Manual tests

```
# get an encryption_key

key=$(curl -s http://localhost:3001/generate-key?secret=iwantakey | jq '.key' | sed -e 's/^"//' -e 's/"$//')

# store some data

data1=$(
cat <<EOF
{
  "name": "king",
  "surname": "kong",
  "age": 100,
  "habits": [
    "eating",
    "sleeping",
    "getting down with it"
  ]
}
EOF
)

curl -XPOST -s -H "x-kvsec-token: $key" -H "Content-Type: application/json" -d "$data1" http://localhost:3001/store?id=data-1

data2=$(
cat <<EOF
{
  "appointment": "interview",
  "location": "London",
  "when": "$(date -v+1d)"
}
EOF
)

curl -XPOST -s -H "x-kvsec-token: $key" -H "Content-Type: application/json" -d "$data2" http://localhost:3001/store?id=data-2

# search data

curl -XGET -s -H "x-kvsec-token: $key" http://localhost:3001/store?q=data-1

curl -XGET -s -H "x-kvsec-token: $key" http://localhost:3001/store?q=data-2

curl -XGET -s -H "x-kvsec-token: $key" http://localhost:3001/store?q=data-*

```
