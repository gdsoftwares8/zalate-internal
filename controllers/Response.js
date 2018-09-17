/**
 * Response object to sent to
 */
exports.RequestStatus = {
    Success: 1,
    Fail: 0,
    NotRegistered: 2
};
exports.createResponse = function (requestStatus, errorMessage, data, dataCount, limit) {
    return {
        Status: requestStatus,
        Message: errorMessage,
        Data: data,
        DataCount: dataCount,
        Limit: limit
    };
};