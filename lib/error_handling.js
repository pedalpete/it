module.exports.onError = function(err,line,script){
    console.log('The following error occurred :'+err+' on line '+ line + ' in script '+script);
}