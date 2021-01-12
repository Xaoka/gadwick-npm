const prompt = require('prompt-sync')({sigint: true});
const fs = require('fs');
const Axios = require(`axios`);

const gadwickEndpoint = "https://3i07lk1jl8.execute-api.us-east-1.amazonaws.com";

async function configureGadwick()
{
    const userKey = prompt("User API Key (Can be found at https://gadwick.co.uk/dashboard/settings): ");
    let user;
    try
    {
        const response = await Axios.get(`${gadwickEndpoint}/users/key/${userKey}`);
        user = response.data[0];
        console.log(`Verified user account for ${user.name}.`)
    }
    catch (error)
    {
        console.log(error)
        console.error(`Could not get user from Gadwick servers`);
        process.exit(1);
    }

    let test_directory = prompt('Specify the path to your test directory: ');
    if (test_directory.length === 0) { test_directory = "." }
    console.log(test_directory);
    
    let isExistingApp;
    do
    {
        isExistingApp = prompt("Are you linking an existing Gadwick application? (Y/N): ");
    }
    while (!isExistingApp.toLocaleLowerCase() == "Y" && !isExistingApp.toLocaleLowerCase() == "N")

    let clientSecret;
    if (isExistingApp.toLocaleLowerCase() == "n")
    {
        let appName;
        let appDescription;

        if (fs.statSync("package.json").isFile()) {
            const data = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            appName = data.name;
            appDescription = data.description;
        }
        else
        {
            appName = prompt("App Name: "); // TODO: Unique
            appDescription = prompt("App Description: ");
        }
        // Create a new app on Gadwick
        try
        {
            console.log(`Creating application "${appName}" on Gadwick...`)
            const app = await Axios.post(`${gadwickEndpoint}/applications`, { name: appName, description: appDescription, user_id: user.id });
            clientSecret = app.client_secret;
            console.log(`"${appName}" created successfully.`);
        }
        catch (error)
        {
            console.error(`Failed to create an app on Gadwick:\n${error}`)
            process.exit(1);
        }
    }
    else
    {
        // Save credentials
        do
        {
            clientSecret = prompt("Application Client Secret (Found on the app's settings page) : ");
        }
        while (clientSecret.length === 0)
    }
    
    fs.writeFile(`gadwick-config.json`, JSON.stringify({ test_directory, client_secret: clientSecret, api_key: userKey }, null, 2), (err) => {
    })
    console.log(`Configuration complete. Run "gadwick update" to pull your features from gadwick`);
}

module.exports = { configureGadwick }