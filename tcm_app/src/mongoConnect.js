const {MongoClient} = require('mongodb');

async function main()
{
    const uri = "mongodb+srv://Noah:BongoMongo321@tcmcluster.wmrfz.mongodb.net/sample_airbnb?retryWrites=true&w=majority";

    const client = new MongoClient(uri);

    try 
    {
        await client.connect;
        await listDatabases(client);

        //create function calls
        await createListing(client, 
            {
                name: "Lovely Loft",
                summary: "A charming loft in Paris",
                bedrooms: 1,
                bathrooms: 1

            });

        await createMultipleListings(client, [
            {
                name: "Infinite Views",
                summary: "Modern home with infinite views from the infinity pool",
                property_type: "House",
                bedrooms: 5,
                bathrooms: 4.5,
                beds: 5
            },
            {
                name: "Private room in London",
                property_type: "Apartment",
                bedrooms: 1,
                bathrooms: 1
            },
            {
                name: "Beautiful Beach House",
                summary: "Enjoy relaxed beach living in this house wit ha private beach",
                bedrooms: 4,
                bathrooms: 2.5,
                beds: 7,
                last_review: new Date()
            }
        ]);
        
        //read function calls
        await findOneListingByName(client, "Infinite Views");

        await findListingsWithMinimumBedroomsBathroomsAndMostRecentReviews(client,
            {
                minimumNumberOfBedrooms: 4,
                minimumNumberOfBathrooms: 2,
                maximumNumberOfResults: 5
            });
        
        //update function calls
        await updateListingByName(client, "Infinite Views", { bedrooms: 6, beds: 8});

        await upsertListingByName(client, "Cozy Cottage", {name: "Cozy Cottage", bedrooms: 2, bathrooms: 1});
        await upsertListingByName(client, "Cozy Cottage", {beds: 2});

        await updateAllListingsToHavePropertyType(client);

        //delete function calls
        await deleteListingByName(client, "Cozy Cottage");

        await deleteListingsScrapedBeforeDate(client, new Date("2019-02-15"));
    }
    catch(e)
    {
        console.error(e);
    }
    finally
    {
        await client.close();
    }
}

main().catch(console.error);

async function listDatabases(client)
{
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
}

//part of the create of crud
async function createListing(client, newlisting)
{
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertOne(newlisting);
    console.log(`New listing created with the following id: ${result.insertedId}`);
}

//part ofthe create of crud
async function createMultipleListings(client, newlistings)
{
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertMany(newlistings);

    console.log(`${result.insertedCount} new listing(s) created with the following id(s):`);
    console.log(result.insertedIds);
}

//part of the read of crud
async function findOneListingByName(client, nameOfListing)
{
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").findOne({ name: nameOfListing});

    if(result)
    {
        console.log(`Found a listing in the collection with the name '${nameOfListing}':`);
        console.log(result);
    }
    else
    {
        console.log(`No listings found with the name '${nameOfListing}'`);
    }
}

//part of the read of crud
async function findListingsWithMinimumBedroomsBathroomsAndMostRecentReviews(client,
    {
        minimumNumberOfBedrooms = 0,
        minimumNumberOfBathrooms = 0,
        maximumNumberOfResults = Number.MAX_SAFE_INTEGER
    } = {})
    {//function starts here
        const cursor = client.db("sample_airbnb").collection("listingsAndReviews").find(

            {
                bedrooms: {$gte: minimumNumberOfBedrooms},
                bathrooms: { $gte: minimumNumberOfBathrooms}
            }
        ).sort({ last_review: -1}).limit(maximumNumberOfResults);

        const results = await cursor.toArray();

        if(results.length > 0)
        {
            console.log(`Found listing(s) with at least ${minimumNumberOfBedrooms} bedrooms and 
            ${minimumNumberOfBathrooms} bathrooms:`);

            results.forEach((result, i) => {
                date = new Date(result.last_review).toDateString();

                console.log();
                console.log(`${i + 1}.name: ${result.name}`);
                console.log(`   _id: ${result._id}`);
                console.log(`   bedrooms: ${result.bedrooms}`);
                console.log(`   bathrooms: ${result.bathrooms}`);
                console.log(`   most recent review date: ${new Date(result.last_review).toDateString()}`);
            });
        }
        else
        {
            console.log(`No listings found with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms`);
        }
    }

    //part of the update of crud
    async function updateListingByName(client, nameOfListing, updatedListing)
    {
        const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateOne(
            {name: nameOfListing}, { $set: updatedListing });

        console.log(`${result.matchedCount} document(s) matched the query criteria.`);
        console.log(`${result.modifiedCount} document(s) was/were updated.`);
    }

    //part of the update of crud
    async function upsertListingByName(client, nameOfListing, updatedListing)
    {
        const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateOne(
            {name: nameOfListing}, { $set: updatedListing }, {upsert: true});

        console.log(`${result.matchedCount} document(s) matched the query criteria.`);

        if(result.upsertedCount > 0)
        {
            console.log(`One document was inserted with the id ${result.upsertedId._id}`);
        }
        else
        {
            console.log(`${result.modifiedCount} document(s) was/were updated.`);
        }

    }

    //part of the update of crud
    async function updateAllListingsToHavePropertyType(client)
    {
        const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateMany(
            {property_type: {$exists: false}}, {$set: {property_type: "Unknown"}}
        );

        console.log(`${result.matchedCount} document(s) matched the query criteria.`);
        console.log(`${result.modifiedCount} document(s) was/were updated.`);
    }

    //part of the delete of crud
    async function deleteListingByName(client, nameOfListing)
    {
        const result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteOne({name: nameOfListing});

        console.log(`${result.deletedCount} document(s) was/were deleted.`);
    }

    //part of the delete of crud
    async function deleteListingsScrapedBeforeDate(client, date)
    {
        const result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteMany({ "last_scraped": { $lt: date}});
        console.log(`${result.deletedCount} document(s) was/were deleted`);
    }