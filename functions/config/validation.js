const isEmpty = string => {
  if (string.trim() === "") return true;
  else return false;
};
const isEmail = email => {
  const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regex)) return true;
  else return false;
};

const isvalidPassword = password =>{
  const decimal=  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
  if(password.match(decimal)) return true;
  else return false;
}
exports.loginValidate = data => {
  let errors = {};
  if (isEmpty(data.email)) errors.email = "This field must not be empty";
  if (!isEmpty(data.email) && !isEmail(data.email))
    errors.email = "Bad email format";
  if (isEmpty(data.password)) errors.password = "This field must not be empty";

  return {
    errors,
    valid: Object.keys(errors).length == 0 ? true : false
  };
};
exports.profileValidate = data => {
  let errors = {};

  if(isEmpty(data.fname)) errors.fname = "This field must not be empty";
  if(isEmpty(data.lname)) errors.lname = "This field must not be empty";
  if(isEmpty(data.email)) errors.email = "This field must not be empty";
  if (!isEmpty(data.email) && !isEmail(data.email))
    errors.email = "Bad email format";
   
    return {
    errors,
    valid: Object.keys(errors).length == 0 ? true : false
    }
}
exports.passwordValidate = data => {
  let errors = {};

  if(isEmpty(data.old)) errors.old = "This field must not be empty";
  if(isEmpty(data.new)) errors.new = "This field must not be empty";
  if(isEmpty(data.confirm)) errors.confirm = "This field must not be empty";
  if(!(data.new === data.confirm)) errors.general = "Passwords must match"
  if (!isvalidPassword(data.new))


    errors.password = "Your password must: Not be less than 8 characters,Contain at least one lowercase letter,Contain at least one uppercase letter,Contain at least one numeric digit,Contain at least one special character($,@,!,..) ";
   
    return {
    errors,
    valid: Object.keys(errors).length == 0 ? true : false
    }
}