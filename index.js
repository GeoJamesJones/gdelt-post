const fs = require('fs');
const path = require('path');
const request = require('request');
const chokidar = require('chokidar');


function readFile (filepath){
    fs.readFile(filepath, 'utf8', function(err, contents) {
        if (err) {
            console.log(err)
        }
        else {
            console.log('File', filepath, 'has been added');
            let sentiment_params = {
                method : 'POST',
                rejectUnauthorized: false,
                url : 'https://wdcrealtime.esri.com:6143/geoevent/rest/receiver/gdelt-geojson-in',
                headers : {
                    'Content-Type': 'application/json'
                },
                body: contents
            };
    
            sendRequest(sentiment_params);
    
            var newPath = path.join(complete_path, filepath.split('/')[1])
    
            fs.rename(filepath, newPath, function (err) {
                if (err) throw err
                console.log('Successfully renamed - AKA moved!')
            })
        }
    }); 
};

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

let dirpath = './geojson';
let complete_path = './finished';

let watcher = chokidar.watch(dirpath, {ignored: /^\./, persistent: true});
    
watcher
    .on('add', function(path) {readFile(path);})
    //.on('add', function(path) {console.log('File', path, 'has been added');})
    .on('change', function(path) {console.log('File', path, 'has been changed');})
    .on('unlink', function(path) {console.log('File', path, 'has been removed');})
    .on('error', function(error) {console.error('Error happened', error);})