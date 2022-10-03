var api = require("../apiClient")
var imageGenerator = require("../utilities/imageGenerator")

module.exports = {
    name : "/hacktoberfest",
    // description : "",
    async execute(client, message, user) {
        
        await api.getHacktoberfestData().then( async(certificates) => {

            Array.isArray(certificates) ? certificates = certificates : certificates = [];
            
            var data = {
                id: message.author.id,
                certificateId : 'INO2022HBF' + (certificates.length + 1).toString().padStart(3, '0')
            }

            await api.getExtUserData(user.id).then(async (userData) => {
                data.name = userData.name;
                imageGenerator.execute(data);
            }).catch((error) => {
                console.log(error);
            })

            await api.postHacktoberfestData(data).then((response) => {
                console.log(response);
            }).catch((error) => {
                console.log(error);
            })

        }).catch((error) => {
            console.log(error);
        })
    }
}