exports.form = function form(val) {
    if (val < 10) return '0' + val
    else return val
}