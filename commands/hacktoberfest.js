var api = require("../apiClient")

module.exports = {
    name : "/hacktoberfest",
    // description : "",
    async execute(client, message, user) {
        await api.getHacktoberfestData().then( async(certificates) => {

            Array.isArray(certificates) ? certificates = certificates : certificates = [];

            var data = {
                id: message.author.id,
                certificateURL: 'https://www.arjunkrishna.in/static/media/resume.b88b9257.pdf',
                certificateId : 'INO2022HBF' + (certificates.length + 1).toString().padStart(3, '0')
            }

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