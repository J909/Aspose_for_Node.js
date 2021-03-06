var Utils = require('./utils');
var path = require('path');
var fs = require('fs');
var AsposeStorage = require('./aspose-storage');

function AsposeBarcode(config) {
	this.appSID = config.appSID;
	this.appKey = config.appKey;
	this.baseURI = config.baseURI;
}

/* Creation Methods */

AsposeBarcode.prototype.save = function(codeText,symbology,imageFormat,callback){
    codeText = typeof codeText !== 'undefined' ? codeText : '';
    symbology = typeof symbology !== 'undefined' ? symbology : 'QR';
    imageFormat = typeof imageFormat !== 'undefined' ? imageFormat : 'png';

    if(codeText === ''){
        throw new Error('Code text not provided.');
    }

    var strURI = this.baseURI + 'barcode/generate?text=' + codeText + '&type=' + symbology + '&format=' + imageFormat;
    var signedURI = Utils.Sign(strURI,this.appSID,this.appKey);

    Utils.ProcessCommandContent('GET',signedURI,'',function(data){

        if(typeof callback === 'function'){
            callback.call(null,data);
        }
    });

};

/* Reader Methods */

AsposeBarcode.prototype.readLocal = function(fileStream,symbology,callback){
    fileStream = typeof fileStream !== 'undefined' ? fileStream : '';
    symbology = typeof symbology !== 'undefined' ? symbology : '';

    if(fileStream === ''){
        throw new Error('File stream not provided.');
    }

    var strURI = this.baseURI + 'storage/file/barcode.png';
    var signedURI = Utils.Sign(strURI,this.appSID,this.appKey);

    var baseURI = this.baseURI;
    var appSID = this.appSID;
    var appKey = this.appKey;

    Utils.UploadFileBinary('PUT',signedURI,fileStream,function(response){
        if(response.Status === 'OK'){

            var strURI = baseURI + 'barcode/recognize?url=' + baseURI + 'storage/file/barcode.png';
            if(symbology == ''){
                strURI = strURI + '&type=' + symbology;
            }

            var signedURI = Utils.Sign(strURI,appSID,appKey);

            Utils.ProcessCommand('POST',signedURI,'',function(data){

                if(typeof callback === 'function'){
                    if(data.Status === 'OK'){
                        callback.call(null,data.Barcodes);
                    } else {
                        throw new Error(data.Message);
                    }
                }
            });

        }
    });
};

AsposeBarcode.prototype.readExternal = function(url,symbology,callback){
    url = typeof url !== 'undefined' ? url : '';
    symbology = typeof symbology !== 'undefined' ? symbology : '';

    if(url === ''){
        throw new Error('External url not defined.');
    }

    var strURI = this.baseURI + 'barcode/recognize?url=' + url;
    if(symbology == ''){
        strURI = strURI + '&type=' + symbology;
    }

    var signedURI = Utils.Sign(strURI,this.appSID,this.appKey);

    Utils.ProcessCommand('POST',signedURI,'',function(data){

        if(typeof callback === 'function'){
            if(data.Status === 'OK'){
                callback.call(null,data.Barcodes);
            } else {
                throw new Error(data.Message);
            }
        }
    });

};

AsposeBarcode.prototype.read = function(fileName,symbology,callback){
    fileName = typeof fileName !== 'undefined' ? fileName : '';
    symbology = typeof symbology !== 'undefined' ? symbology : '';

    if(fileName === ''){
        throw new Error('Filename not defined.');
    }

    var strURI = this.baseURI + 'barcode/' + fileName + '/recognize';
    if(symbology == ''){
        strURI = strURI + '?type=' + symbology;
    }

    var signedURI = Utils.Sign(strURI,this.appSID,this.appKey);

    Utils.ProcessCommand('GET',signedURI,'',function(data){
        if(typeof callback === 'function'){
            if(data.Status === 'OK'){
                callback.call(null,data.Barcodes);
            } else {
                throw new Error(data.Message);
            }
        }
    });

};

module.exports = AsposeBarcode;