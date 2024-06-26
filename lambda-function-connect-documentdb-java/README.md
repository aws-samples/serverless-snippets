## Prerequisites

- node.js v16+
- npm installed
- Java 17+
- An AWS Account

## Preparation

- Install CDK dependencies by running `cd cdk && npm i` in the project root
- Make sure to have a [bootstrapped](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html) CDK for the region and account you want to use by running `npx cdk bootstrap aws://<ACCOUNT_ID>/<REGION>`
- Make sure that you have valid credentials that the CDK can use for [programmatic access](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_auth)s to your account

## Deploy the environment

1. Deploy the environment by running `source ./deploy.sh` in the `cdk` folder. This should take around 10 minutes
2. After the stack deployment succeeded, CDK generated an output file containing all relevant parameters in `cdk/outputs/parameters.json`

### Create, Retrieve, Update, Delete (CRUD) & Query 

You can now use CRUD operations to manage data in DocumentDB via a REST API

#### Create

Run the following command to create a new record in DocumentDB through the API

```
API_URL=<ApiEndpoint value copied from CDK output>
curl --request POST \
  --url $API_URL/movies \
  --header 'Content-Type: application/json' \
  --data '{
	"Title": "The Lord of the Rings: The Fellowship of the Ring",
	"Year": 2001,
	"Rated": "PG-13",
	"Released": "19 Dec 2001",
	"Runtime": "178 min",
	"Genre": "Action, Adventure, Drama",
	"Director": "Peter Jackson",
	"Writer": "J.R.R. Tolkien, Fran Walsh, Philippa Boyens",
	"Actors": "Elijah Wood, Ian McKellen, Orlando Bloom",
	"Plot": "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.",
	"Language": "English, Sindarin",
	"Country": "New Zealand, United States",
	"Awards": "Won 4 Oscars. 125 wins & 127 nominations total",
	"Poster": "https://m.media-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_SX300.jpg",
	"Ratings": [
		{
			"Source": "Internet Movie Database",
			"Value": "8.9/10"
		},
		{
			"Source": "Rotten Tomatoes",
			"Value": "92%"
		},
		{
			"Source": "Metacritic",
			"Value": "92/100"
		}
	],
	"Metascore": "92",
	"imdbRating": "8.9",
	"imdbVotes": "2,017,935",
	"imdbID": "tt0120737",
	"Type": "movie",
	"DVD": "N/A",
	"BoxOffice": "$318,572,165",
	"Production": "N/A",
	"Website": "N/A",
	"Response": "True"
}'
```

#### Retrieve

Run the following command to retrieve a record

```
curl --request GET --url $API_URL/movies/<id>
```

#### Update

Run the following command to update a record

```
curl --request PATCH \
  --url $API_URL/movies/<id> \
  --header 'Content-Type: application/json' \
  --data '{
	"Year": 2003,
    }'
```

#### Delete

Run the following command to delete a record

```
curl --request DELETE --url $API_URL/movies/<id>
```

#### Query

The API allows to get all movies or filter out specific movies via the query parameters (see `java/documentdb/sample/Query.java`)
Run the following queries to get all movies from 1980 or later

```
curl --request GET --url '$API_URL/movies?yearFrom=1980'
```

