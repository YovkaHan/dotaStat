/**
 * Created by Jordan3D on 3/17/2018.
 */
const address = module.exports;

module.exports.getAddress = function(request) {
    let rawStr = request.connection.remoteAddress;
    let addrItself = rawStr.slice(rawStr.lastIndexOf(':')+1);
    return addrItself;
}