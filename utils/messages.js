import moment from "moment";
function formatemessage(username,text){
    return{
        username,
        text,
        time:moment().format('h:mm a')
    }
}

export default formatemessage;