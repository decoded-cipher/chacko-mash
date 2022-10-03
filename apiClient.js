var axios = require('axios').default;
axios.defaults.baseURL = process.env.API_BASE_URL;
axios.defaults.headers.common['Authorization'] = 'Bearer ' + process.env.INOVUS_AUTH_TOKEN;

module.exports = {

    getExtUserData: (id) => {
        return new Promise(async (resolve, reject) => {
            await axios.get('/user/ext', {
                    params: {
                        id: id
                    }
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    },

    getBdayUser: (day, month) => {
        return new Promise(async (resolve, reject) => {
            await axios.get('/bday', {
                    params: {
                        dd: day,
                        mm: month
                    }
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    },

    postHacktoberfestData: (data) => {
        return new Promise(async (resolve, reject) => {

            await axios.post('/hacktoberfest', data)
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                reject(error);
            });
            
        });
    },

    getHacktoberfestData: () => {
        return new Promise(async (resolve, reject) => {

            await axios.get('/hacktoberfest')
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                reject(error);
            });
            
        });
    }
}