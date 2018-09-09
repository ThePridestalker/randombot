
const fs = require('fs');

let time = new Date();

function updateTime() { // re inicializo la variable
  time = new Date();
}

module.exports = {

  saveDate() {
    updateTime();
    // el time se crea una vez sola y por eso siempre se guarda la misma fecha
    fs.writeFileSync('assets/lastMsgDate.txt', time, 'utf8');
  },


  compareTimes() {
    // leer el fichero

    const oldTimeBUFFER = fs.readFileSync('assets/lastMsgDate.txt');
    const oldTime = Date.parse(oldTimeBUFFER);
    updateTime();

    console.log(time - oldTime); // tiempo en milisegundos


    // la fecha actual menos la fecha de la variable time devuelven milisegundos,
    // si la diferencia es menor que 2000 doy false
    if ((time - oldTime) > 2000) {
      return true;
    }
    return false;
  },

  // uso la fecha de creacion de cuenta para probar
  // created_at es la fecha de creacion del follow
  // created_at: '2015-08-22T13:43:40.49432Z'
  followAgeCalc(createdAt) {
    // var d = new Date("2015-03-25T12:00:00Z");
    const followDate = new Date(createdAt);
    return time - followDate;
  },
};
