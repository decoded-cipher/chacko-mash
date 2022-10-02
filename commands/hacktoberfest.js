var api = require("../apiClient")

module.exports = {
    name : "/hacktoberfest",
    // description : "",
    execute(client, message, user) {
        var data = {
            id: message.author.id,
            certificateURL: 'https://www.arjunkrishna.in/static/media/resume.b88b9257.pdf',
        }
                
        api.postHacktoberfestData(data).then((response) => {
            console.log(response);
        }).catch((error) => {
            console.log(error);
        })
    }
}