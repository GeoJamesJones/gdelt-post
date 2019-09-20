const fs = require('fs');
const path = require('path');
const request = require('request');
var chokidar = require('chokidar');

function readFiles(dirname, onFileContent, onError) {
    fs.readdir(dirname, function(err, filenames) {
      if (err) {
        onError(err);
        return;
      }
      filenames.forEach(function(filename) {
        fs.readFile(dirname + filename, 'utf-8', function(err, content) {
          if (err) {
            onError(err);
            return;
          }
          onFileContent(filename, content);
        });
      });
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



    

var watcher = chokidar.watch('dirpath', {ignored: /^\./, persistent: true});
    
watcher
    .on('add', function(path) {readFiles(path)
                                    .then(files => {
                                        console.log( "loaded ", files.length );
                                        files.forEach( (item, index) => {
                                            console.log( "item",index, "size ", item.contents.length, "name",item.filename);
                                
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
                                
                                            var oldPath = dirpath + '/' + item.filename;
                                            var newPath = complete_path + '/' + item.filename;
                                
                                            fs.rename(oldPath, newPath, function (err) {
                                                if (err) throw err
                                                console.log('Successfully renamed - AKA moved!')
                                            })
                                
                                        });
                                    })
                                    .catch( error => {
                                        console.log( error );
                                    });;})
    .on('change', function(path) {console.log('File', path, 'has been changed');})
    .on('unlink', function(path) {console.log('File', path, 'has been removed');})
    .on('error', function(error) {console.error('Error happened', error);})