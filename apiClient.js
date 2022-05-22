var axios = require('axios').default;
axios.defaults.baseURL = process.env.API_BASE_URL;
axios.defaults.headers.common['Authorization'] = 'Bearer ' + process.env.INOVUS_AUTH_TOKEN;

module.exports = {

    getUserData: (id) => {
        return new Promise(async (resolve, reject) => {
            await axios.get('/user', {
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
    }
}