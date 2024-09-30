cd ../lambda || exit
gradle build -i

cd ../cdk || exit
npx cdk deploy DocumentDbLambdaSampleStack --require-approval never --hotswap-fallback --outputs-file ./outputs/parameters.json