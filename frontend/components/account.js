function Validate(options){

    function check(rule, formEl) {
        inputEl = formEl.querySelector(rule.selector);
        errorEl = inputEl.nextElementSibling;
        // when user blur the input file
        var rules = selectorRules[rule.selector];
        for(let i = 0; i < rules.length; i++){
            errorMessage = rules[i](inputEl.value);
            if(errorMessage){
                break;
            }
        }

        if(errorMessage){
            errorEl.innerText = errorMessage
        }else{
            errorEl.innerText = '';
        }
        return !errorMessage;
    }


    let formEl = document.querySelector(options.form);
    var selectorRules = {};
    options.rules.forEach(rule =>{
        if(Array.isArray(selectorRules[rule.selector])){
            selectorRules[rule.selector].push(rule.test);
        }else{
            selectorRules[rule.selector] = [rule.test];
        }
        var inputElements = formEl.querySelectorAll(rule.selector);
        Array.from(inputElements, (inputElement) =>{
            inputElement.onblur = function(e){
                check(rule, formEl);
            }

            inputElement.oninput = function(e) {
                inputEl = formEl.querySelector(rule.selector);
                errorEl = e.target.nextElementSibling;
                errorEl.innerText = '';
            }
        })
        
    })
    
    // When user click submit button
    formEl.addEventListener('submit', (e) =>{
        e.preventDefault();
        let isValid = true;
        options.rules.forEach((rule, index) =>{
            console.log(rule, index)
            isValid = check(rule, formEl);
        })
        if(isValid){
            var enableInputs = formEl.querySelectorAll('[name]');
            var values = [];
            var formValues = Array.from(enableInputs, formInput =>{
                values[formInput.name] = formInput.value;
            })

            callAPI(values);
            
        }
    })

    function callAPI(data){
        fetch('http://localhost:8000/profile')
        .then(response => response.json())
        .then(data => {
            // Handle the response data
            console.log(data);
        })
        .catch(error => {
            // Handle any errors
            console.error('Error:', error);
        });
    }
}

Validate.isRequired = function (selector, mes) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : mes || 'Please enter this filed';
        }
    };
}

Validate.isSame = function (form,selector, confrimSelector) {
    return {
        selector: confrimSelector,
        test: function (value) {
            let formEl = document.querySelector(form);
            return formEl.querySelector(selector).value === value ? undefined : 'Confirm password is incorect'
        }
    }
}
Validate.isEmail = function (selector, mes) {
    return {
        selector: selector,
        test: function (value) {
            let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : mes || 'Please enter this filed';
        }
    };
}

Validate.requiredLength = function(selector, length){
    return {
        selector: selector,
        test: function (value){
            return value.length >= length ? undefined : `Password required at least ${length} charactor`
        }
    }
}
Validate({
    form: '#login-form',
    rules: [
        Validate.isRequired('.username', 'Please enter your username'),
        Validate.isRequired('.password', 'Please enter your password'),
        Validate.requiredLength('.password', 6)
    ]
})

Validate({
    form: '#register-form',
    rules: [
        Validate.isRequired('.username', 'Please enter your username'),
        Validate.isRequired('.password', 'Please enter your password'),
        Validate.requiredLength('.password', 6),
        Validate.isEmail('.email', 'Please enter valid email'),
        Validate.isRequired('.password-repeat', 'Please enter your confirm password', 6),
        Validate.requiredLength('.password-repeat', 6),
        Validate.isSame('#register-form' , '.password', '.password-repeat')
    ]
})