exports.dateToString = date => {
    let hr = date.getHours();
    let min = date.getMinutes();
    if (min < 10) {
        min = "0" + min;
    }
    return `
        ${ 
            hr
        }:${ 
            min
        } ${
            date.toDateString()
        }`
}