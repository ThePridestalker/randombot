const api = require('twitch-api-v5');
const configLoader = require('./configLoader');
// registered app on https://glass.twitch.tv/login and got a client ID
api.clientID = configLoader; // changed to upload to github


// pagina de documentacion: https://www.npmjs.com/package/twitch-api-v5

// devuelve el objeto con los datos de user en formato json
/* {
    _total: 1,
        users:
    [{
        display_name: 'nuuls',
        _id: '100229878',
        name: 'nuuls',
        type: 'user',
        bio: 'MingLee MingLee MingLee MingLee MingLee MingLee ',
        created_at: '2015-08-22T13:43:40.49432Z',
        updated_at: '2018-08-13T00:17:30.410488Z',
        logo: 'https://static-cdn.jtvnw.net/jtv_user_pictures/nuuls-profile_image-dc0324413f4870c6-300x300.png'
    }
    ]
} */
function getUserData(username) {
  api.users.usersByName({ users: username }, (err, res) => {
    if (err) { console.log(`ERROR:${err}`); }
    console.log(res);
    return res;
  });
}
getUserData('nuuls');
