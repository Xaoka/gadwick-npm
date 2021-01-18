const Axios = require(`axios`);
const gadwickEndpoint = "https://3i07lk1jl8.execute-api.us-east-1.amazonaws.com";
/** Returns { error: string } or { id: string } */
async function reportResult(config, testName, passed, version, reason)
{
    if (testName.length > 0)
    {
        const id = config.idMap.names[testName];
        if (!id)
        {
            console.warn(`Could not find a Gadwick feature ID for "${testName}" - you may need to run "gadwick update"`)
        }
        else
        {
            console.log(`Uploading results of the test suite for feature "${testName}" (${id})`);
            try
            {
                const response = await Axios.post(`${gadwickEndpoint}/results`, { feature_id: id, passed, version, api_key: config.api_key, automated: "TRUE" });
                // console.dir(response);
                return response.data;
            }
            catch (err)
            {
                console.warn(`Failed to upload result for feature "${testName} (${id})"`);
                console.log(err);
            }
        }
    }
}

module.exports = reportResult;