const prompt = require('prompt-sync')({sigint: true});
const fs = require('fs');
const Axios = require(`axios`);

const gadwickEndpoint = "http://localhost:3003";

async function configureGadwick()
{
    const userID = prompt("User ID: ")
    let user;
    try
    {
        const response = await Axios.get(`${gadwickEndpoint}/users/auth/${userID}`);
        user = response.data[0];
        console.log(`Verified user account, user ID ${user.id}`)
    }
    catch (error)
    {
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
            clientSecret = prompt("Client Secret: ");
        }
        while (clientSecret.length === 0)
    }
    
    fs.writeFile(`gadwick-config.json`, JSON.stringify({ test_directory, clientSecret }, null, 2), (err) => {
    })
}

module.exports = { configureGadwick }