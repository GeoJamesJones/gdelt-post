const fs = require('fs');
const path = require('path');
const request = require('request');

function promiseAllP(items, block) {
    var promises = [];
    items.forEach(function(item,index) {
        promises.push( function(item,i) {
            return new Promise(function(resolve, reject) {
                return block.apply(this,[item,index,resolve,reject]);
            });
        }(item,index))
    });
    return Promise.all(promises);
} //promiseAll

function readFiles(dirname) {
    return new Promise((resolve, reject) => {
        fs.readdir(dirname, function(err, filenames) {
            if (err) return reject(err);
            promiseAllP(filenames,
            (filename,index,resolve,reject) =>  {
                fs.readFile(path.resolve(dirname, filename), 'utf-8', function(err, content) {
                    if (err) return reject(err);
                    return resolve({filename: filename, contents: content});
                });
            })
            .then(results => {
                return resolve(results);
            })
            .catch(error => {
                return reject(error);
            });
        });
  });
}

async function post (options) {
    return new Promise((resolve, reject) => {
      request.post(options, (error, response, body) => {
        if (error) return reject(error)
  
        return resolve({ body, response })
      })
    })
  };

async function sendRequest (options) {
    try {
      let { response, body } = await post(options);

      if (response.statusCode === 200){
        console.log('Success!')
      }
      try {
        let jsonResponse = (JSON.parse(body));
      
        return jsonResponse;
      } catch (err) {
          let jsonResponse = (body);
        
          return jsonResponse;
      }

    }
    catch (err) {
      console.error(err);
      return "Error";
    }
  }

let dirpath = './geojson'

readFiles(dirpath)
    .then(files => {
        console.log( "loaded ", files.length );
        files.forEach( (item, index) => {
            console.log( "item",index, "size ", item.contents.length);

            let sentiment_params = {
                method : 'POST',
                rejectUnauthorized: false,
                url : 'https://wdcrealtime.esri.com:6143/geoevent/rest/receiver/gdelt-geojson-in',
                headers : {
                    'Content-Type': 'application/json'
                },
                body: item.contents
            };
    
            sendRequest(sentiment_params);
        });
    })
    .catch( error => {
        console.log( error );
    });